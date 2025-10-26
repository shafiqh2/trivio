import { supabase } from "@/lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Icons from "lucide-react-native";
import { Atom, Brain, Trophy } from "lucide-react-native";
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

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      console.log("Data: ", data)
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Brain;
    return Icon;
  };

  const getColorGradient = (colorClass: string): [string, string] => {
    const colorMap: { [key: string]: [string, string] } = {
      "bg-gradient-to-br from-purple-500 to-pink-500": ["#a855f7", "#ec4899"],
      "bg-gradient-to-br from-blue-500 to-cyan-500": ["#3b82f6", "#06b6d4"],
      "bg-gradient-to-br from-green-500 to-emerald-500": ["#22c55e", "#10b981"],
      "bg-gradient-to-br from-orange-500 to-red-500": ["#f97316", "#ef4444"],
      "bg-gradient-to-br from-indigo-500 to-purple-500": ["#6366f1", "#a855f7"],
      "bg-gradient-to-br from-yellow-500 to-orange-500": ["#eab308", "#f97316"],
    };
    return colorMap[colorClass] || ["#3b82f6", "#06b6d4"];
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Atom color="#f59e0b" size={40} />
              <LinearGradient
                colors={["#2563eb", "#06b6d4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.titleGradient}
              >
                <Text style={styles.title}>Trivio</Text>
              </LinearGradient>
              <Atom color="#f59e0b" size={40} />
            </View>
            <Text style={styles.subtitle}>
              Test your knowledge across multiple categories
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : (
            <>
              {/* Categories Grid */}
              <View style={styles.grid}>
                {categories.map((category) => {
                  const Icon = getIcon(category.icon);
                  const [startColor, endColor] = getColorGradient(
                    category.color
                  );

                  return (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => {
                        router.push({
                          pathname: "/quiz",
                          params: {
                            categoryId: category.id,
                            categoryName: category.name,
                          },
                        });
                      }}
                      activeOpacity={0.8}
                      style={styles.categoryButton}
                    >
                      <LinearGradient
                        colors={[startColor, endColor]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.categoryGradient}
                      >
                        <View style={styles.iconContainer}>
                          <Icon color="#fbbf24" size={48} />
                        </View>
                        <Text style={styles.categoryName}>{category.name}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Leaderboard Button */}
              <View style={styles.leaderboardContainer}>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/(tabs)/leaderboard");
                  }}
                  activeOpacity={0.8}
                  style={styles.leaderboardButton}
                >
                  <Trophy color="#f59e0b" size={24} />
                  <Text style={styles.leaderboardText}>View Leaderboard</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  content: {
    width: "100%",
    maxWidth: 896,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  titleGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  title: {
    fontSize: 56,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 20,
    color: "#475569",
    textAlign: "center",
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
    marginBottom: 32,
    justifyContent: "center",
  },
  categoryButton: {
    width: "45%",
    minWidth: 150,
    aspectRatio: 1,
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  categoryGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  iconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 16,
    borderRadius: 50,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  leaderboardContainer: {
    alignItems: "center",
  },
  leaderboardButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fbbf24",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  leaderboardText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
  },
});