import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function Results() {
  // Get params from URL
  const { score, total, categoryId, categoryName } = useLocalSearchParams<{
    score: string;
    total: string;
    categoryId: string;
    categoryName: string;
  }>();

  const [playerName, setPlayerName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Convert string params to numbers
  const scoreNum = parseInt(score);
  const totalNum = parseInt(total);
  const percentage = Math.round((scoreNum / totalNum) * 100);

  const getMessage = () => {
    if (percentage === 100) return "Perfect Score! 🏆";
    if (percentage >= 80) return "Excellent Work! ⭐";
    if (percentage >= 60) return "Good Job! 👍";
    if (percentage >= 40) return "Not Bad! 💪";
    return "Keep Practicing! 📚";
  };

  const getScoreColor = () => {
    if (percentage >= 80) return "#16a34a"; // green-600
    if (percentage >= 60) return "#2563eb"; // blue-600
    if (percentage >= 40) return "#d97706"; // amber-600
    return "#ea580c"; // orange-600
  };

  const handleSubmitScore = async () => {
    if (!playerName.trim()) return;

    try {
      const { error } = await supabase.from("leaderboard").insert({
        player_name: playerName.trim(),
        category_id: categoryId,
        score: scoreNum,
        total_questions: totalNum,
      } as any);

      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting score:", error);
      Alert.alert("Error", "Failed to submit score. Please try again.");
    }
  };

  const handlePlayAgain = () => {
    router.replace({
      pathname: "/quiz",
      params: { categoryId, categoryName },
    });
  };

  const handleBackToCategories = () => {
    router.navigate("/(tabs)");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        {/* Trophy Icon */}
        <View style={styles.trophyContainer}>
          <Text style={styles.trophyIcon}>🏆</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Quiz Complete!</Text>

        {/* Score Display */}
        <View style={styles.scoreSection}>
          <Text style={[styles.scoreText, { color: getScoreColor() }]}>
            {scoreNum} / {totalNum}
          </Text>
          <Text style={styles.messageText}>{getMessage()}</Text>
          <Text style={styles.categoryText}>Category: {categoryName}</Text>
        </View>

        {/* Leaderboard Section */}
        {!submitted ? (
          // Replace the inputRow styles and leaderboardContainer section with this:

          <View style={styles.leaderboardContainer}>
            <View style={styles.leaderboardHeader}>
              <Text style={styles.sparkleIcon}>✨</Text>
              <Text style={styles.leaderboardTitle}>Save to Leaderboard</Text>
            </View>
            <View style={styles.inputColumn}>
              <TextInput
                style={styles.input}
                value={playerName}
                onChangeText={setPlayerName}
                placeholder="Enter your name"
                maxLength={20}
                textAlign="center"
              />
              <TouchableOpacity
                onPress={handleSubmitScore}
                disabled={!playerName.trim()}
                style={[
                  styles.submitButton,
                  !playerName.trim() && styles.submitButtonDisabled,
                ]}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              ✓ Score saved to leaderboard!
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handlePlayAgain}
            style={styles.playAgainButton}
            activeOpacity={0.8}
          >
            <Text style={styles.playAgainIcon}>🔄</Text>
            <Text style={styles.playAgainText}>Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBackToCategories}
            style={styles.categoriesButton}
            activeOpacity={0.8}
          >
            <Text style={styles.categoriesIcon}>🏠</Text>
            <Text style={styles.categoriesText}>Categories</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  card: {
    width: "100%",
    maxWidth: 600,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 48,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  trophyContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  trophyIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  scoreSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  scoreText: {
    fontSize: 56,
    fontWeight: "bold",
    marginBottom: 16,
  },
  messageText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 16,
    color: "#64748b",
  },
  leaderboardContainer: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
  },
  leaderboardHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sparkleIcon: {
    fontSize: 20,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
  },
  inputColumn: {
    width: "100%",
    gap: 12,
  },
  input: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 16, // Increased from 12
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    fontSize: 18, // Increased from 16
    backgroundColor: "#ffffff",
  },
  submitButton: {
    width: "100%",
    paddingVertical: 16, // Increased from 12
    backgroundColor: "#f59e0b",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  successContainer: {
    width: "100%",
    backgroundColor: "#f0fdf4",
    borderWidth: 2,
    borderColor: "#bbf7d0",
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
  },
  successText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#15803d",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  playAgainButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  playAgainIcon: {
    fontSize: 20,
  },
  playAgainText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  categoriesButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  categoriesIcon: {
    fontSize: 20,
  },
  categoriesText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 16,
  },
});
