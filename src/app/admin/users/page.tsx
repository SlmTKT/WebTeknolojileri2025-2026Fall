import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { UsersTable } from "@/components/users-table"
import { getUsersData } from "@/app/actions"

export default async function AdminUsersPage() {
    // Fetch real data from Server Action
    const { users } = await getUsersData()

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto">
                        <UsersTable users={users} />
                    </div>
                </main>
            </div>
        </div>
    )
}
