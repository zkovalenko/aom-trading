-- Track lesson completion per user
CREATE TABLE IF NOT EXISTS course_lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chapter_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT course_lesson_progress_user_lesson_unique UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_course_lesson_progress_user ON course_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_lesson_progress_lesson ON course_lesson_progress(lesson_id);

-- Track quiz completion/attempts per user
CREATE TABLE IF NOT EXISTS course_quiz_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chapter_id TEXT NOT NULL,
    quiz_id TEXT NOT NULL,
    score INTEGER,
    passed BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 1,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT course_quiz_progress_user_quiz_unique UNIQUE (user_id, quiz_id)
);

CREATE INDEX IF NOT EXISTS idx_course_quiz_progress_user ON course_quiz_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_quiz_progress_quiz ON course_quiz_progress(quiz_id);
