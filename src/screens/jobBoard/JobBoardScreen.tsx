import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import {
  createWorkItem,
  dateKeyFromChoice,
  dueChoice,
  dueLabel,
  jobProgress,
  KIND_ICONS,
  KIND_LABELS,
  localDateKey,
  materialProgress,
  sortWorkItems,
  toggleWorkItem,
  type Job,
  type JobBoardData,
  type MaterialLine,
  type WorkItem,
  type WorkItemKind,
  type WorkItemPriority,
} from "../../utils/jobBoard/jobBoard";
import { loadJobBoard, saveJobBoard } from "../../utils/storage/jobBoardStorage";
import { formatJobList, formatMaterialRun } from "../../utils/jobBoard/shareList";
import { styles } from "./styles";

type BoardView = "today" | "materials" | "jobs" | "done";

const KINDS: WorkItemKind[] = ["task", "material", "note"];
const TABS: { id: BoardView; label: string }[] = [
  { id: "today", label: "My List" },
  { id: "materials", label: "Materials" },
  { id: "jobs", label: "Jobs" },
];

type DueChoice = "none" | "today" | "tomorrow";

const DUE_LABELS: Record<DueChoice, string> = {
  none: "No date",
  today: "Today",
  tomorrow: "Tomorrow",
};

function pulse(style: "selection" | "success" = "selection") {
  if (style === "success") {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  } else {
    Haptics.selectionAsync().catch(() => {});
  }
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function itemMeta(item: WorkItem, jobs: Job[]) {
  const job = jobs.find(({ id }) => id === item.jobId)?.name;
  return [job, item.location, item.dueOn ? dueLabel(item.dueOn) : null]
    .filter(Boolean)
    .join("  •  ");
}

export default function JobBoardScreen() {
  const [data, setBoardData] = useState<JobBoardData>({ jobs: [], items: [] });
  const dataRef = useRef(data);
  const saveQueue = useRef(Promise.resolve());
  const revision = useRef(0);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [undoAction, setUndoAction] = useState<null | (() => void)>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [materialName, setMaterialName] = useState("");
  const [materialQuantity, setMaterialQuantity] = useState(1);
  const [materialUnit, setMaterialUnit] = useState("ea");
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<BoardView>("today");
  const [quickKind, setQuickKind] = useState<WorkItemKind>("task");
  const [quickTitle, setQuickTitle] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [draft, setDraft] = useState<WorkItem | null>(null);
  const [checklistText, setChecklistText] = useState("");
  const [materialText, setMaterialText] = useState("");
  const [attachedQuantity, setAttachedQuantity] = useState(1);
  const [attachedUnit, setAttachedUnit] = useState("ea");
  const [materialJobId, setMaterialJobId] = useState<string | null>(null);
  const [shareError, setShareError] = useState("");
  const [shareFeedback, setShareFeedback] = useState("");
  const [newJobName, setNewJobName] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  function reloadBoard() {
    loadJobBoard().then((board) => {
      dataRef.current = board;
      setBoardData(board);
      setLoaded(true);
    }).catch(() => setSaveError("Couldn't load your saved board. Retry to protect your existing work."));
  }
  useEffect(() => {
    reloadBoard();
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  function commitBoard(next: JobBoardData | ((current: JobBoardData) => JobBoardData)): Promise<boolean> {
    if (!loaded) return Promise.resolve(false);
    const board = typeof next === "function" ? next(dataRef.current) : next;
    dataRef.current = board;
    setBoardData(board);
    const version = ++revision.current;
    setSaving(true);
    setSaveError("");
    const result = saveQueue.current.then(async () => {
      try {
        await saveJobBoard(board);
        if (version === revision.current) setSaveError("");
        return true;
      } catch {
        if (version === revision.current) setSaveError("Changes aren't saved yet. Keep this screen open and retry.");
        return false;
      } finally {
        if (version === revision.current) setSaving(false);
      }
    });
    saveQueue.current = result.then(() => {});
    return result;
  }

  function openItem(item: WorkItem) {
    setChecklistText(""); setMaterialText(""); setAttachedQuantity(1); setAttachedUnit("ea");
    setDraft({ ...item, checklist: [...item.checklist], materials: [...item.materials] });
  }

  const openItems = useMemo(
    () => sortWorkItems(data.items.filter(({ status }) => status === "open")),
    [data.items],
  );
  const doneItems = useMemo(
    () => sortWorkItems(data.items.filter(({ status }) => status === "done")),
    [data.items],
  );
  const todayKey = localDateKey();
  const myDayItems = openItems.filter((item) => !item.dueOn || item.dueOn <= todayKey);
  const laterItems = openItems.filter((item) => !!item.dueOn && item.dueOn > todayKey);
  function flash(message: string) {
    setSavedMessage(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setSavedMessage(""), 2200);
  }

  function addQuickItem() {
    const title = quickTitle.trim();
    if (!title) return;
    const item = createWorkItem(makeId("item"), quickKind, title);
    commitBoard((current) => ({ ...current, items: [item, ...current.items] }));
    setQuickTitle("");
    Keyboard.dismiss();
    pulse("success");
    flash(`${KIND_LABELS[quickKind]} added`);
  }

  function updateItem(next: WorkItem) {
    return commitBoard((current) => ({
      ...current,
      items: current.items.map((item) => item.id === next.id ? next : item),
    }));
  }

  function toggleItem(item: WorkItem) {
    pulse(item.status === "open" ? "success" : "selection");
    updateItem(toggleWorkItem(item));
    setUndoAction(() => () => {
      commitBoard((current) => ({ ...current, items: current.items.map((candidate) => candidate.id === item.id
        ? { ...candidate, status: item.status, completedAt: item.completedAt, updatedAt: Date.now() } : candidate) }));
    });
  }

  async function saveDraft() {
    if (!draft?.title.trim()) return;
    // Timestamp is captured only in the Save event, never while rendering.
    // eslint-disable-next-line react-hooks/purity
    const nextDraft = { ...draft, title: draft.title.trim(), updatedAt: Date.now(),
      checklist: checklistText.trim() ? [...draft.checklist, { id: makeId("check"), label: checklistText.trim(), done: false }] : draft.checklist,
      materials: materialText.trim() && draft.kind !== "material" ? [...draft.materials, { id: makeId("mat"), name: materialText.trim(), quantity: attachedQuantity, unit: attachedUnit, collected: false }] : draft.materials };
    if (!await updateItem(nextDraft)) return;
    setDraft(null);
    Keyboard.dismiss();
    pulse("success");
    flash("Changes saved");
  }

  function deleteDraft() {
    if (!draft) return;
    const remove = () => {
      const removed = draft;
      setUndoAction(() => () => { commitBoard((current) => ({ ...current, items: current.items.some((item) => item.id === removed.id)
        ? current.items : [{ ...removed, jobId: current.jobs.some((job) => job.id === removed.jobId) ? removed.jobId : null }, ...current.items] })); });
      commitBoard((current) => ({
        ...current,
        items: current.items.filter(({ id }) => id !== draft.id),
      }));
      setDraft(null);
      pulse();
      flash("Item deleted");
    };
    if (Platform.OS === "web") {
      if (globalThis.confirm?.("Delete this item?")) remove();
      return;
    }
    Alert.alert("Delete this item?", "This removes it from your Jobsite Lists.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: remove },
    ]);
  }

  function addJob() {
    const name = newJobName.trim();
    if (!name) return;
    // Timestamp is captured only in the Add job event.
    // eslint-disable-next-line react-hooks/purity
    const job: Job = { id: makeId("job"), name, createdAt: Date.now() };
    commitBoard((current) => ({ ...current, jobs: [...current.jobs, job] }));
    setNewJobName("");
    Keyboard.dismiss();
    pulse("success");
    flash("Job created");
  }

  function deleteJob(job: Job) {
    const remove = () => {
      const assignedIds = dataRef.current.items.filter((item) => item.jobId === job.id).map((item) => item.id);
      setUndoAction(() => () => { commitBoard((current) => ({
        jobs: current.jobs.some((candidate) => candidate.id === job.id) ? current.jobs : [...current.jobs, job],
        items: current.items.map((item) => assignedIds.includes(item.id) && item.jobId === null ? { ...item, jobId: job.id } : item),
      })); });
      commitBoard((current) => ({
        jobs: current.jobs.filter(({ id }) => id !== job.id),
        items: current.items.map((item) => item.jobId === job.id ? { ...item, jobId: null } : item),
      }));
      if (selectedJobId === job.id) setSelectedJobId(null);
      if (materialJobId === job.id) setMaterialJobId(null);
      flash("Job removed");
    };
    if (Platform.OS === "web") {
      if (globalThis.confirm?.(`Remove ${job.name}?`)) remove();
      return;
    }
    Alert.alert(
      `Remove ${job.name}?`,
      "Its work items will stay safe in My List.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: remove },
      ],
    );
  }

  function addChecklistLine() {
    const label = checklistText.trim();
    if (!draft || !label) return;
    setDraft({
      ...draft,
      checklist: [...draft.checklist, { id: makeId("check"), label, done: false }],
    });
    setChecklistText("");
  }

  function addMaterialLine() {
    const name = materialText.trim();
    if (!draft || !name) return;
    setDraft({
      ...draft,
      materials: [...draft.materials, { id: makeId("mat"), name, quantity: attachedQuantity, unit: attachedUnit, collected: false }],
    });
    setMaterialText("");
  }

  function toggleNestedMaterial(itemId: string, lineId: string) {
    const previous = dataRef.current.items.find((item) => item.id === itemId)?.materials.find((line) => line.id === lineId)?.collected;
    setUndoAction(() => () => { commitBoard((current) => ({ ...current, items: current.items.map((item) => item.id === itemId
      ? { ...item, materials: item.materials.map((line) => line.id === lineId ? { ...line, collected: previous ?? false } : line) } : item) })); });
    commitBoard((current) => ({
      ...current,
      items: current.items.map((item) => item.id === itemId ? {
        ...item,
        materials: item.materials.map((line) => line.id === lineId
          ? { ...line, collected: !line.collected }
          : line),
        updatedAt: Date.now(),
      } : item),
    }));
    pulse();
  }

  async function exportList(text: string, copy: boolean) {
    setShareError("");
    setShareFeedback("");
    try {
      if (copy || Platform.OS === "web") {
        await Clipboard.setStringAsync(text);
        setShareFeedback("List copied");
      } else {
        await Share.share({ message: text });
      }
    } catch { setShareError("Couldn't share the list. Try Copy list instead."); }
  }
  function shareButtons(text: string) {
    return <View style={styles.choiceRow}>
      <Pressable accessibilityRole="button" onPress={() => { void exportList(text, true); }} style={styles.completedLink}><Text style={styles.completedLinkText}>Copy list</Text></Pressable>
      {Platform.OS !== "web" ? <Pressable accessibilityRole="button" onPress={() => { void exportList(text, false); }} style={styles.completedLink}><Text style={styles.completedLinkText}>Share list</Text></Pressable> : null}
    </View>;
  }

  function renderWorkList(items: WorkItem[], emptyTitle: string, emptyHint: string) {
    if (!items.length) {
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>✓</Text>
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptyHint}>{emptyHint}</Text>
        </View>
      );
    }
    return (
      <View style={styles.itemList}>
        {items.map((item) => (
          <WorkItemRow
            item={item}
            jobs={data.jobs}
            key={item.id}
            onOpen={() => {
              pulse();
              openItem(item);
            }}
            onToggle={() => toggleItem(item)}
          />
        ))}
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Return to toolbox home"
          accessibilityRole="button"
          onPress={() => router.replace("/")}
          style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}
        >
          <Text style={styles.homeButtonText}>← Home</Text>
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Jobsite Lists</Text>
        </View>
        <View style={styles.openBadge}>
          <Text style={styles.openBadgeNumber}>{openItems.length}</Text>
          <Text style={styles.openBadgeLabel}>OPEN</Text>
        </View>
      </View>

      <View style={styles.boardStatus}>
        {shareFeedback ? <Text style={styles.sectionHint}>{shareFeedback}</Text> : null}
        {shareError ? <Text style={styles.errorText}>{shareError}</Text> : null}
        {saveError ? <><Text style={styles.errorText}>{saveError}</Text>
          <Pressable accessibilityRole="button" onPress={() => loaded ? void commitBoard(dataRef.current) : reloadBoard()} style={styles.completedLink}><Text style={styles.completedLinkText}>Retry</Text></Pressable></>
          : saving ? <Text style={styles.sectionHint}>Saving…</Text> : !loaded ? <Text style={styles.sectionHint}>Loading your board…</Text> : null}
        {undoAction ? <Pressable accessibilityRole="button" onPress={() => { undoAction(); setUndoAction(null); }} style={styles.completedLink}><Text style={styles.completedLinkText}>Undo last change</Text></Pressable> : null}
      </View>
      <View pointerEvents={loaded ? "auto" : "none"} style={styles.tabBar}>
        {TABS.map((tab) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: view === tab.id }}
            key={tab.id}
            onPress={() => {
              pulse();
              setView(tab.id);
            }}
            style={[styles.tab, view === tab.id && styles.tabSelected]}
          >
            <Text style={[styles.tabText, view === tab.id && styles.tabTextSelected]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        pointerEvents={loaded ? "auto" : "none"}
        bounces={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {view === "today" ? (
          <>
            <View style={styles.quickCard}>
              <View style={styles.quickInputRow}>
                <TextInput
                  accessibilityLabel={`Add ${KIND_LABELS[quickKind].toLowerCase()}`}
                  blurOnSubmit={false}
                  onChangeText={setQuickTitle}
                  onSubmitEditing={addQuickItem}
                  placeholder={quickPlaceholder(quickKind)}
                  placeholderTextColor="#65717D"
                  returnKeyType="done"
                  style={styles.quickInput}
                  value={quickTitle}
                />
                <Pressable
                  accessibilityLabel="Add to Jobsite Lists"
                  accessibilityRole="button"
                  disabled={!loaded || !quickTitle.trim()}
                  onPress={addQuickItem}
                  style={({ pressed }) => [
                    styles.addButton,
                    !quickTitle.trim() && styles.addButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                    <Text style={styles.addButtonText}>Add</Text>
                </Pressable>
              </View>
              <View style={styles.kindRow}>
                {KINDS.map((kind) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: quickKind === kind }}
                    key={kind}
                    onPress={() => {
                      pulse();
                      setQuickKind(kind);
                    }}
                    style={[styles.kindChip, quickKind === kind && styles.kindChipSelected]}
                  >
                    <Text style={[styles.kindIcon, quickKind === kind && styles.kindTextSelected]}>{KIND_ICONS[kind]}</Text>
                    <Text style={[styles.kindText, quickKind === kind && styles.kindTextSelected]}>{KIND_LABELS[kind]}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.sectionRow}>
              <View>
                <Text style={styles.sectionTitle}>My List</Text>
              </View>
              <Text style={styles.sectionCount}>{myDayItems.length} open</Text>
            </View>
            {renderWorkList(myDayItems, "Start with one thing.", "Try “Get ¾-inch couplings” or “Label panel L2.”")}
            {laterItems.length ? (
              <>
                <View style={styles.sectionRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Later</Text>
                  </View>
                  <Text style={styles.sectionCount}>{laterItems.length}</Text>
                </View>
                {renderWorkList(laterItems, "Nothing scheduled later.", "Tomorrow’s work will show here.")}
              </>
            ) : null}
            {openItems.length ? shareButtons(formatJobList("My List", openItems)) : null}
            <Pressable accessibilityRole="button" onPress={() => setView("done")} style={styles.completedLink}>
              <Text style={styles.completedLinkText}>Completed ({doneItems.length}) ›</Text>
            </Pressable>
          </>
        ) : null}

        {view === "materials" ? (
          <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={styles.jobChipRow}>
            <ChoiceButton label="All jobs" selected={materialJobId === null} onPress={() => setMaterialJobId(null)} />
            {data.jobs.map((job) => <ChoiceButton key={job.id} label={job.name} selected={materialJobId === job.id} onPress={() => setMaterialJobId(job.id)} />)}
          </View></ScrollView>
          <View style={styles.quickCard}>
            <TextInput accessibilityLabel="Material name" placeholder="Material to pick up" placeholderTextColor="#98A2AD"
              style={styles.quickInput} value={materialName} onChangeText={setMaterialName} />
            <View style={styles.quickInputRow}>
              <View style={{ flex: 1 }}><QuantityPicker quantity={materialQuantity} unit={materialUnit} onChange={(quantity, unit) => { setMaterialQuantity(quantity); setMaterialUnit(unit); }} /></View>
              <Pressable accessibilityRole="button" disabled={!materialName.trim() || Number(materialQuantity) < 1}
                onPress={() => {
                  const item = { ...createWorkItem(makeId("item"), "material", materialName.trim()), quantity: Number(materialQuantity), unit: materialUnit, jobId: materialJobId };
                  commitBoard((current) => ({ ...current, items: [item, ...current.items] }));
                  setMaterialName(""); Keyboard.dismiss();
                }} style={[styles.addButton, (!materialName.trim() || Number(materialQuantity) < 1) && styles.addButtonDisabled]}>
                <Text style={styles.addButtonText}>Add</Text>
              </Pressable>
            </View>
          </View>
          {shareButtons(formatMaterialRun(`${data.jobs.find((job) => job.id === materialJobId)?.name ?? "All jobs"} — material run`, data.items.filter((item) => !materialJobId || item.jobId === materialJobId)))}
          <MaterialsView
            data={{ jobs: data.jobs, items: data.items.filter((item) => !materialJobId || item.jobId === materialJobId) }}
            onOpen={openItem}
            onToggleItem={toggleItem}
            onToggleNested={toggleNestedMaterial}
          />
          </>
        ) : null}

        {view === "jobs" ? (
          <>
            <View style={styles.jobCreateCard}>
              <View style={styles.jobCreateCopy}>
                <Text style={styles.sectionTitle}>Jobs</Text>
              </View>
              <View style={styles.jobInputRow}>
                <TextInput
                  accessibilityLabel="New job name"
                  onChangeText={setNewJobName}
                  onSubmitEditing={addJob}
                  placeholder="Job or project name"
                  placeholderTextColor="#65717D"
                  returnKeyType="done"
                  style={styles.jobInput}
                  value={newJobName}
                />
                <Pressable
                  disabled={!newJobName.trim()}
                  onPress={addJob}
                  style={[styles.jobAddButton, !newJobName.trim() && styles.addButtonDisabled]}
                >
                  <Text style={styles.jobAddText}>Add job</Text>
                </Pressable>
              </View>
            </View>
            {data.jobs.length ? (
              <View style={styles.jobList}>
                {data.jobs.map((job) => {
                  const progress = jobProgress(job.id, data.items);
                  const selected = selectedJobId === job.id;
                  return (
                    <View key={job.id}>
                      <Pressable
                        onPress={() => {
                          pulse();
                          setSelectedJobId(selected ? null : job.id);
                        }}
                        style={({ pressed }) => [styles.jobCard, selected && styles.jobCardSelected, pressed && styles.pressed]}
                      >
                        <View style={styles.jobMark}><Text style={styles.jobMarkText}>J</Text></View>
                        <View style={styles.jobCardCopy}>
                          <Text style={styles.jobName}>{job.name}</Text>
                          <Text style={styles.jobMeta}>{progress.open} open  •  {progress.complete} done</Text>
                        </View>
                        <Text style={styles.itemArrow}>{selected ? "⌃" : "⌄"}</Text>
                      </Pressable>
                      {selected ? (
                        <View style={styles.jobExpanded}>
                          <JobQuickAdd key={job.id} onAdd={(kind, title, quantity, unit) => {
                            const item = { ...createWorkItem(makeId("item"), kind, title), jobId: job.id, quantity, unit };
                            commitBoard((current) => ({ ...current, items: [item, ...current.items] }));
                          }} />
                          {shareButtons(formatJobList(job.name, data.items.filter((item) => item.jobId === job.id)))}
                          <Pressable accessibilityRole="button" onPress={() => { setMaterialJobId(job.id); setView("materials"); }} style={styles.completedLink}><Text style={styles.completedLinkText}>View materials for this job ›</Text></Pressable>
                          {renderWorkList(
                            sortWorkItems(data.items.filter((item) => item.jobId === job.id)),
                            "No work here yet.",
                            "Add the first task, note, or material above.",
                          )}
                          <Pressable onPress={() => deleteJob(job)} style={styles.removeJobButton}>
                            <Text style={styles.removeJobText}>Remove job</Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>J</Text>
                <Text style={styles.emptyTitle}>No jobs yet.</Text>
                <Text style={styles.emptyHint}>Try “School project” or “Second-floor punch.”</Text>
              </View>
            )}
          </>
        ) : null}

        {view === "done" ? (
          <>
            <Pressable accessibilityRole="button" onPress={() => setView("today")} style={styles.completedLink}>
              <Text style={styles.completedLinkText}>← Back to My List</Text>
            </Pressable>
            <View style={styles.doneHero}>
              <Text style={styles.doneNumber}>{doneItems.length}</Text>
              <View style={styles.doneCopy}>
                <Text style={styles.sectionTitle}>Finished</Text>
                <Text style={styles.sectionHint}>Tap the check to put something back</Text>
              </View>
            </View>
            {renderWorkList(doneItems, "Nothing finished yet.", "Completed work will collect here.")}
          </>
        ) : null}
      </ScrollView>

      {savedMessage ? (
        <View pointerEvents="none" style={styles.toast}>
          <Text style={styles.toastCheck}>✓</Text>
          <Text style={styles.toastText}>{savedMessage}</Text>
        </View>
      ) : null}

      <Modal animationType="slide" onRequestClose={() => { if (!saving) setDraft(null); }} transparent visible={!!draft}>
        <SafeAreaProvider>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalSafe}>
            <View style={styles.modalScrim} />
            {draft ? (
              <SafeAreaView key={draft.id} edges={["top", "bottom"]} style={styles.sheet}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                  <View>
                    <Text style={styles.sheetEyebrow}>{KIND_LABELS[draft.kind === "punch" ? "task" : draft.kind].toUpperCase()}</Text>
                    <Text style={styles.sheetTitle}>Edit item</Text>
                  </View>
                  <Pressable disabled={saving} onPress={() => setDraft(null)} style={styles.completedLink}><Text style={styles.completedLinkText}>Cancel</Text></Pressable>
                  <Pressable disabled={saving || !draft.title.trim()} onPress={saveDraft} style={[styles.doneButton, (saving || !draft.title.trim()) && styles.addButtonDisabled]}>
                    <Text style={styles.doneButtonText}>{saving ? "Saving…" : "Save"}</Text>
                  </Pressable>
                </View>
                {saveError ? <Text style={styles.errorText}>{saveError} Tap Save to retry.</Text> : null}
                <ScrollView pointerEvents={saving ? "none" : "auto"} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                  <TextInput
                    accessibilityLabel="Work item title"
                    multiline
                    onChangeText={(title) => setDraft({ ...draft, title })}
                    placeholder="What needs doing?"
                    placeholderTextColor="#65717D"
                    style={styles.titleInput}
                    value={draft.title}
                  />

                  <Text style={styles.fieldLabel}>TYPE</Text>
                  <View style={styles.kindRow}>
                    {KINDS.map((kind) => (
                      <Pressable
                        key={kind}
                        onPress={() => setDraft({ ...draft, kind })}
                        style={[styles.kindChip, (draft.kind === kind || (draft.kind === "punch" && kind === "task")) && styles.kindChipSelected]}
                      >
                        <Text style={[styles.kindText, (draft.kind === kind || (draft.kind === "punch" && kind === "task")) && styles.kindTextSelected]}>{KIND_LABELS[kind]}</Text>
                      </Pressable>
                    ))}
                  </View>

                  {draft.kind === "material" ? (
                    <QuantityPicker quantity={draft.quantity} unit={draft.unit} onChange={(quantity, unit) => setDraft({ ...draft, quantity, unit })} />
                  ) : null}

                  <Text style={styles.fieldLabel}>LIST</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.jobChipRow}>
                      <Pressable
                        onPress={() => setDraft({ ...draft, jobId: null })}
                        style={[styles.choiceChip, draft.jobId === null && styles.choiceChipSelected]}
                      >
                        <Text style={[styles.choiceText, draft.jobId === null && styles.choiceTextSelected]}>My List</Text>
                      </Pressable>
                      {data.jobs.map((job) => (
                        <Pressable
                          key={job.id}
                          onPress={() => setDraft({ ...draft, jobId: job.id })}
                          style={[styles.choiceChip, draft.jobId === job.id && styles.choiceChipSelected]}
                        >
                          <Text style={[styles.choiceText, draft.jobId === job.id && styles.choiceTextSelected]}>{job.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>

                  <DetailSection title="Location" summary={draft.location}>
                      <Text style={styles.fieldLabel}>LOCATION</Text>
                      <TextInput
                        onChangeText={(location) => setDraft({ ...draft, location })}
                        placeholder="Floor, room, panel or area"
                        placeholderTextColor="#65717D"
                        style={styles.fieldInput}
                        value={draft.location}
                      />

                  </DetailSection>
                  <DetailSection title="Timing & priority" summary={[draft.dueOn ? dueLabel(draft.dueOn) : "", draft.priority === "high" ? "High priority" : ""].filter(Boolean).join(" · ")}>
                      <Text style={styles.fieldLabel}>WHEN</Text>
                      <View style={styles.choiceRow}>
                        {(["today", "tomorrow", "none"] as DueChoice[]).map((due) => (
                          <ChoiceButton
                            key={due}
                            label={DUE_LABELS[due]}
                            onPress={() => setDraft({ ...draft, dueOn: dateKeyFromChoice(due) })}
                            selected={dueChoice(draft.dueOn) === due}
                          />
                        ))}
                      </View>

                      <Text style={styles.fieldLabel}>TIME ESTIMATE</Text>
                      <View style={styles.choiceRow}>
                        {([15, 30, 60, 120] as const).map((minutes) => (
                          <ChoiceButton
                            key={minutes}
                            label={minutes < 60 ? `${minutes}m` : `${minutes / 60}h`}
                            onPress={() => setDraft({
                              ...draft,
                              estimateMinutes: draft.estimateMinutes === minutes ? null : minutes,
                            })}
                            selected={draft.estimateMinutes === minutes}
                          />
                        ))}
                      </View>

                      <Text style={styles.fieldLabel}>PRIORITY</Text>
                      <View style={styles.choiceRow}>
                        {(["low", "normal", "high"] as WorkItemPriority[]).map((priority) => (
                          <ChoiceButton
                            key={priority}
                            label={priority[0].toUpperCase() + priority.slice(1)}
                            onPress={() => setDraft({ ...draft, priority })}
                            selected={draft.priority === priority}
                          />
                        ))}
                      </View>

                  </DetailSection>
                  <DetailSection title="Waiting on" summary={draft.waitingOn}>
                    <TextInput accessibilityLabel="Waiting on" placeholder="Devices, access, another trade…" placeholderTextColor="#98A2AD"
                      style={styles.fieldInput} value={draft.waitingOn ?? ""} onChangeText={(waitingOn) => setDraft({ ...draft, waitingOn })} />
                    {draft.waitingOn ? <Pressable accessibilityRole="button" onPress={() => setDraft({ ...draft, waitingOn: "" })} style={styles.completedLink}><Text style={styles.completedLinkText}>Clear — ready to continue</Text></Pressable> : null}
                  </DetailSection>
                  <DetailSection title="Notes" summary={draft.notes}>
                      <Text style={styles.fieldLabel}>NOTES</Text>
                      <TextInput
                        multiline
                        onChangeText={(notes) => setDraft({ ...draft, notes })}
                        placeholder="Measurements, instructions, or what to watch for"
                        placeholderTextColor="#65717D"
                        style={[styles.fieldInput, styles.notesInput]}
                        textAlignVertical="top"
                        value={draft.notes}
                      />

                  </DetailSection>
                  <DetailSection title="Steps" summary={draft.checklist.length ? `${draft.checklist.filter((line) => line.done).length}/${draft.checklist.length} complete` : ""}>
                      <Text style={styles.fieldLabel}>CHECKLIST</Text>
                      {draft.checklist.map((line) => (
                        <Pressable
                          key={line.id}
                          onPress={() => setDraft({
                            ...draft,
                            checklist: draft.checklist.map((candidate) => candidate.id === line.id
                              ? { ...candidate, done: !candidate.done }
                              : candidate),
                          })}
                          style={styles.subLine}
                        >
                          <View style={[styles.smallCheck, line.done && styles.smallCheckDone]}>
                            <Text style={styles.smallCheckText}>{line.done ? "✓" : ""}</Text>
                          </View>
                          <Text style={[styles.subLineText, line.done && styles.subLineTextDone]}>{line.label}</Text>
                        </Pressable>
                      ))}
                      <InlineAdd
                        buttonLabel="Add step"
                        onAdd={addChecklistLine}
                        onChange={setChecklistText}
                        placeholder="Add a step"
                        value={checklistText}
                      />

                  </DetailSection>
                      {draft.kind !== "material" ? (
                        <DetailSection title="Materials" summary={draft.materials.length ? `${draft.materials.length} on the list` : ""}>
                          <Text style={styles.fieldLabel}>MATERIALS NEEDED</Text>
                          {draft.materials.map((line) => (
                            <View key={line.id}>
                            <Pressable
                              key={line.id}
                              onPress={() => setDraft({
                                ...draft,
                                materials: draft.materials.map((candidate) => candidate.id === line.id
                                  ? { ...candidate, collected: !candidate.collected }
                                  : candidate),
                              })}
                              style={styles.subLine}
                            >
                              <View style={[styles.smallCheck, line.collected && styles.smallCheckDone]}>
                                <Text style={styles.smallCheckText}>{line.collected ? "✓" : ""}</Text>
                              </View>
                              <Text style={[styles.subLineText, line.collected && styles.subLineTextDone]}>{line.name}</Text>
                            </Pressable>
                            <QuantityPicker quantity={line.quantity} unit={line.unit} onChange={(quantity, unit) => setDraft({ ...draft, materials: draft.materials.map((candidate) => candidate.id === line.id ? { ...candidate, quantity, unit } : candidate) })} />
                            </View>
                          ))}
                          <QuantityPicker quantity={attachedQuantity} unit={attachedUnit} onChange={(quantity, unit) => { setAttachedQuantity(quantity); setAttachedUnit(unit); }} />
                          <InlineAdd
                            buttonLabel="Add material"
                            onAdd={addMaterialLine}
                            onChange={setMaterialText}
                            placeholder="Couplings, wire, straps…"
                            value={materialText}
                          />
                        </DetailSection>
                      ) : null}

                  <Pressable onPress={deleteDraft} style={styles.deleteButton}>
                    <Text style={styles.deleteButtonText}>Delete item</Text>
                  </Pressable>
                </ScrollView>
              </SafeAreaView>
            ) : null}
          </KeyboardAvoidingView>
        </SafeAreaProvider>
      </Modal>
    </SafeAreaView>
  );
}

function QuantityPicker({ quantity, unit, onChange }: { quantity: number; unit: string; onChange: (quantity: number, unit: string) => void }) {
  const [text, setText] = useState(String(quantity));
  return <View style={{ gap: 6, marginVertical: 8 }}>
    <View style={styles.choiceRow}>
      <Pressable accessibilityRole="button" accessibilityLabel="Decrease quantity" onPress={() => { const next = Math.max(1, quantity - 1); setText(String(next)); onChange(next, unit); }} style={styles.stepperButton}><Text style={styles.stepperText}>−</Text></Pressable>
      <TextInput accessibilityLabel="Quantity" keyboardType="number-pad" selectTextOnFocus style={styles.quantityInput} value={text}
        onChangeText={(value) => { const next = value.replace(/[^0-9]/g, "").slice(0, 5); setText(next); if (Number(next) > 0) onChange(Number(next), unit); }}
        onBlur={() => setText(String(quantity))} />
      <Pressable accessibilityRole="button" accessibilityLabel="Increase quantity" onPress={() => { const next = Math.min(99999, quantity + 1); setText(String(next)); onChange(next, unit); }} style={styles.stepperButton}><Text style={styles.stepperText}>+</Text></Pressable>
    </View>
    <View style={styles.choiceRow}>{Array.from(new Set(["ea", "ft", "box", unit])).map((choice) => <ChoiceButton key={choice} label={choice} selected={unit === choice} onPress={() => onChange(quantity, choice)} />)}</View>
  </View>;
}

function JobQuickAdd({ onAdd }: { onAdd: (kind: WorkItemKind, title: string, quantity: number, unit: string) => void }) {
  const [kind, setKind] = useState<WorkItemKind>("task");
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("ea");
  return <View style={styles.quickCard}>
    <View style={styles.quickInputRow}><TextInput accessibilityLabel="Add to this job" placeholder="Add to this job…" placeholderTextColor="#98A2AD" value={title} onChangeText={setTitle} style={styles.quickInput} />
      <Pressable accessibilityRole="button" disabled={!title.trim()} onPress={() => { onAdd(kind, title.trim(), quantity, unit); setTitle(""); Keyboard.dismiss(); }} style={[styles.addButton, !title.trim() && styles.addButtonDisabled]}><Text style={styles.addButtonText}>Add</Text></Pressable></View>
    <View style={styles.kindRow}>{KINDS.map((choice) => <ChoiceButton key={choice} label={KIND_LABELS[choice]} selected={kind === choice} onPress={() => setKind(choice)} />)}</View>
    {kind === "material" ? <QuantityPicker quantity={quantity} unit={unit} onChange={(next, nextUnit) => { setQuantity(next); setUnit(nextUnit); }} /> : null}
  </View>;
}

function DetailSection({ title, summary, children }: { title: string; summary?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <View>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={styles.detailsToggle}>
      <View style={{ flex: 1 }}><Text style={styles.detailsToggleTitle}>{summary ? title : title === "Waiting on" ? "Waiting on…" : `Add ${title.toLowerCase()}`}</Text>
        {summary ? <Text numberOfLines={1} style={styles.detailsToggleHint}>{summary}</Text> : null}</View>
      <Text style={styles.detailsToggleArrow}>{open ? "−" : "+"}</Text>
    </Pressable>
    {open ? <View style={styles.detailsWrap}>{children}</View> : null}
  </View>;
}

function quickPlaceholder(kind: WorkItemKind) {
  if (kind === "material") return "What needs picked up?";
  if (kind === "punch") return "What needs fixed?";
  if (kind === "note") return "Write it down…";
  return "What do you need to remember?";
}

function WorkItemRow({
  item,
  jobs,
  onOpen,
  onToggle,
}: {
  item: WorkItem;
  jobs: Job[];
  onOpen: () => void;
  onToggle: () => void;
}) {
  const remaining = item.materials.filter((line) => !line.collected).length;
  const metadata = [item.kind === "note" ? "Note" : null, itemMeta(item, jobs),
    item.status === "open" && item.waitingOn ? `Waiting on: ${item.waitingOn}` : null,
    item.status === "open" && remaining ? `${remaining} material${remaining === 1 ? "" : "s"} needed` : null,
    item.checklist.length ? `${item.checklist.filter((step) => step.done).length} of ${item.checklist.length} steps complete` : null].filter(Boolean).join("  •  ");
  return (
    <View style={[styles.itemCard, item.priority === "high" && styles.itemCardHigh]}>
      <Pressable accessibilityLabel={item.status === "open" ? "Mark complete" : "Restore item"} onPress={onToggle} style={[styles.checkButton, item.status === "done" && styles.checkButtonDone]}>
        <Text style={styles.checkButtonText}>{item.status === "done" ? "✓" : ""}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} onPress={onOpen} style={styles.itemMain}>
        <View style={styles.itemTitleRow}>
          <Text numberOfLines={2} style={[styles.itemTitle, item.status === "done" && styles.itemTitleDone]}>{item.title}</Text>
          {item.kind === "material" && item.quantity > 1 ? <Text style={styles.quantityPill}>{item.quantity} {item.unit}</Text> : null}
        </View>
        {metadata ? <Text numberOfLines={2} style={styles.itemMeta}>{metadata}</Text> : null}
      </Pressable>
    </View>
  );
}

function MaterialsView({
  data,
  onOpen,
  onToggleItem,
  onToggleNested,
}: {
  data: JobBoardData;
  onOpen: (item: WorkItem) => void;
  onToggleItem: (item: WorkItem) => void;
  onToggleNested: (itemId: string, lineId: string) => void;
}) {
  const progress = materialProgress(data.items);
  const standalone = data.items.filter(({ kind }) => kind === "material");
  const nested = data.items.flatMap((item) => item.materials.map((line) => ({ item, line })));
  return (
    <>
      <View style={styles.materialHero}>
        <View style={styles.materialRing}>
          <Text style={styles.materialNumber}>{progress.remaining}</Text>
          <Text style={styles.materialRingLabel}>TO GET</Text>
        </View>
        <View style={styles.materialHeroCopy}>
          <Text style={styles.sectionTitle}>Material run</Text>
          <Text style={styles.sectionHint}>{progress.collected} collected  •  {progress.total} total</Text>
        </View>
      </View>
      {progress.total ? (
        <View style={styles.materialList}>
          {[false, true].map((collected) => {
            const count = standalone.filter((item) => (item.status === "done") === collected).length + nested.filter(({ line }) => line.collected === collected).length;
            return count ? <View key={String(collected)} style={styles.materialList}>
              <Text style={styles.sectionTitle}>{collected ? "Collected" : "To get"}</Text>
          {standalone.filter((item) => (item.status === "done") === collected).map((item) => (
            <View key={item.id} style={styles.materialRow}>
              <Pressable onPress={() => onToggleItem(item)} style={[styles.checkButton, item.status === "done" && styles.checkButtonDone]}>
                <Text style={styles.checkButtonText}>{item.status === "done" ? "✓" : ""}</Text>
              </Pressable>
              <Pressable onPress={() => onOpen(item)} style={styles.materialRowMain}>
                <Text style={[styles.materialName, item.status === "done" && styles.itemTitleDone]}>{item.title}</Text>
                <Text style={styles.materialSource}>{item.quantity} {item.unit}  •  {itemMeta(item, data.jobs)}</Text>
              </Pressable>
            </View>
          ))}
          {nested.filter(({ line }) => line.collected === collected).map(({ item, line }) => (
            <MaterialRow key={`${item.id}-${line.id}`} item={item} line={line} jobs={data.jobs} onToggle={() => onToggleNested(item.id, line.id)} />
          ))}
            </View> : null;
          })}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>□</Text>
          <Text style={styles.emptyTitle}>No materials on the list.</Text>
          <Text style={styles.emptyHint}>Add a material above—for example, 10 couplings.</Text>
        </View>
      )}
    </>
  );
}

function MaterialRow({ item, line, jobs, onToggle }: { item: WorkItem; line: MaterialLine; jobs: Job[]; onToggle: () => void }) {
  return (
    <View style={styles.materialRow}>
      <Pressable onPress={onToggle} style={[styles.checkButton, line.collected && styles.checkButtonDone]}>
        <Text style={styles.checkButtonText}>{line.collected ? "✓" : ""}</Text>
      </Pressable>
      <View style={styles.materialRowMain}>
        <Text style={[styles.materialName, line.collected && styles.itemTitleDone]}>{line.name}</Text>
        <Text style={styles.materialSource}>{line.quantity} {line.unit}  •  For: {item.title}  •  {itemMeta(item, jobs)}</Text>
      </View>
    </View>
  );
}

function ChoiceButton({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.choiceButton, selected && styles.choiceButtonSelected]}>
      <Text style={[styles.choiceButtonText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function InlineAdd({
  buttonLabel,
  onAdd,
  onChange,
  placeholder,
  value,
}: {
  buttonLabel: string;
  onAdd: () => void;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.inlineAdd}>
      <TextInput
        onChangeText={onChange}
        onSubmitEditing={onAdd}
        placeholder={placeholder}
        placeholderTextColor="#65717D"
        returnKeyType="done"
        style={styles.inlineAddInput}
        value={value}
      />
      <Pressable disabled={!value.trim()} onPress={onAdd} style={[styles.inlineAddButton, !value.trim() && styles.addButtonDisabled]}>
        <Text style={styles.inlineAddText}>＋ {buttonLabel}</Text>
      </Pressable>
    </View>
  );
}
