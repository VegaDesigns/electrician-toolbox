import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors, Effects } from "../../theme";
import { styles as fillStyles } from "../conduitFill/styles";
import { editLine, restoreLine, materialParts, materialText, type ListLine, type MaterialList, type MaterialLists } from "../../utils/jobBoard/materialLists";
import { loadMaterialLists, saveMaterialLists } from "../../utils/storage/materialListsStorage";

function newId() { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
type Removed = { kind: "item"; listId: string; line: ListLine; index: number } | { kind: "list"; list: MaterialList; index: number };

function TimedUndo({ label, undo, expire, blocked }: { label: string; undo: () => void; expire: () => void; blocked: boolean }) {
  const [left, setLeft] = useState(1);
  const [duration, setDuration] = useState<number | null>(null);
  const pause = useRef(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isScreenReaderEnabled().then(async (enabled) => {
      const base = enabled ? 20000 : 6000;
      const time = Platform.OS === "android" ? await AccessibilityInfo.getRecommendedTimeoutMillis(base) : base;
      if (active) setDuration(time);
    }).catch(() => { if (active) setDuration(20000); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!duration || blocked) return;
    const timer = setInterval(() => { if (!pause.current) setLeft((value) => Math.max(0, value - 50 / duration)); }, 50);
    return () => clearInterval(timer);
  }, [duration, blocked]);
  useEffect(() => { if (left === 0) expire(); }, [left, expire]);
  return <View style={{ opacity: Math.min(1, left * 12) }} onTouchStart={() => { pause.current = true; }} onTouchEnd={() => { pause.current = false; }} onPointerEnter={() => { pause.current = true; }} onPointerLeave={() => { pause.current = false; }}>
    <View style={s.undoBar}><Text accessibilityLiveRegion="polite" style={s.muted}>{label}</Text><Pressable accessibilityRole="button" disabled={blocked} onFocus={() => { pause.current = true; }} onBlur={() => { pause.current = false; }} onPress={undo} style={s.smallButton}><Text style={s.link}>Undo</Text></Pressable></View>
    <View style={{ height: 2, backgroundColor: Colors.border }}><View style={{ height: 2, width: `${left * 100}%`, backgroundColor: Colors.primary }} /></View>
  </View>;
}

function SwipeList({ list, open, action }: { list: MaterialList; open: () => void; action: (type: "finish" | "delete") => void }) {
  const swipe = useRef<{ close: () => void } | null>(null);
  const isRevealed = useRef(false);
  const ignoreTapUntil = useRef(0);
  // Web uses layout-based measurement; native uses UI-thread animations.
  const SwipeRow = Platform.OS === "web" ? BrowserSwipeRow : ReanimatedSwipeable;
  const materials = list.lines.filter((line) => line.kind !== "note");
  return <SwipeRow ref={(value: { close: () => void } | null) => { swipe.current = value; }} enabled={!list.completed} friction={1} leftThreshold={45} rightThreshold={45}
    dragOffsetFromLeftEdge={18} dragOffsetFromRightEdge={18} overshootLeft={false} overshootRight={false}
    enableTrackpadTwoFingerGesture containerStyle={s.swipeContainer}
    onSwipeableOpenStartDrag={() => { isRevealed.current = true; }}
    onSwipeableWillOpen={() => { isRevealed.current = true; ignoreTapUntil.current = Date.now() + 300; }}
    onSwipeableClose={() => { isRevealed.current = false; }}
    renderLeftActions={() => <Pressable accessibilityRole="button" accessibilityLabel="Delete list" onPress={() => { swipe.current?.close(); action("delete"); }} style={[s.swipeAction, s.swipeDelete]}><Text style={s.swipeSymbol}>×</Text><Text style={s.swipeLabel}>Delete</Text></Pressable>}
    renderRightActions={() => <Pressable accessibilityRole="button" accessibilityLabel="Mark completed" onPress={() => { swipe.current?.close(); action("finish"); }} style={[s.swipeAction, s.swipeFinish]}><Text style={s.swipeSymbol}>✓</Text><Text style={s.swipeLabel}>Finished</Text></Pressable>}>
    <Pressable accessibilityRole="button" onPress={() => { if (Date.now() < ignoreTapUntil.current) return; if (isRevealed.current) swipe.current?.close(); else open(); }} style={s.listCard}>
      <View style={s.cardHeading}><View style={s.listMark}><Text style={s.listMarkText}>≡</Text></View><Text style={[s.title, s.cardTitle]}>{list.title.trim() || "Untitled list"}</Text><Text style={s.muted}>›</Text></View>
      <Text style={s.muted}>{materials.length ? `${materials.filter((line) => !line.done).length} left · ${materials.length} materials` : "No materials"}{list.lines.some((line) => line.kind === "note") ? ` · Notes: ${list.lines.filter((line) => line.kind === "note").length}` : ""}</Text>
    </Pressable>
  </SwipeRow>;
}

const BrowserSwipeRow = React.forwardRef<{ close: () => void }, React.ComponentProps<typeof ReanimatedSwipeable>>(function BrowserSwipeRow(props, ref) {
  const [offset, setOffset] = useState(0);
  const start = useRef<{ x: number; y: number; offset: number } | null>(null);
  const dragged = useRef(false);
  function close() { setOffset(0); props.onSwipeableClose?.("left" as never); }
  React.useImperativeHandle(ref, () => ({ close }));
  return <View style={props.containerStyle}>
    <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, flexDirection: "row" }}>{offset > 0 ? props.renderLeftActions?.({} as never, {} as never, { close } as never) : null}</View>
    <View style={{ position: "absolute", top: 0, bottom: 0, right: 0, flexDirection: "row" }}>{offset < 0 ? props.renderRightActions?.({} as never, {} as never, { close } as never) : null}</View>
    <View style={{ transform: [{ translateX: offset }] }} {...{ onClickCapture: (event: { stopPropagation: () => void; preventDefault: () => void }) => { if (dragged.current) { event.stopPropagation(); event.preventDefault(); dragged.current = false; } } }}
      onPointerDown={(event) => { dragged.current = false; start.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY, offset }; }}
      onPointerMove={(event) => { const point = start.current; if (!point || !props.enabled) return; const dx = event.nativeEvent.pageX - point.x; if (Math.abs(dx) > 18 && Math.abs(dx) > Math.abs(event.nativeEvent.pageY - point.y)) { dragged.current = true; setOffset(Math.max(-104, Math.min(104, point.offset + dx))); } }}
      onPointerUp={(event) => { const point = start.current; start.current = null; if (!point || !props.enabled) return; const dx = event.nativeEvent.pageX - point.x; if (Math.abs(dx) > 18 && Math.abs(dx) > Math.abs(event.nativeEvent.pageY - point.y)) { dragged.current = true; const total = point.offset + dx; setOffset(Math.abs(total) > 45 ? Math.sign(total) * 104 : 0); if (Math.abs(total) > 45) props.onSwipeableWillOpen?.("left" as never); } }}
      onPointerCancel={() => { start.current = null; close(); }}
      onStartShouldSetResponderCapture={() => false}
    >{props.children}</View>
  </View>;
});

export default function MaterialListsScreen() {
  const [data, setData] = useState<MaterialLists>({ lists: [] });
  const current = useRef(data);
  const queue = useRef(Promise.resolve());
  const revision = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [completedView, setCompletedView] = useState(false);
  const [entry, setEntry] = useState("");
  const [adding, setAdding] = useState<"material" | "note" | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showOlderEdits, setShowOlderEdits] = useState(false);
  const [quantity, setQuantity] = useState("0");
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [finishPrompt, setFinishPrompt] = useState(false);
  const [manage, setManage] = useState<"options" | "rename" | "delete" | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [removed, setRemoved] = useState<Removed[]>([]);
  const selected = data.lists.find((list) => list.id === selectedId);
  const historyLine = selected?.lines.find((line) => line.id === historyId);
  const pendingDraft = !!adding || !!editing;

  function load() {
    loadMaterialLists().then((stored) => { current.current = stored; setData(stored); setLoaded(true); setError(""); })
      .catch(() => setError("Couldn't open your saved lists. Tap Retry."));
  }
  useEffect(() => { load(); }, []);

  function persist(next: MaterialLists): Promise<boolean> {
    if (!loaded) return Promise.resolve(false);
    current.current = next; setData(next); setSaving(true); setError("");
    const version = ++revision.current;
    const task = queue.current.then(async () => {
      try { await saveMaterialLists(next); return true; }
      catch { if (version === revision.current) setError("Changes aren't saved. Keep this screen open and tap Retry."); return false; }
      finally { if (version === revision.current) setSaving(false); }
    });
    queue.current = task.then(() => {});
    return task;
  }
  function changeList(id: string, change: (list: MaterialList) => MaterialList) {
    return persist({ lists: current.current.lists.map((list) => list.id === id ? change(list) : list) });
  }
  function openList(list: MaterialList) { setSelectedId(list.id); setEntry(""); setAdding(null); setEditing(null); }
  function createList() {
    // Creation runs only from the New list button event.
    // eslint-disable-next-line react-hooks/purity
    const list: MaterialList = { id: newId(), title: "", lines: [], completed: false, createdAt: Date.now() };
    void persist({ lists: [list, ...current.current.lists] });
    openList(list);
  }
  function addLines() {
    if (!selected || !adding || !entry.trim()) return;
    const line: ListLine = { id: newId(), text: adding === "note" ? entry.trim() : materialText(quantity, entry), done: false, previous: [], kind: adding };
    void changeList(selected.id, (list) => ({ ...list, lines: [...list.lines, line] }));
    setEntry(""); setAdding(null); Keyboard.dismiss();
  }
  function saveEdit() {
    if (!selected || !editing || !editText.trim()) return;
    void changeList(selected.id, (list) => ({ ...list, lines: list.lines.map((line) => line.id === editing ? editLine(line, line.kind === "note" ? editText : materialText(quantity, editText)) : line) }));
    setEditing(null); Keyboard.dismiss();
  }
  function removeItem(id: string) {
    if (!selected) return;
    const index = selected.lines.findIndex((line) => line.id === id);
    if (index < 0) return;
    setRemoved((items) => [...items, { kind: "item", listId: selected.id, line: selected.lines[index], index }]);
    void changeList(selected.id, (list) => ({ ...list, lines: list.lines.filter((line) => line.id !== id) }));
    setEditing(null); Keyboard.dismiss();
  }
  function removeList() {
    if (!selected) return;
    setRemoved((items) => [...items, { kind: "list", list: selected, index: current.current.lists.findIndex((list) => list.id === selected.id) }]);
    void persist({ lists: current.current.lists.filter((list) => list.id !== selected.id) });
    setManage(null); setSelectedId(null);
  }
  function undoRemoval() {
    const last = removed[removed.length - 1];
    if (!last) return;
    if (last.kind === "list") {
      const lists = [...current.current.lists];
      lists.splice(last.index, 0, last.list);
      void persist({ lists });
    } else {
      void changeList(last.listId, (list) => {
        const lines = [...list.lines]; lines.splice(last.index, 0, last.line);
        return { ...list, lines };
      });
    }
    setRemoved((items) => items.slice(0, -1));
  }
  function renameList() {
    if (!selected) return;
    void changeList(selected.id, (list) => ({ ...list, title: nameDraft.trim() }));
    setManage(null); Keyboard.dismiss();
  }
  async function finish() {
    if (!selected) return;
    if (await changeList(selected.id, (list) => ({ ...list, completed: true }))) {
      setFinishPrompt(false); setSelectedId(null); setCompletedView(false);
    }
  }
  const materials = selected?.lines.filter((line) => line.kind !== "note") ?? [];
  const remaining = materials.filter((line) => !line.done).length;
  const unchecked = materials.filter((line) => !line.done).length;
  const shownLists = data.lists.filter((list) => list.completed === completedView);
  const canLeave = !saving && !error && !pendingDraft;
  const editedLine = selected?.lines.find((line) => line.id === editing);
  const isNoteEntry = adding === "note" || editedLine?.kind === "note";
  function closeEntry() { setAdding(null); setEditing(null); setEntry(""); Keyboard.dismiss(); }
  function startAdd(kind: "material" | "note") { setEditing(null); setEditText(""); setEntry(""); setQuantity("0"); setAdding(kind); }
  function startEdit(line: ListLine) { const parts = materialParts(line.text); setShowOlderEdits(false); setAdding(null); setEntry(""); setQuantity(line.kind === "note" ? "0" : parts.quantity); setEditText(line.kind === "note" ? line.text : parts.description); setEditing(line.id); }

  return <SafeAreaView edges={["top", "bottom"]} style={s.safe}>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.safe}>
      <View style={s.header}>
        <Pressable accessibilityRole="button" accessibilityLabel={selected ? "Back to lists" : "Return home"} disabled={!canLeave} style={[s.homeButton, !canLeave && s.disabled]}
          onPress={() => selected ? setSelectedId(null) : router.replace("/")}><Text style={s.buttonText}>←</Text></Pressable>
        <View style={s.lineBody}><Text style={s.eyebrow}>JOBSITE LISTS</Text><Text style={s.heading}>{selected ? "Job" : "Your lists"}</Text></View>
        {selected ? <Pressable accessibilityRole="button" accessibilityLabel="List options" disabled={!canLeave} onPress={() => setManage("options")} style={[s.homeButton, !canLeave && s.disabled]}><Text style={s.buttonText}>•••</Text></Pressable> : null}
      </View>
      {error || !loaded ? <View style={s.status}>
        {error ? <><Text style={s.error}>{error}</Text><Pressable accessibilityRole="button" onPress={() => loaded ? void persist(current.current) : load()} style={s.smallButton}><Text style={s.buttonText}>Retry</Text></Pressable></>
          : <Text style={s.muted}>Loading…</Text>}
      </View> : null}
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content} pointerEvents={loaded ? "auto" : "none"}>
        {!selected ? <>
          {!completedView ? <Pressable accessibilityRole="button" onPress={createList} style={s.primary}><Text style={s.primaryText}>+ New list</Text></Pressable> : null}
          <View style={s.sectionHeader}><Text style={s.title}>{completedView ? "Completed" : "Active lists"}</Text>
            <Pressable accessibilityRole="button" onPress={() => setCompletedView(!completedView)} style={s.smallButton}><Text style={s.link}>{completedView ? "Active lists" : `Completed (${data.lists.filter((list) => list.completed).length})`}</Text></Pressable></View>
          {!completedView && shownLists.length ? <Text style={s.muted}>Swipe left to finish · right to delete</Text> : null}
          {shownLists.map((list) => <SwipeList key={list.id} list={list} open={() => openList(list)} action={(type) => { openList(list); if (type === "finish") setFinishPrompt(true); else setManage("delete"); }} />)}
          {!shownLists.length ? <View style={s.empty}><Text style={s.title}>{completedView ? "No completed lists yet" : "A fresh list for each job"}</Text><Text style={s.muted}>{completedView ? "Completed lists stay here to reopen later." : "Keep job notes and materials together."}</Text></View> : null}
        </> : <>
          <View style={s.runSummary}>
          <View style={s.sectionHeader}><Text style={s.eyebrow}>JOB NOTES & MATERIALS</Text><View style={s.countBadge}><Text style={s.countText}>{selected.completed ? "Completed" : `${remaining} left`}</Text></View></View>
          <Pressable accessibilityRole="button" accessibilityLabel="Rename list" disabled={!canLeave} onPress={() => { setNameDraft(selected.title); setManage("rename"); }} style={s.renameTarget}>
            <Text style={[s.name, s.lineBody]}>{selected.title.trim() || "Name this job…"}</Text><Text style={s.pencil}>✎</Text>
          </Pressable>
          <Text style={s.muted}>{materials.length ? `${materials.length - remaining} of ${materials.length} materials collected` : "Notes and materials for this job"}</Text>
          <View style={s.progressTrack}><View style={[s.progressFill, { width: `${materials.length ? ((materials.length - remaining) / materials.length) * 100 : 0}%` }]} /></View>
          </View>
          {(["note", "material"] as const).map((kind) => selected.lines.some((line) => (line.kind ?? "material") === kind) ? <View key={kind} style={s.paper}>
          <Text style={s.groupLabel}>{kind === "note" ? "NOTES" : "MATERIALS"}</Text>
          {selected.lines.filter((line) => (line.kind ?? "material") === kind).map((line) => <View key={line.id} style={s.line}>
            {kind === "note" ? <View style={s.checkTarget}><Text style={s.noteMarker}>-</Text></View> : <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: line.done }} accessibilityLabel={`Collected: ${line.text}`} disabled={selected.completed || editing === line.id}
              onPress={() => { void changeList(selected.id, (list) => ({ ...list, lines: list.lines.map((item) => item.id === line.id ? { ...item, done: !item.done } : item) })); }}
              style={({ pressed }) => [s.checkTarget, pressed && s.pressed]}><View style={[s.check, line.done && s.checked]}><Text style={s.checkText}>{line.done ? "✓" : ""}</Text></View></Pressable>}
            <View style={s.lineBody}>
              <View style={s.lineContent}><Pressable accessibilityRole="button" accessibilityLabel={`Edit ${line.text}`} disabled={selected.completed || !!editing} onPress={() => startEdit(line)} style={({ pressed }) => [s.lineTextTarget, pressed && s.pressed]}>
                <Text style={[s.lineText, kind !== "note" && line.done && s.doneText]}>{line.text}</Text>
              </Pressable>
              {!selected.completed ? <>
                <Pressable accessibilityRole="button" accessibilityLabel={`Edit wording: ${line.text}${kind !== "note" && line.previous.length ? ", previously edited" : ""}`} onPress={() => startEdit(line)} style={s.rowIcon}><Text style={s.pencil}>✎</Text>{kind !== "note" && line.previous.length ? <View pointerEvents="none" style={s.editDot} /> : null}</Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${line.text}`} disabled={saving || !!error} onPress={() => removeItem(line.id)} style={s.rowIcon}><Text style={s.removeIcon}>×</Text></Pressable>
              </> : null}
              </View>
            </View>
          </View>)}
          </View> : null)}
          {!selected.completed ? <>
            <View style={s.actions}>
              <Pressable accessibilityRole="button" disabled={!!editing} onPress={() => startAdd("material")} style={[s.primary, s.grow]}><Text style={s.primaryText}>+ Add item</Text></Pressable>
              <Pressable accessibilityRole="button" disabled={!!editing} onPress={() => startAdd("note")} style={[s.secondary, s.grow]}><Text style={s.buttonText}>+ Add note</Text></Pressable>
            </View>
          </> : <Pressable accessibilityRole="button" onPress={() => { void changeList(selected.id, (list) => ({ ...list, completed: false })); }} style={s.primary}><Text style={s.primaryText}>Reopen list</Text></Pressable>}
        </>}
      </ScrollView>
      <Modal transparent animationType="slide" visible={!!adding || !!editing} onRequestClose={closeEntry}>
        <SafeAreaProvider><SafeAreaView edges={["top", "bottom"]} style={s.entryModalSafe}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.entryKeyboard}>
            {adding || editing ? <View style={[fillStyles.sheet, s.entrySheet]}>
              <View style={fillStyles.sheetHandle} />
              <View style={fillStyles.sheetHeader}><View><Text style={fillStyles.sheetEyebrow}>JOBSITE LISTS</Text><Text style={fillStyles.sheetTitle}>{editing ? "Edit" : "Add"} {isNoteEntry ? "note" : "item"}</Text></View></View>
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.entryContent}>
                {!isNoteEntry && editedLine?.previous.length ? <View style={s.previousPanel}>
                  <Text style={s.muted}>Previously: <Text style={s.previousText}>{editedLine.previous[editedLine.previous.length - 1]}</Text></Text>
                  <View style={s.actions}>
                    {editedLine.previous.length > 1 ? <Pressable accessibilityRole="button" onPress={() => setShowOlderEdits(!showOlderEdits)} style={s.smallButton}><Text style={s.link}>{showOlderEdits ? "Hide history" : "View history"}</Text></Pressable> : null}
                    <Pressable accessibilityRole="button" disabled={saving || !!error} onPress={() => {
                      if (selected) void changeList(selected.id, (list) => ({ ...list, lines: list.lines.map((line) => line.id === editedLine.id ? restoreLine(line) : line) }));
                      closeEntry();
                    }} style={s.smallButton}><Text style={s.link}>Restore previous</Text></Pressable>
                  </View>
                  {showOlderEdits ? editedLine.previous.slice(0, -1).reverse().map((text, index) => <Text key={index} style={s.muted}>{text}</Text>) : null}
                </View> : null}
                {!isNoteEntry ? <><Text style={s.muted}>Quantity {Number(quantity) === 0 ? "· No quantity" : ""}</Text><View style={[s.actions, { flexWrap: "nowrap" }]}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Decrease quantity" onPress={() => setQuantity(String(Math.max(0, Number(quantity) - 1)))} style={s.cancelButton}><Text style={s.buttonText}>−</Text></Pressable>
                  <TextInput accessibilityLabel="Quantity" keyboardType="number-pad" selectTextOnFocus value={quantity} onChangeText={(value) => setQuantity(value.replace(/\D/g, "").slice(0, 6))} style={[s.modalInput, { flex: 1, minWidth: 0, textAlign: "center" }]} />
                  <Pressable accessibilityRole="button" accessibilityLabel="Increase quantity" onPress={() => setQuantity(String(Math.min(999999, Number(quantity) + 1)))} style={s.cancelButton}><Text style={s.buttonText}>+</Text></Pressable>
                </View></> : null}
                <TextInput key={`${editing ?? adding}`} accessibilityLabel={isNoteEntry ? "Note text" : "Material text"} autoFocus multiline={isNoteEntry} blurOnSubmit returnKeyType="done" submitBehavior="submit" onSubmitEditing={editing ? saveEdit : addLines} placeholder={isNoteEntry ? "What should you remember?" : "Couplings"} placeholderTextColor={Colors.textMuted} value={editing ? editText : entry} onChangeText={editing ? setEditText : setEntry} style={[s.modalInput, isNoteEntry && s.noteInput]} />
                <View style={s.actions}><Pressable accessibilityRole="button" disabled={!(editing ? editText : entry).trim()} onPress={editing ? saveEdit : addLines} style={[s.primary, s.grow, !(editing ? editText : entry).trim() && s.disabled]}><Text style={s.primaryText}>{editing ? "Save" : "Add"}</Text></Pressable>
                  <Pressable accessibilityRole="button" onPress={closeEntry} style={[s.cancelButton, s.grow]}><Text style={s.buttonText}>Cancel</Text></Pressable></View>
              </ScrollView>
            </View> : null}
          </KeyboardAvoidingView>
        </SafeAreaView></SafeAreaProvider>
      </Modal>
      {removed.length ? <TimedUndo key={`${removed.length}-${removed[removed.length - 1].kind === "item" ? (removed[removed.length - 1] as Extract<Removed, {kind: "item"}>).line.id : "list"}`} label={removed[removed.length - 1].kind === "item" ? "Item removed" : "List removed"} undo={undoRemoval} expire={() => setRemoved([])} blocked={saving || !!error || pendingDraft || !!manage} /> : null}
      <Modal transparent animationType="fade" visible={!!manage} onRequestClose={() => setManage(null)}>
        <SafeAreaProvider><SafeAreaView style={s.scrim} edges={["top", "bottom"]}><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.manageWrap}>
          <View style={s.sheet}><ScrollView keyboardShouldPersistTaps="handled">
            {manage === "options" ? <><Text style={s.title}>List options</Text>
              {!selected?.completed ? <Pressable accessibilityRole="button" onPress={() => { setManage(null); setFinishPrompt(true); }} style={s.smallButton}><Text style={s.buttonText}>Mark completed</Text></Pressable> : null}
              <Pressable accessibilityRole="button" onPress={() => { setNameDraft(selected?.title ?? ""); setManage("rename"); }} style={s.smallButton}><Text style={s.buttonText}>Rename list</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => setManage("delete")} style={s.smallButton}><Text style={s.error}>Delete list</Text></Pressable>
            </> : manage === "rename" ? <><Text style={s.title}>Name your list</Text>
              <TextInput accessibilityLabel="List name" autoFocus value={nameDraft} onChangeText={setNameDraft} placeholder="Hallway materials" placeholderTextColor={Colors.textMuted} style={s.editInput} returnKeyType="done" onSubmitEditing={renameList} />
              <Pressable accessibilityRole="button" onPress={renameList} style={s.primary}><Text style={s.primaryText}>Save name</Text></Pressable>
            </> : manage === "delete" ? <><Text style={s.title}>Delete this list?</Text><Text style={s.historyText}>{selected?.title.trim() || "Untitled list"}</Text><Text style={s.muted}>This removes the list and all its items. Undo is available until you leave Jobsite Lists or reload the app.</Text>
              <Pressable accessibilityRole="button" onPress={removeList} style={s.secondary}><Text style={s.error}>Delete list</Text></Pressable>
            </> : null}
            <Pressable accessibilityRole="button" onPress={() => { setManage(null); Keyboard.dismiss(); }} style={s.cancelButton}><Text style={s.buttonText}>Cancel</Text></Pressable>
          </ScrollView></View>
        </KeyboardAvoidingView></SafeAreaView></SafeAreaProvider>
      </Modal>
      <Modal transparent animationType="fade" visible={!!historyLine || finishPrompt} onRequestClose={() => { setHistoryId(null); setFinishPrompt(false); }}>
        <SafeAreaProvider><SafeAreaView style={s.scrim} edges={["top", "bottom"]}>
          <View style={s.sheet}><ScrollView keyboardShouldPersistTaps="handled">
            {historyLine ? <><Text style={s.title}>Previous wording</Text>
              <Text style={s.muted}>Current: {historyLine.text}</Text>
              {[...historyLine.previous].reverse().map((text, index) => <Text key={index} style={s.historyText}>{text}</Text>)}
              {!selected?.completed ? <Pressable accessibilityRole="button" disabled={!!editing} onPress={() => {
                if (selected) void changeList(selected.id, (list) => ({ ...list, lines: list.lines.map((line) => line.id === historyLine.id ? restoreLine(line) : line) })); setHistoryId(null);
              }} style={s.primary}><Text style={s.primaryText}>Restore previous wording</Text></Pressable> : null}
            </> : <><Text style={s.title}>Mark this list completed?</Text><Text style={s.muted}>{unchecked ? `${unchecked} notes or materials still unchecked. They will remain in the completed list.` : "Move this list to Completed? You can reopen it later."}</Text>
              {error ? <Text style={s.error}>{error}</Text> : null}
              <Pressable accessibilityRole="button" disabled={saving} onPress={() => { void finish(); }} style={s.primary}><Text style={s.primaryText}>Mark completed</Text></Pressable></>}
            <Pressable accessibilityRole="button" onPress={() => { setHistoryId(null); setFinishPrompt(false); }} style={s.cancelButton}><Text style={s.buttonText}>{historyLine ? "Close" : "Cancel"}</Text></Pressable>
          </ScrollView></View>
        </SafeAreaView></SafeAreaProvider>
      </Modal>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  swipeContainer: { borderRadius: 14, overflow: "hidden" },
  swipeAction: { width: 104, alignItems: "center", justifyContent: "center", gap: 4 },
  swipeDelete: { backgroundColor: Colors.keyDanger },
  swipeFinish: { backgroundColor: Colors.borderStrong },
  swipeSymbol: { color: Colors.text, fontSize: 25, fontWeight: "700" },
  swipeLabel: { color: Colors.text, fontSize: 14, fontWeight: "700" },
  safe: { flex: 1, backgroundColor: Colors.bg },
  entryModalSafe: { flex: 1, backgroundColor: "rgba(0,0,0,0.70)" },
  entryKeyboard: { flex: 1, justifyContent: "flex-end" },
  entrySheet: { width: "100%", maxWidth: 520, alignSelf: "center" },
  entryContent: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  modalInput: { backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.borderStrong, borderRadius: 11, color: Colors.text, fontSize: 17, padding: 12, height: 50 },
  noteInput: { height: 96, textAlignVertical: "top" },
  pencil: { color: Colors.textSubtle, fontSize: 16 },
  noteMarker: { color: Colors.textMuted, fontSize: 16 },
  removeIcon: { color: Colors.error, fontSize: 26 },
  rowIcon: { width: 44, minHeight: 48, alignItems: "center", justifyContent: "center" },
  editDot: { position: "absolute", width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, top: 11, right: 9 },
  previousPanel: { borderWidth: 1, borderColor: Colors.border, borderRadius: 11, padding: 12, gap: 4 },
  previousText: { color: Colors.text },
  grow: { flex: 1, minWidth: 120 },
  cancelButton: { minHeight: 48, minWidth: 90, paddingHorizontal: 14, marginVertical: 6, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.borderStrong, borderRadius: 12, backgroundColor: Colors.surface3 },
  groupLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1, padding: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 8, minHeight: 58, width: "100%", maxWidth: 520, alignSelf: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  homeButton: { width: 44, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 13, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface3, ...Effects.controlRaised },
  heading: { color: Colors.text, fontSize: 21, fontWeight: "900" },
  eyebrow: { color: Colors.textSubtle, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  status: { minHeight: 28, paddingHorizontal: 16, maxWidth: 560, width: "100%", alignSelf: "center" },
  content: { padding: 16, paddingTop: 12, gap: 12, maxWidth: 520, width: "100%", alignSelf: "center", paddingBottom: 32 },
  title: { color: Colors.text, fontSize: 17, fontWeight: "700" },
  muted: { color: Colors.textMuted, fontSize: 13, lineHeight: 19 },
  error: { color: Colors.error, fontSize: 13, lineHeight: 19 },
  buttonText: { color: Colors.text, fontSize: 15, fontWeight: "600" },
  smallButton: { minHeight: 44, minWidth: 44, justifyContent: "center", paddingHorizontal: 8 },
  primary: { backgroundColor: Colors.primary, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: Colors.primaryMuted, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, marginVertical: 4, ...Effects.primaryRaised },
  primaryText: { color: Colors.inverseText, fontSize: 15, fontWeight: "700" },
  secondary: { minHeight: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.borderStrong, borderRadius: 12, backgroundColor: Colors.surface2, ...Effects.controlRaised },
  disabled: { opacity: 0.4 },
  link: { color: Colors.primary, fontSize: 14, fontWeight: "600" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" },
  listCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, padding: 16, borderRadius: 14, gap: 10, ...Effects.surfaceRaised },
  cardHeading: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardTitle: { flex: 1 },
  listMark: { width: 32, height: 32, borderRadius: 9, backgroundColor: Colors.surface3, alignItems: "center", justifyContent: "center" },
  listMarkText: { color: Colors.primary, fontSize: 24 },
  runSummary: { padding: 16, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, gap: 8, ...Effects.surfaceRaised },
  countBadge: { backgroundColor: Colors.primarySoft, borderWidth: 1, borderColor: Colors.primaryMuted, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  countText: { color: Colors.primary, fontSize: 12, fontWeight: "700" },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: Colors.bg, overflow: "hidden", marginTop: 4 },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: Colors.primary },
  paper: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, ...Effects.surfaceRaised },
  empty: { paddingVertical: 28, gap: 8 },
  name: { color: Colors.text, fontSize: 23, fontWeight: "600", paddingVertical: 8 },
  renameTarget: { flexDirection: "row", alignItems: "center", minHeight: 52, gap: 12 },
  undoBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, borderTopWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface2 },
  manageWrap: { width: "100%", alignItems: "center", justifyContent: "center", flex: 1 },
  line: { flexDirection: "row", alignItems: "flex-start", borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.border, paddingVertical: 6, gap: 6 },
  checkTarget: { width: 44, minHeight: 48, alignItems: "center", justifyContent: "center" },
  check: { width: 26, height: 26, borderWidth: 1.5, borderColor: Colors.borderStrong, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  checked: { backgroundColor: Colors.primary, borderColor: Colors.primary, ...Effects.primaryRaised },
  checkText: { color: Colors.inverseText, fontSize: 18, fontWeight: "700" },
  pressed: { opacity: 0.6 },
  lineBody: { flex: 1, minWidth: 0 },
  lineContent: { flexDirection: "row", alignItems: "flex-start", gap: 4 },
  lineTextTarget: { flex: 1, minWidth: 0, minHeight: 48, justifyContent: "center", paddingVertical: 10 },
  lineText: { color: Colors.text, fontSize: 17, lineHeight: 25 },
  doneText: { color: Colors.textMuted, textDecorationLine: "line-through" },
  editBadge: { minHeight: 48, minWidth: 44, justifyContent: "center", alignItems: "center", paddingHorizontal: 4 },
  editedText: { color: Colors.textMuted, fontSize: 10, fontWeight: "600", backgroundColor: Colors.surface3, paddingHorizontal: 5, paddingVertical: 3, borderRadius: 5 },
  editInput: { color: Colors.text, backgroundColor: Colors.surface, borderRadius: 8, padding: 10, fontSize: 17, minHeight: 48 },
  actions: { flexDirection: "row", gap: 8, flexWrap: "wrap", alignItems: "center" },
  entryBox: { paddingHorizontal: 12, paddingVertical: 4, backgroundColor: Colors.bg, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, ...Effects.recessed },
  entryBoxFocused: { borderColor: Colors.borderStrong },
  entry: { color: Colors.text, fontSize: 17, lineHeight: 25, height: 52, textAlignVertical: "top", paddingVertical: 12, paddingHorizontal: 4 },
  entryExpanded: { height: 112 },
  entryHint: { color: Colors.textMuted, fontSize: 12, lineHeight: 18, paddingHorizontal: 4, marginBottom: 8 },
  addButton: { minWidth: 110 },
  scrim: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", padding: 20 },
  sheet: { backgroundColor: Colors.surface, borderRadius: 18, padding: 20, maxHeight: "85%", width: "100%", maxWidth: 520, alignSelf: "center" },
  historyText: { color: Colors.text, fontSize: 17, paddingVertical: 14 },
});
