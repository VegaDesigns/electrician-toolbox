import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
import { styles } from "./styles";

type BoardView = "today" | "materials" | "jobs" | "done";

const KINDS: WorkItemKind[] = ["note", "material", "punch", "task"];
const TABS: { id: BoardView; label: string }[] = [
  { id: "today", label: "My Day" },
  { id: "materials", label: "Materials" },
  { id: "jobs", label: "Jobs" },
  { id: "done", label: "Done" },
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
  return [job ?? "Quick List", item.location, dueLabel(item.dueOn)]
    .filter(Boolean)
    .join("  •  ");
}

export default function JobBoardScreen() {
  const [data, setData] = useState<JobBoardData>({ jobs: [], items: [] });
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<BoardView>("today");
  const [quickKind, setQuickKind] = useState<WorkItemKind>("task");
  const [quickTitle, setQuickTitle] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [draft, setDraft] = useState<WorkItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [checklistText, setChecklistText] = useState("");
  const [materialText, setMaterialText] = useState("");
  const [newJobName, setNewJobName] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    loadJobBoard()
      .then(setData)
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveJobBoard(data).catch(() => {});
  }, [data, loaded]);

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
    setTimeout(() => setSavedMessage(""), 2200);
  }

  function addQuickItem() {
    const title = quickTitle.trim();
    if (!title) return;
    const item = createWorkItem(makeId("item"), quickKind, title);
    setData((current) => ({ ...current, items: [item, ...current.items] }));
    setQuickTitle("");
    Keyboard.dismiss();
    pulse("success");
    flash(`${KIND_LABELS[quickKind]} added — tap it for details`);
  }

  function updateItem(next: WorkItem) {
    setData((current) => ({
      ...current,
      items: current.items.map((item) => item.id === next.id ? next : item),
    }));
  }

  function toggleItem(item: WorkItem) {
    pulse(item.status === "open" ? "success" : "selection");
    updateItem(toggleWorkItem(item));
  }

  function saveDraft() {
    if (!draft?.title.trim()) return;
    updateItem({ ...draft, title: draft.title.trim(), updatedAt: Date.now() });
    setDraft(null);
    Keyboard.dismiss();
    pulse("success");
    flash("Changes saved");
  }

  function deleteDraft() {
    if (!draft) return;
    const remove = () => {
      setData((current) => ({
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
    Alert.alert("Delete this item?", "This removes it from your Job Board.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: remove },
    ]);
  }

  function addJob() {
    const name = newJobName.trim();
    if (!name) return;
    const job: Job = { id: makeId("job"), name, createdAt: Date.now() };
    setData((current) => ({ ...current, jobs: [...current.jobs, job] }));
    setNewJobName("");
    Keyboard.dismiss();
    pulse("success");
    flash("Job created");
  }

  function deleteJob(job: Job) {
    const remove = () => {
      setData((current) => ({
        jobs: current.jobs.filter(({ id }) => id !== job.id),
        items: current.items.map((item) => item.jobId === job.id ? { ...item, jobId: null } : item),
      }));
      if (selectedJobId === job.id) setSelectedJobId(null);
      flash("Job removed — its items moved to Quick List");
    };
    if (Platform.OS === "web") {
      if (globalThis.confirm?.(`Remove ${job.name}?`)) remove();
      return;
    }
    Alert.alert(
      `Remove ${job.name}?`,
      "Its work items will stay safe in Quick List.",
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
      materials: [...draft.materials, { id: makeId("mat"), name, quantity: 1, unit: "ea", collected: false }],
    });
    setMaterialText("");
  }

  function toggleNestedMaterial(itemId: string, lineId: string) {
    setData((current) => ({
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
              setShowDetails(false);
              setDraft({ ...item, checklist: [...item.checklist], materials: [...item.materials] });
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
          <Text style={styles.headerEyebrow}>JOB BOARD</Text>
          <Text style={styles.headerTitle}>Keep the day moving.</Text>
        </View>
        <View style={styles.openBadge}>
          <Text style={styles.openBadgeNumber}>{openItems.length}</Text>
          <Text style={styles.openBadgeLabel}>OPEN</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
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
        bounces={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {view === "today" ? (
          <>
            <View style={styles.quickCard}>
              <Text style={styles.quickEyebrow}>QUICK ADD</Text>
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
                  accessibilityLabel="Add to Job Board"
                  accessibilityRole="button"
                  disabled={!quickTitle.trim()}
                  onPress={addQuickItem}
                  style={({ pressed }) => [
                    styles.addButton,
                    !quickTitle.trim() && styles.addButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.addButtonText}>＋</Text>
                </Pressable>
              </View>
              <Text style={styles.quickHint}>One line is enough. Tap it later to add the job, location, materials, or steps.</Text>
            </View>

            <View style={styles.sectionRow}>
              <View>
                <Text style={styles.sectionTitle}>My Day</Text>
                <Text style={styles.sectionHint}>Everything still moving</Text>
              </View>
              <Text style={styles.sectionCount}>{myDayItems.length} TODAY</Text>
            </View>
            {renderWorkList(myDayItems, "You’re clear.", "Add a note, material, punch item, or task above.")}
            {laterItems.length ? (
              <>
                <View style={styles.sectionRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Later</Text>
                    <Text style={styles.sectionHint}>Already planned ahead</Text>
                  </View>
                  <Text style={styles.sectionCount}>{laterItems.length}</Text>
                </View>
                {renderWorkList(laterItems, "Nothing scheduled later.", "Tomorrow’s work will show here.")}
              </>
            ) : null}
          </>
        ) : null}

        {view === "materials" ? (
          <MaterialsView
            data={data}
            onOpen={(item) => setDraft({ ...item, checklist: [...item.checklist], materials: [...item.materials] })}
            onToggleItem={toggleItem}
            onToggleNested={toggleNestedMaterial}
          />
        ) : null}

        {view === "jobs" ? (
          <>
            <View style={styles.jobCreateCard}>
              <View style={styles.jobCreateCopy}>
                <Text style={styles.sectionTitle}>Jobs</Text>
                <Text style={styles.sectionHint}>Group work when it becomes useful</Text>
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
                          {renderWorkList(
                            sortWorkItems(data.items.filter((item) => item.jobId === job.id)),
                            "No work here yet.",
                            "Open an item from My Day and assign it to this job.",
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
                <Text style={styles.emptyTitle}>Quick List works without a job.</Text>
                <Text style={styles.emptyHint}>Create one when you need to organize a larger project or punch list.</Text>
              </View>
            )}
          </>
        ) : null}

        {view === "done" ? (
          <>
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

      <Modal animationType="slide" onRequestClose={() => setDraft(null)} transparent visible={!!draft}>
        <SafeAreaProvider>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalSafe}>
            <Pressable onPress={() => setDraft(null)} style={styles.modalScrim} />
            {draft ? (
              <SafeAreaView edges={["bottom"]} style={styles.sheet}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                  <View>
                    <Text style={styles.sheetEyebrow}>{KIND_LABELS[draft.kind].toUpperCase()}</Text>
                    <Text style={styles.sheetTitle}>Work item</Text>
                  </View>
                  <Pressable onPress={saveDraft} style={styles.doneButton}>
                    <Text style={styles.doneButtonText}>Done</Text>
                  </Pressable>
                </View>
                <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
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
                        style={[styles.kindChip, draft.kind === kind && styles.kindChipSelected]}
                      >
                        <Text style={[styles.kindText, draft.kind === kind && styles.kindTextSelected]}>{KIND_LABELS[kind]}</Text>
                      </Pressable>
                    ))}
                  </View>

                  {draft.kind === "material" ? (
                    <View style={styles.materialQuantityCard}>
                      <View>
                        <Text style={styles.fieldLabel}>QUANTITY</Text>
                        <Text style={styles.quantityValue}>{draft.quantity} <Text style={styles.quantityUnit}>{draft.unit}</Text></Text>
                      </View>
                      <View style={styles.stepper}>
                        <Pressable onPress={() => setDraft({ ...draft, quantity: Math.max(1, draft.quantity - 1) })} style={styles.stepperButton}>
                          <Text style={styles.stepperText}>−</Text>
                        </Pressable>
                        <Pressable onPress={() => setDraft({ ...draft, quantity: draft.quantity + 1 })} style={styles.stepperButton}>
                          <Text style={styles.stepperText}>＋</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : null}

                  <Text style={styles.fieldLabel}>LIST</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.jobChipRow}>
                      <Pressable
                        onPress={() => setDraft({ ...draft, jobId: null })}
                        style={[styles.choiceChip, draft.jobId === null && styles.choiceChipSelected]}
                      >
                        <Text style={[styles.choiceText, draft.jobId === null && styles.choiceTextSelected]}>Quick List</Text>
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

                  <Pressable
                    onPress={() => setShowDetails((current) => !current)}
                    style={styles.detailsToggle}
                  >
                    <View>
                      <Text style={styles.detailsToggleTitle}>Add field details</Text>
                      <Text style={styles.detailsToggleHint}>Location, priority, timing, notes and lists</Text>
                    </View>
                    <Text style={styles.detailsToggleArrow}>{showDetails ? "−" : "＋"}</Text>
                  </Pressable>

                  {showDetails ? (
                    <View style={styles.detailsWrap}>
                      <Text style={styles.fieldLabel}>LOCATION</Text>
                      <TextInput
                        onChangeText={(location) => setDraft({ ...draft, location })}
                        placeholder="Floor, room, panel or area"
                        placeholderTextColor="#65717D"
                        style={styles.fieldInput}
                        value={draft.location}
                      />

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

                      {draft.kind !== "material" ? (
                        <>
                          <Text style={styles.fieldLabel}>MATERIALS NEEDED</Text>
                          {draft.materials.map((line) => (
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
                          ))}
                          <InlineAdd
                            buttonLabel="Add material"
                            onAdd={addMaterialLine}
                            onChange={setMaterialText}
                            placeholder="Couplings, wire, straps…"
                            value={materialText}
                          />
                        </>
                      ) : null}
                    </View>
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

function quickPlaceholder(kind: WorkItemKind) {
  if (kind === "material") return "What needs picked up?";
  if (kind === "punch") return "What needs fixed?";
  if (kind === "note") return "Write it down…";
  return "What needs doing?";
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
  const details = item.checklist.length + item.materials.length;
  return (
    <View style={[styles.itemCard, item.priority === "high" && styles.itemCardHigh]}>
      <Pressable accessibilityLabel={item.status === "open" ? "Mark complete" : "Restore item"} onPress={onToggle} style={[styles.checkButton, item.status === "done" && styles.checkButtonDone]}>
        <Text style={styles.checkButtonText}>{item.status === "done" ? "✓" : ""}</Text>
      </Pressable>
      <Pressable onPress={onOpen} style={styles.itemMain}>
        <View style={styles.itemTitleRow}>
          <View style={styles.itemKindBadge}>
            <Text style={styles.itemKindIcon}>{KIND_ICONS[item.kind]}</Text>
          </View>
          <Text numberOfLines={2} style={[styles.itemTitle, item.status === "done" && styles.itemTitleDone]}>{item.title}</Text>
          {item.kind === "material" && item.quantity > 1 ? <Text style={styles.quantityPill}>{item.quantity} {item.unit}</Text> : null}
        </View>
        <View style={styles.itemBottomRow}>
          <Text numberOfLines={1} style={styles.itemMeta}>{itemMeta(item, jobs)}</Text>
          {details ? <Text style={styles.detailCount}>{details} DETAIL{details === 1 ? "" : "S"}</Text> : null}
        </View>
      </Pressable>
      <Pressable accessibilityLabel="Edit item" onPress={onOpen} style={styles.arrowButton}>
        <Text style={styles.itemArrow}>›</Text>
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
          {standalone.map((item) => (
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
          {nested.map(({ item, line }) => (
            <MaterialRow key={`${item.id}-${line.id}`} item={item} line={line} jobs={data.jobs} onToggle={() => onToggleNested(item.id, line.id)} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>□</Text>
          <Text style={styles.emptyTitle}>No materials on the list.</Text>
          <Text style={styles.emptyHint}>Use Material in Quick Add, or attach materials to a task.</Text>
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
