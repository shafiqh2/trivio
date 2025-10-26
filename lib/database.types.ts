export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          icon: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          color?: string
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          category_id: string
          question_text: string
          correct_answer: string
          incorrect_answers: string[]
          difficulty: string
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          question_text: string
          correct_answer: string
          incorrect_answers: string[]
          difficulty?: string
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          question_text?: string
          correct_answer?: string
          incorrect_answers?: string[]
          difficulty?: string
          created_at?: string
        }
      }
      leaderboard: {
        Row: {
          id: string
          player_name: string
          category_id: string
          score: number
          total_questions: number
          completed_at: string
        }
        Insert: {
          id?: string
          player_name: string
          category_id: string
          score: number
          total_questions: number
          completed_at?: string
        }
        Update: {
          id?: string
          player_name?: string
          category_id?: string
          score?: number
          total_questions?: number
          completed_at?: string
        }
      }
    }
  }
}
