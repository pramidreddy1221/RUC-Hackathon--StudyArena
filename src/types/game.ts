export interface MCQ {
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export interface Flashcard {
  front: string
  back: string
}

export interface FillInTheBlank {
  sentence: string
  blanks: {
    position: number
    correctAnswer: string
    options?: string[]
  }[]
}

export interface MiniQuiz {
  title: string
  questions: MCQ[]
  timeLimit?: number // in seconds
}

export type GameContentType = 'mcq' | 'flashcard' | 'fill-in-the-blank' | 'mini-quiz' | 'sql-level-1' | 'sql-level-2' | 'sql-level-3'

export interface GameContentItem {
  type: GameContentType
  data: MCQ | Flashcard | FillInTheBlank | MiniQuiz | SQLFixItem | SQLLogicItem | SQLLevelThreeItem
}

export interface SQLFixItem {
  id: number
  task: string
  answer: string
  type: 'sql-level-1'
}

export interface SQLLogicItem {
  id: number
  task: string
  answer: string
  type: 'sql-level-2'
}

export interface SQLLevelThreeItem {
  id: number
  task: string
  answer: string
  type: 'sql-level-3'
}

