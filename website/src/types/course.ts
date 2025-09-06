export interface CourseOption {
  optionId: string;
  text: string;
  isCorrect?: boolean;
  order: number;
}

export interface CourseQuestion {
  questionId: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  order: number;
  points?: number;
  options?: CourseOption[];
  correctAnswer?: string;
}

export interface CourseQuiz {
  quizId: string;
  name: string;
  description?: string;
  order: number;
  passingScore?: number;
  maxAttempts?: number;
  questions: CourseQuestion[];
}

export interface CourseLesson {
  lessonId: string;
  name: string;
  description?: string;
  order: number;
  contentType: 'text' | 'video' | 'interactive' | 'document';
  contentPath?: string;
  estimatedMinutes?: number;
}

export interface CourseChapter {
  chapterId: string;
  name: string;
  description?: string;
  order: number;
  lessons: CourseLesson[];
  quizzes: CourseQuiz[];
}

export interface Course {
  courseId: string;
  name: string;
  description?: string;
  version: string;
  chapters: CourseChapter[];
}

export interface UserProgress {
  lessonId?: string;
  quizId?: string;
  completed: boolean;
  completedAt?: string;
  score?: number;
  attempts?: number;
}