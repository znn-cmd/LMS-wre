-- SQL script to create tables for WRE LMS (Safe version - drops existing objects first)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/cndmouefqjfmxgovrzbx/sql

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS "Certificate" CASCADE;
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "TeamMember" CASCADE;
DROP TABLE IF EXISTS "TestAnswer" CASCADE;
DROP TABLE IF EXISTS "TestAttempt" CASCADE;
DROP TABLE IF EXISTS "LessonProgress" CASCADE;
DROP TABLE IF EXISTS "TestAssignment" CASCADE;
DROP TABLE IF EXISTS "CourseAssignment" CASCADE;
DROP TABLE IF EXISTS "QuestionBank" CASCADE;
DROP TABLE IF EXISTS "Question" CASCADE;
DROP TABLE IF EXISTS "Test" CASCADE;
DROP TABLE IF EXISTS "ContentBlock" CASCADE;
DROP TABLE IF EXISTS "Lesson" CASCADE;
DROP TABLE IF EXISTS "Module" CASCADE;
DROP TABLE IF EXISTS "Course" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Drop existing enum types
DROP TYPE IF EXISTS "TestAttemptStatus" CASCADE;
DROP TYPE IF EXISTS "LessonProgressStatus" CASCADE;
DROP TYPE IF EXISTS "QuestionType" CASCADE;
DROP TYPE IF EXISTS "ContentBlockType" CASCADE;
DROP TYPE IF EXISTS "CourseStatus" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TEACHER', 'TEAM_LEAD', 'STUDENT');
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ContentBlockType" AS ENUM ('TEXT', 'VIDEO', 'AUDIO', 'FILE', 'GALLERY', 'ASSIGNMENT', 'EMBED');
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'MATCHING', 'ORDERING', 'SHORT_TEXT');
CREATE TYPE "LessonProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE "TestAttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');

-- Create User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "department" TEXT,
    "team" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create Course table
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionRu" TEXT,
    "descriptionEn" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- Create Module table
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- Create Lesson table
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "estimatedTime" INTEGER NOT NULL,
    "minimumTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- Create ContentBlock table
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "type" "ContentBlockType" NOT NULL,
    "order" INTEGER NOT NULL,
    "contentRu" JSONB,
    "contentEn" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- Create Test table
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descriptionRu" TEXT,
    "descriptionEn" TEXT,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "timeLimit" INTEGER,
    "maxAttempts" INTEGER,
    "allowRetake" BOOLEAN NOT NULL DEFAULT true,
    "randomizeQuestions" BOOLEAN NOT NULL DEFAULT false,
    "shuffleAnswers" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- Create Question table
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "order" INTEGER NOT NULL,
    "questionRu" TEXT NOT NULL,
    "questionEn" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" JSONB NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "explanationRu" TEXT,
    "explanationEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- Create QuestionBank table
CREATE TABLE "QuestionBank" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "tags" TEXT[],
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionBank_pkey" PRIMARY KEY ("id")
);

-- Create CourseAssignment table
CREATE TABLE "CourseAssignment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseAssignment_pkey" PRIMARY KEY ("id")
);

-- Create TestAssignment table
CREATE TABLE "TestAssignment" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "courseId" TEXT,
    "userId" TEXT,
    "groupId" TEXT,
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestAssignment_pkey" PRIMARY KEY ("id")
);

-- Create LessonProgress table
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "LessonProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "activeTime" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- Create TestAttempt table
CREATE TABLE "TestAttempt" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "TestAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "score" DOUBLE PRECISION,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "timeSpent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestAttempt_pkey" PRIMARY KEY ("id")
);

-- Create TestAnswer table
CREATE TABLE "TestAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "isCorrect" BOOLEAN,
    "points" DOUBLE PRECISION,
    "timeSpent" INTEGER,
    "answerChanges" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestAnswer_pkey" PRIMARY KEY ("id")
);

-- Create TeamMember table
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamLeadId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- Create AuditLog table
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" INET,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Create Certificate table
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "testId" TEXT,
    "titleRu" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "CourseAssignment_courseId_userId_key" ON "CourseAssignment"("courseId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "LessonProgress_lessonId_userId_key" ON "LessonProgress"("lessonId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_teamLeadId_memberId_key" ON "TeamMember"("teamLeadId", "memberId");
CREATE UNIQUE INDEX IF NOT EXISTS "TestAnswer_attemptId_questionId_key" ON "TestAnswer"("attemptId", "questionId");

-- Create foreign keys
ALTER TABLE "Course" ADD CONSTRAINT "Course_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Test" ADD CONSTRAINT "Test_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionBank" ADD CONSTRAINT "QuestionBank_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseAssignment" ADD CONSTRAINT "CourseAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseAssignment" ADD CONSTRAINT "CourseAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TestAssignment" ADD CONSTRAINT "TestAssignment_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TestAssignment" ADD CONSTRAINT "TestAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TestAnswer" ADD CONSTRAINT "TestAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "TestAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TestAnswer" ADD CONSTRAINT "TestAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamLeadId_fkey" FOREIGN KEY ("teamLeadId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

