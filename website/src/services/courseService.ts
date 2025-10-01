import { Course } from '../types/course';
import tradingCourseConfig from '../config/trading-course.json';

export class CourseService {
  private static instance: CourseService;
  private course: Course;

  private constructor() {
    this.course = tradingCourseConfig as Course;
  }

  public static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  public getCourse(): Course {
    return this.course;
  }

  public getChapter(chapterId: string) {
    return this.course.chapters.find(chapter => chapter.chapterId === chapterId);
  }

  public getLesson(chapterId: string, lessonId: string) {
    const chapter = this.getChapter(chapterId);
    return chapter?.lessons.find(lesson => lesson.lessonId === lessonId);
  }

  public findLessonById(lessonId: string) {
    for (const chapter of this.course.chapters) {
      const lesson = chapter.lessons.find(item => item.lessonId === lessonId);
      if (lesson) {
        return { chapter, lesson };
      }
    }
    return null;
  }

  public getQuiz(chapterId: string, quizId: string) {
    const chapter = this.getChapter(chapterId);
    return chapter?.quizzes.find(quiz => quiz.quizId === quizId);
  }

  public findQuizById(quizId: string) {
    for (const chapter of this.course.chapters) {
      const quiz = chapter.quizzes.find(item => item.quizId === quizId);
      if (quiz) {
        return { chapter, quiz };
      }
    }
    return null;
  }

  public getChapterProgress(chapterId: string, completedLessons: string[], completedQuizzes: string[]) {
    const chapter = this.getChapter(chapterId);
    if (!chapter) return { completed: false, progress: 0 };

    const totalItems = chapter.lessons.length + chapter.quizzes.length;
    const completedItems = [
      ...chapter.lessons.filter(lesson => completedLessons.includes(lesson.lessonId)),
      ...chapter.quizzes.filter(quiz => completedQuizzes.includes(quiz.quizId))
    ].length;

    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    const completed = progress === 100;

    return { completed, progress };
  }

  public getCourseProgress(completedLessons: string[], completedQuizzes: string[]) {
    const chapters = this.course.chapters;
    let totalItems = 0;
    let completedItems = 0;

    chapters.forEach(chapter => {
      totalItems += chapter.lessons.length + chapter.quizzes.length;
      completedItems += chapter.lessons.filter(lesson => completedLessons.includes(lesson.lessonId)).length;
      completedItems += chapter.quizzes.filter(quiz => completedQuizzes.includes(quiz.quizId)).length;
    });

    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  }
}
