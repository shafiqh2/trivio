import { router } from "expo-router";
import { ArrowLeft, Award, Medal, Trophy } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  total_questions: number;
  completed_at: string;
  category_id: string;
  category_name?: string;
}

interface LeaderboardProps {
  onBack: () => void;
}

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  useEffect(() => {
    loadCategories();
    loadLeaderboard();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      let query = supabase
        .from("leaderboard")
        .select(
          `
          id,
          player_name,
          score,
          total_questions,
          completed_at,
          category_id,
          categories (name)
        `
        )
        .order("score", { ascending: false })
        .order("completed_at", { ascending: false })
        .limit(50);

      if (selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData = (data || []).map((entry: any) => ({
        id: entry.id,
        player_name: entry.player_name,
        score: entry.score,
        total_questions: entry.total_questions,
        completed_at: entry.completed_at,
        category_id: entry.category_id,
        category_name: entry.categories?.name,
      }));

      setEntries(formattedData);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy color="#f59e0b" size={24} />;
    if (index === 1) return <Medal color="#94a3b8" size={24} />;
    if (index === 2) return <Award color="#ea580c" size={24} />;
    return <Text style={styles.rankNumber}>#{index + 1}</Text>;
  };

  const getPercentage = (score: number, total: number) => {
    return Math.round((score / total) * 100);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#475569" size={20} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Trophy color="#f59e0b" size={32} />
          <Text style={styles.title}>Leaderboard</Text>
        </View>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Filter */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <TouchableOpacity
              onPress={() => setSelectedCategory("all")}
              style={[
                styles.filterButton,
                selectedCategory === "all" && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedCategory === "all" && styles.filterButtonTextActive,
                ]}
              >
                All Categories
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.filterButton,
                  selectedCategory === category.id && styles.filterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedCategory === category.id &&
                      styles.filterButtonTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Leaderboard Entries */}
        <View style={styles.entriesContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : entries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No scores yet. Be the first!</Text>
            </View>
          ) : (
            entries.map((entry, index) => (
              <View
                key={entry.id}
                style={[styles.entryCard, index < 3 && styles.entryCardTop]}
              >
                <View style={styles.entryContent}>
                  <View style={styles.medalContainer}>
                    {getMedalIcon(index)}
                  </View>
                  <View style={styles.entryInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.playerName}>{entry.player_name}</Text>
                      {selectedCategory === "all" && entry.category_name && (
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>
                            {entry.category_name}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.dateText}>
                      {new Date(entry.completed_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreText}>
                      {entry.score}/{entry.total_questions}
                    </Text>
                    <Text style={styles.percentageText}>
                      {getPercentage(entry.score, entry.total_questions)}%
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    fontSize: 16,
    color: "#475569",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
  },
  spacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  filterContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  filterScroll: {
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  filterButtonActive: {
    backgroundColor: "#3b82f6",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  filterButtonTextActive: {
    color: "white",
  },
  entriesContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#64748b",
  },
  entryCard: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  entryCardTop: {
    backgroundColor: "#fffbeb",
  },
  entryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  medalContainer: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
  },
  entryInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  playerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  categoryBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1d4ed8",
  },
  dateText: {
    fontSize: 14,
    color: "#64748b",
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
  },
  percentageText: {
    fontSize: 14,
    color: "#64748b",
  },
});
