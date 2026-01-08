import { TeacherSidebar } from "@/components/teacher-sidebar"
import { Header } from "@/components/header"
import { TeacherCoursesTable } from "@/components/teacher-courses-table"
import { getTeacherData } from "@/app/actions"

export default async function TeacherDashboard() {
    const { courses, categories, user } = await getTeacherData()

    return (
        <div className="flex h-screen bg-gray-50">
            <TeacherSidebar />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto">
                        <TeacherCoursesTable courses={courses} currentUserId={user.id} categories={categories} />
                    </div>
                </main>
            </div>
        </div>
    )
}
