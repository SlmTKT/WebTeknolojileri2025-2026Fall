import { Sidebar } from "@/components/sidebar" // Ensure this matches your v0 filename
import { Header } from "@/components/header"   // Ensure this matches your v0 filename
import { CoursesTable } from "@/components/courses-table"
import { getAdminData } from "@/app/actions"

export default async function AdminDashboard() {
  // 1. Fetch real data from Server Action
  const { courses, categories, users } = await getAdminData()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 2. Pass data if Sidebar needs it, otherwise keep as is */}
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* 3. Pass the fetched data to your v0 Table */}
            <CoursesTable courses={courses} categories={categories} users={users} />
          </div>
        </main>
      </div>
    </div>
  )
}