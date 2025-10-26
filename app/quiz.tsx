import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import { supabase } from "../lib/supabase";

interface Question {
  id: string;
  question_text: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export default function Quiz() {
  // Get params from the URL
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
  }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (categoryId) {
      loadQuestions();
    }
  }, [categoryId]);

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const current = questions[currentIndex];
      const allAnswers = [current.correct_answer, ...current.incorrect_answers];
      setShuffledAnswers(shuffleArray([...allAnswers]));
    }
  }, [questions, currentIndex]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("category_id", categoryId);

      if (error) throw error;

      if (data && data.length > 0) {
        const shuffled = shuffleArray(data);
        setQuestions(shuffled.slice(0, 5));
      }
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = (answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === questions[currentIndex].correct_answer;
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Navigate to results screen with data
      const finalScore =
        score +
        (selectedAnswer === questions[currentIndex].correct_answer ? 1 : 0);
      router.replace({
        pathname: "/results",
        params: {
          score: finalScore.toString(),
          total: questions.length.toString(),
          categoryId: categoryId,
          categoryName: categoryName,
        },
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>
            No questions available for this category yet.
          </Text>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Back to Categories</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion.correct_answer;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backHeaderButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#475569" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.questionCounter}>
              Question {currentIndex + 1} of {questions.length}
            </Text>
          </View>

          {/* Quiz Card */}
          <View style={styles.quizCard}>
            {/* Category Badge */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{categoryName}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  },
                ]}
              />
            </View>

            {/* Question */}
            <Text style={styles.questionText}>
              {currentQuestion.question_text}
            </Text>

            {/* Answer Options */}
            <View style={styles.answersContainer}>
              {shuffledAnswers.map((answer, index) => {
                const isSelected = selectedAnswer === answer;
                const isCorrectAnswer =
                  answer === currentQuestion.correct_answer;

                const buttonStyle = [styles.answerButton];
                const textStyle = [styles.answerText];

                if (!showFeedback) {
                  buttonStyle.push(styles.answerButtonDefault);
                } else if (isCorrectAnswer) {
                  buttonStyle.push(styles.answerButtonCorrect);
                } else if (isSelected && !isCorrect) {
                  buttonStyle.push(styles.answerButtonIncorrect);
                } else {
                  buttonStyle.push(styles.answerButtonDisabled);
                }

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleAnswerClick(answer)}
                    disabled={showFeedback}
                    style={buttonStyle}
                    activeOpacity={0.7}
                  >
                    <View style={styles.answerContent}>
                      <Text style={textStyle}>{answer}</Text>
                      {showFeedback && isCorrectAnswer && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#22c55e"
                        />
                      )}
                      {showFeedback && isSelected && !isCorrect && (
                        <Ionicons
                          name="close-circle"
                          size={24}
                          color="#ef4444"
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Feedback Message */}
            {showFeedback && (
              <View
                style={[
                  styles.feedbackContainer,
                  isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect,
                ]}
              >
                <Text
                  style={[
                    styles.feedbackText,
                    isCorrect
                      ? styles.feedbackTextCorrect
                      : styles.feedbackTextIncorrect,
                  ]}
                >
                  {isCorrect ? "🎉 Correct!" : "❌ Oops! Not quite right."}
                </Text>
              </View>
            )}
          </View>

          {/* Next Button */}
          {showFeedback && (
            <View style={styles.nextButtonContainer}>
              <TouchableOpacity
                onPress={handleNext}
                style={styles.nextButton}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>
                  {currentIndex < questions.length - 1
                    ? "Next Question"
                    : "See Results"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ... styles remain the same (keep all your existing styles)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    flexGrow: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    maxWidth: 768,
    width: "100%",
    alignSelf: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  emptyContent: {
    alignItems: "center",
  },
  emptyText: {
    fontSize: 24,
    color: "#475569",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  backHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    fontSize: 16,
    color: "#475569",
  },
  questionCounter: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  quizCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryText: {
    color: "#1d4ed8",
    fontSize: 14,
    fontWeight: "500",
  },
  progressBarContainer: {
    width: "100%",
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginBottom: 32,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 32,
    lineHeight: 32,
  },
  answersContainer: {
    gap: 16,
    marginBottom: 24,
  },
  answerButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  answerButtonDefault: {
    borderColor: "#e2e8f0",
    backgroundColor: "white",
  },
  answerButtonCorrect: {
    borderColor: "#22c55e",
    backgroundColor: "#f0fdf4",
  },
  answerButtonIncorrect: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  answerButtonDisabled: {
    borderColor: "#e2e8f0",
    opacity: 0.5,
  },
  answerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  answerText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#334155",
    flex: 1,
  },
  feedbackContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  feedbackCorrect: {
    backgroundColor: "#dcfce7",
  },
  feedbackIncorrect: {
    backgroundColor: "#fee2e2",
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: "600",
  },
  feedbackTextCorrect: {
    color: "#15803d",
  },
  feedbackTextIncorrect: {
    color: "#dc2626",
  },
  nextButtonContainer: {
    alignItems: "center",
  },
  nextButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
