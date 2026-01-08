import { getTeacherDashboardStats } from "@/app/actions"
import { TeacherStats } from "@/components/teacher-stats"
import { TeacherCharts } from "@/components/teacher-charts"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { Header } from "@/components/header"

export const dynamic = 'force-dynamic'

export default async function TeacherDashboardPage() {
    const { stats, charts, user } = await getTeacherDashboardStats()

    return (
        <div className="flex h-screen bg-gray-50">
            <TeacherSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>

                        <TeacherStats
                            totalCourses={stats.totalCourses}
                            totalStudents={stats.totalStudents}
                            activeClasses={stats.activeClasses}
                        />

                        <TeacherCharts data={charts} />
                    </div>
                </main>
            </div>
        </div>
    )
}
