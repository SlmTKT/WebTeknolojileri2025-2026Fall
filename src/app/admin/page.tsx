import { getAdminDashboardData } from "@/app/actions"
import { DashboardStats } from "@/components/dashboard-stats"
import { DashboardCharts } from "@/components/dashboard-charts"

export const dynamic = 'force-dynamic'

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default async function AdminDashboardPage() {
    const { overview, charts } = await getAdminDashboardData()

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 pt-6">
                    <div className="flex items-center justify-between space-y-2 mb-6">
                        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    </div>

                    {/* Overview Cards */}
                    <DashboardStats
                        totalStudents={overview.totalStudents}
                        totalTeachers={overview.totalTeachers}
                        totalCourses={overview.totalCourses}
                    />

                    {/* Charts Section */}
                    <div className="mt-6">
                        <DashboardCharts data={charts} />
                    </div>
                </main>
            </div>
        </div>
    )
}
