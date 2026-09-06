import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import {
  CATEGORY_LABELS,
  getDailyTradeTalkEntry,
  getTradeTalkEntry,
  KIND_LABELS,
  searchTradeTalk,
  TRADE_TALK_ENTRIES,
  type TradeTalkCategory,
  type TradeTalkEntry,
  type TradeTalkKind,
} from "../../utils/tradeTalk/dictionary";
import {
  addRecentTradeTalkEntry,
  loadTradeTalkPreferences,
  saveTradeTalkPreferences,
} from "../../utils/storage/tradeTalkPreferences";
import { styles } from "./styles";

type CategoryFilter = "all" | "slang" | TradeTalkCategory;

type QuizQuestion = {
  answers: string[];
  correct: number;
  entryId: string;
  prompt: string;
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    entryId: "battleship",
    prompt: "A mechanic asks for a battleship. What are they probably hanging?",
    answers: ["An old-work metal box", "A cable tray", "A disconnect"],
    correct: 0,
  },
  {
    entryId: "smurf-tube",
    prompt: "What is the proper name for smurf tube?",
    answers: ["FMC", "ENT", "RMC"],
    correct: 1,
  },
  {
    entryId: "ticker",
    prompt: "Which tool might your crew call a ticker or beep stick?",
    answers: ["Clamp meter", "Circuit tracer", "Non-contact voltage tester"],
    correct: 2,
  },
  {
    entryId: "dogleg",
    prompt: "What does a dogleg describe?",
    answers: ["A twisted offset", "A long sweep", "A four-point saddle"],
    correct: 0,
  },
];

const FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "slang", label: "Slang" },
  { id: "tools", label: "Tools" },
  { id: "materials", label: "Materials" },
  { id: "raceways", label: "Raceways" },
  { id: "boxes", label: "Boxes" },
  { id: "theory", label: "Theory" },
  { id: "jobsite", label: "Jobsite" },
];

const FEATURED_IDS = ["battleship", "smurf-tube", "four-square", "beater", "home-run", "ticker"];

function pulse(style: "selection" | "success" | "error" = "selection") {
  if (style === "success") {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  } else if (style === "error") {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  } else {
    Haptics.selectionAsync().catch(() => {});
  }
}

function filterEntries(filter: CategoryFilter): TradeTalkEntry[] {
  if (filter === "all") {
    return FEATURED_IDS.map(getTradeTalkEntry).filter((entry): entry is TradeTalkEntry => !!entry);
  }
  if (filter === "slang") {
    return TRADE_TALK_ENTRIES.filter(({ kind }) => kind !== "formal");
  }
  return TRADE_TALK_ENTRIES.filter(({ category }) => category === filter);
}

export default function TradeTalkScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [selectedEntry, setSelectedEntry] = useState<TradeTalkEntry | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);

  useEffect(() => {
    loadTradeTalkPreferences()
      .then((saved) => {
        setFavoriteIds(saved.favoriteIds);
        setRecentIds(saved.recentIds);
      })
      .finally(() => setPreferencesLoaded(true));
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;
    saveTradeTalkPreferences({ favoriteIds, recentIds }).catch(() => {});
  }, [favoriteIds, preferencesLoaded, recentIds]);

  const dailyEntry = getDailyTradeTalkEntry();
  const quiz = QUIZ_QUESTIONS[quizIndex];
  const searchResults = useMemo(() => searchTradeTalk(query, { limit: 40 }), [query]);
  const browseEntries = useMemo(() => filterEntries(filter), [filter]);
  const favoriteEntries = favoriteIds
    .map(getTradeTalkEntry)
    .filter((entry): entry is TradeTalkEntry => !!entry);
  const recentEntries = recentIds
    .map(getTradeTalkEntry)
    .filter((entry): entry is TradeTalkEntry => !!entry)
    .slice(0, 4);
  const isSearching = query.trim().length > 0;

  function openEntry(entry: TradeTalkEntry) {
    pulse();
    setSelectedEntry(entry);
    setRecentIds((current) => addRecentTradeTalkEntry(current, entry.id));
  }

  function toggleFavorite(id: string) {
    pulse();
    setFavoriteIds((current) =>
      current.includes(id)
        ? current.filter((candidate) => candidate !== id)
        : [id, ...current],
    );
  }

  function answerQuiz(answerIndex: number) {
    if (quizAnswer !== null) return;
    setQuizAnswer(answerIndex);
    pulse(answerIndex === quiz.correct ? "success" : "error");
  }

  function nextQuiz() {
    pulse();
    setQuizAnswer(null);
    setQuizIndex((current) => (current + 1) % QUIZ_QUESTIONS.length);
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Return to toolbox home"
          accessibilityRole="button"
          onPress={() => {
            pulse();
            router.replace("/");
          }}
          style={({ pressed }) => [styles.homeButton, pressed && styles.pressed]}
        >
          <Text style={styles.homeButtonText}>← Home</Text>
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerEyebrow}>TRADE TALK</Text>
          <Text style={styles.headerTitle}>Speak electrician.</Text>
        </View>
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroBolt}><Text style={styles.heroBoltText}>ϟ</Text></View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>What did they just call it?</Text>
            <Text style={styles.heroHint}>Real electrical terms. Real jobsite slang.</Text>
          </View>
          <View style={styles.speechMarks}><Text style={styles.speechMarksText}>“ ”</Text></View>
        </View>

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel="Search electrical terms and slang"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder="Try “battleship” or “1900 box”"
            placeholderTextColor="#65717D"
            returnKeyType="search"
            style={styles.searchInput}
            value={query}
          />
          {query ? (
            <Pressable
              accessibilityLabel="Clear search"
              accessibilityRole="button"
              onPress={() => {
                pulse();
                setQuery("");
              }}
              style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
            ><Text style={styles.clearButtonText}>×</Text></Pressable>
          ) : null}
        </View>

        {isSearching ? (
          <View style={styles.searchSection}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{searchResults.length ? "Best matches" : "No translation yet"}</Text>
              <Text style={styles.resultCount}>{searchResults.length} FOUND</Text>
            </View>
            {searchResults.length ? (
              <View style={styles.entryList}>
                {searchResults.map((entry) => (
                  <EntryRow
                    entry={entry}
                    favorite={favoriteIds.includes(entry.id)}
                    key={entry.id}
                    onPress={() => openEntry(entry)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>?</Text>
                <View style={styles.emptyCopy}>
                  <Text style={styles.emptyTitle}>Your crew may have invented that one.</Text>
                  <Text style={styles.emptyHint}>Try the proper name, another spelling, or one word from the phrase.</Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <>
            <Pressable
              accessibilityHint={`Opens ${dailyEntry.term}`}
              accessibilityRole="button"
              onPress={() => openEntry(dailyEntry)}
              style={({ pressed }) => [styles.dailyCard, pressed && styles.pressed]}
            >
              <View style={styles.dailyTopRow}>
                <View style={styles.dailyBadge}><Text style={styles.dailyBadgeText}>SLANG OF THE DAY</Text></View>
                <Text style={styles.dailyArrow}>↗</Text>
              </View>
              <Text style={styles.dailyTerm}>{dailyEntry.term}</Text>
              <Text style={styles.dailyOfficial}>{dailyEntry.officialName ?? dailyEntry.definition}</Text>
              <Text numberOfLines={2} style={styles.dailyDefinition}>{dailyEntry.definition}</Text>
            </Pressable>

            <View style={styles.sectionRow}>
              <View>
                <Text style={styles.sectionEyebrow}>LEARN THE LANGUAGE</Text>
                <Text style={styles.sectionTitle}>Quick jobsite quiz</Text>
              </View>
              <Text style={styles.quizProgress}>{quizIndex + 1}/{QUIZ_QUESTIONS.length}</Text>
            </View>
            <View style={styles.quizCard}>
              <Text style={styles.quizPrompt}>{quiz.prompt}</Text>
              <View style={styles.quizAnswers}>
                {quiz.answers.map((answer, index) => {
                  const answered = quizAnswer !== null;
                  const correct = answered && index === quiz.correct;
                  const incorrect = answered && index === quizAnswer && index !== quiz.correct;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      disabled={answered}
                      key={answer}
                      onPress={() => answerQuiz(index)}
                      style={({ pressed }) => [
                        styles.quizAnswer,
                        correct && styles.quizAnswerCorrect,
                        incorrect && styles.quizAnswerIncorrect,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={[styles.answerLetter, correct && styles.answerLetterCorrect, incorrect && styles.answerLetterIncorrect]}>
                        <Text style={styles.answerLetterText}>{String.fromCharCode(65 + index)}</Text>
                      </View>
                      <Text style={styles.quizAnswerText}>{answer}</Text>
                      {correct ? <Text style={styles.answerMark}>✓</Text> : incorrect ? <Text style={styles.answerMarkIncorrect}>×</Text> : null}
                    </Pressable>
                  );
                })}
              </View>
              {quizAnswer !== null ? (
                <View style={styles.quizFeedback}>
                  <Text style={styles.quizFeedbackTitle}>{quizAnswer === quiz.correct ? "That’s it." : "Good guess—here’s the trade answer."}</Text>
                  <Pressable accessibilityRole="button" onPress={nextQuiz} style={styles.nextQuizButton}>
                    <Text style={styles.nextQuizText}>Next one →</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>

            {favoriteEntries.length ? (
              <EntrySection entries={favoriteEntries.slice(0, 4)} eyebrow="YOUR TOOLBELT" onOpen={openEntry} title="Favorites" favoriteIds={favoriteIds} />
            ) : null}

            {recentEntries.length ? (
              <EntrySection entries={recentEntries} eyebrow="PICK UP WHERE YOU LEFT OFF" onOpen={openEntry} title="Recent" favoriteIds={favoriteIds} />
            ) : null}

            <View style={styles.sectionRow}>
              <View>
                <Text style={styles.sectionEyebrow}>OFFLINE STARTER PACK</Text>
                <Text style={styles.sectionTitle}>Browse the trade</Text>
              </View>
              <Text style={styles.entryCount}>{TRADE_TALK_ENTRIES.length} TERMS</Text>
            </View>
            <ScrollView
              contentContainerStyle={styles.filterRow}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {FILTERS.map((option) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: filter === option.id }}
                  key={option.id}
                  onPress={() => {
                    pulse();
                    setFilter(option.id);
                  }}
                  style={({ pressed }) => [
                    styles.filterChip,
                    filter === option.id && styles.filterChipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.filterChipText, filter === option.id && styles.filterChipTextSelected]}>{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.entryList}>
              {browseEntries.map((entry) => (
                <EntryRow
                  entry={entry}
                  favorite={favoriteIds.includes(entry.id)}
                  key={entry.id}
                  onPress={() => openEntry(entry)}
                />
              ))}
            </View>

            <View style={styles.communityNote}>
              <Text style={styles.communityIcon}>＋</Text>
              <View style={styles.communityCopy}>
                <Text style={styles.communityTitle}>Every crew speaks a little differently.</Text>
                <Text style={styles.communityText}>Regional packs and moderated community submissions are coming after we field-test the starter dictionary.</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <EntrySheet
        entry={selectedEntry}
        favorite={selectedEntry ? favoriteIds.includes(selectedEntry.id) : false}
        onClose={() => setSelectedEntry(null)}
        onToggleFavorite={() => selectedEntry && toggleFavorite(selectedEntry.id)}
      />
    </SafeAreaView>
  );
}

function EntrySection({ entries, eyebrow, favoriteIds, onOpen, title }: { entries: TradeTalkEntry[]; eyebrow: string; favoriteIds: string[]; onOpen: (entry: TradeTalkEntry) => void; title: string }) {
  return (
    <View style={styles.savedSection}>
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.entryList}>
        {entries.map((entry) => (
          <EntryRow entry={entry} favorite={favoriteIds.includes(entry.id)} key={entry.id} onPress={() => onOpen(entry)} />
        ))}
      </View>
    </View>
  );
}

function EntryRow({ entry, favorite, onPress }: { entry: TradeTalkEntry; favorite: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityHint={`Opens the definition for ${entry.term}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.entryRow, pressed && styles.pressed]}
    >
      <KindBadge kind={entry.kind} />
      <View style={styles.entryCopy}>
        <View style={styles.entryTitleRow}>
          <Text style={styles.entryTerm}>{entry.term}</Text>
          {favorite ? <Text style={styles.favoriteStar}>★</Text> : null}
        </View>
        <Text numberOfLines={1} style={styles.entryOfficial}>{entry.officialName ?? CATEGORY_LABELS[entry.category]}</Text>
      </View>
      <Text style={styles.entryArrow}>›</Text>
    </Pressable>
  );
}

function KindBadge({ kind }: { kind: TradeTalkKind }) {
  const letters: Record<TradeTalkKind, string> = { formal: "A", slang: "S", brand: "B", regional: "R" };
  return (
    <View style={[styles.kindBadge, kind === "formal" && styles.kindBadgeFormal, kind === "regional" && styles.kindBadgeRegional]}>
      <Text style={styles.kindBadgeText}>{letters[kind]}</Text>
    </View>
  );
}

function EntrySheet({ entry, favorite, onClose, onToggleFavorite }: { entry: TradeTalkEntry | null; favorite: boolean; onClose: () => void; onToggleFavorite: () => void }) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={entry !== null}>
      <SafeAreaProvider>
        <SafeAreaView edges={["top", "bottom"]} style={styles.modalSafe}>
          <Pressable style={styles.modalScrim} onPress={onClose} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            {entry ? (
              <>
                <View style={styles.sheetHeader}>
                  <View style={styles.sheetHeadingCopy}>
                    <Text style={styles.sheetEyebrow}>{KIND_LABELS[entry.kind].toUpperCase()}</Text>
                    <Text style={styles.sheetTitle}>{entry.term}</Text>
                  </View>
                  <Pressable
                    accessibilityLabel={favorite ? "Remove from favorites" : "Add to favorites"}
                    accessibilityRole="button"
                    onPress={onToggleFavorite}
                    style={[styles.sheetFavorite, favorite && styles.sheetFavoriteSelected]}
                  ><Text style={[styles.sheetFavoriteText, favorite && styles.sheetFavoriteTextSelected]}>{favorite ? "★" : "☆"}</Text></Pressable>
                  <Pressable accessibilityRole="button" onPress={onClose} style={styles.doneButton}>
                    <Text style={styles.doneButtonText}>Done</Text>
                  </Pressable>
                </View>
                <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
                  {entry.officialName ? (
                    <View style={styles.officialCard}>
                      <Text style={styles.officialLabel}>PROPER NAME</Text>
                      <Text style={styles.officialValue}>{entry.officialName}</Text>
                    </View>
                  ) : null}

                  <DetailBlock label="What it means" text={entry.definition} />
                  <DetailBlock label="On the job" text={entry.fieldUse} />

                  {entry.aliases.length ? (
                    <View style={styles.detailBlock}>
                      <Text style={styles.detailLabel}>YOU MAY ALSO HEAR</Text>
                      <View style={styles.aliasWrap}>
                        {entry.aliases.map((alias) => <View style={styles.aliasChip} key={alias}><Text style={styles.aliasText}>{alias}</Text></View>)}
                      </View>
                    </View>
                  ) : null}

                  {entry.region ? (
                    <View style={styles.regionNote}>
                      <Text style={styles.regionIcon}>⌖</Text>
                      <View style={styles.noteCopy}>
                        <Text style={styles.noteTitle}>REGIONAL LANGUAGE</Text>
                        <Text style={styles.noteText}>{entry.region}. Ask what your crew means when context is unclear.</Text>
                      </View>
                    </View>
                  ) : null}

                  {entry.safetyNote ? (
                    <View style={styles.safetyNote}>
                      <Text style={styles.safetyIcon}>!</Text>
                      <View style={styles.noteCopy}>
                        <Text style={styles.safetyTitle}>FIELD SAFETY</Text>
                        <Text style={styles.noteText}>{entry.safetyNote}</Text>
                      </View>
                    </View>
                  ) : null}

                  <Text style={styles.languageNote}>Trade names vary by company, region, generation, and local practice. Use the proper name when ordering material or when precision matters.</Text>
                </ScrollView>
              </>
            ) : null}
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

function DetailBlock({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.detailBlock}>
      <Text style={styles.detailLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}
