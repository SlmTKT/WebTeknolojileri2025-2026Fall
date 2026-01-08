# School Management System

A comprehensive web-based School Management System built with **Next.js 14**, **Supabase**, and **Prisma**. This application features role-based access control for Admins, Teachers, and Students, providing tailored dashboards and functionalities for each user type.

## 🚀 Technologies

*   **Frontend:** Next.js 14 (App Router), Tailwind CSS, Shadcn/UI, Recharts
*   **Backend:** Next.js Server Actions
*   **Database:** Supabase (PostgreSQL)
*   **ORM:** Prisma
*   **Authentication:** Supabase Auth (Email/Password)
*   **Icons:** Lucide React

---

## ✨ Features

### 🛡️ Authentication & Roles
*   **Secure Sign Up/Login:** Email and password authentication via Supabase.
*   **Role-Based Access Control:**
    *   **Admin:** Full system control.
    *   **Teacher:** Manage assigned courses and students.
    *   **Student:** Browse courses, enroll, and view schedule.
*   **Middleware Protection:** Pages are protected server-side based on user roles.

### 👑 Admin Dashboard
*   **Stats Overview:** View total students, teachers, and courses.
*   **User Management:** List all users and promote users (e.g., Student -> Teacher).
*   **Course Management:** Create, edit, and delete courses.
    *   Assign teachers to courses.
    *   Set course type (**Online** or **Face-to-Face**).
    *   Set course capabilities.
*   **Visualizations:** Charts showing class distribution and teacher workload.

### 👨‍🏫 Teacher Dashboard
*   **Personalized Stats:** View total enrolled students and active classes.
*   **My Courses:** Filter to see only courses assigned to you.
*   **Student Management:** View enrolled students and remove them from classes if necessary.
*   **Claim Courses:** Ability to assign oneself to unassigned courses.

### 🎓 Student Dashboard
*   **Course Catalog:** Browse available courses with rich cards.
*   **Course Details Modal:** View detailed curriculum, summary, and live capacity status.
*   **Enrollment System:**
    *   **One-Click Enrollment:** Enroll in courses instantly.
    *   **Capacity Checks:** Prevents enrollment if face-to-face classes are full.
    *   **Drop Course:** Option to unenroll from a course.
*   **Live Updates:** Dashboard status refreshes automatically upon actions.

---

## 🛠️ Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd webproje
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
    NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
    ```

4.  **Database Migration:**
    Push the Prisma schema to your Supabase database:
    ```bash
    npx prisma db push
    ```

5.  **Seed Dummy Data (Optional):**
    Populate the database with 100 students, 20 teachers, and random courses:
    ```bash
    npx prisma db seed
    ```

6.  **Run the application:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Schema

The project uses a relational schema defined in `prisma/schema.prisma`.

*   **Users:** Stores login info and roles (`ADMIN`, `TEACHER`, `STUDENT`).
*   **Courses:** Contains course details, `type` (Face-to-Face/Online), and `capacity`.
*   **Enrollments:** Many-to-Many relationship table between Students and Courses.
*   **Categories:** Classifies courses (e.g., Math, Science).

---

## 📸 Usage

1.  **Sign Up:** Create a new account (Default role: Student).
2.  **Admin Access:** Manually update a user's role to `ADMIN` in the database or use the seed script.
3.  **Create Courses:** As an Admin or Teacher, go to the Courses page to add new classes.
4.  **Enroll:** Log in as a student to browse and join classes.

---
**License:** MIT
**Author:** Selimhan Tokat
