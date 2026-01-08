"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button" // Unused currently
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { updateUserRole } from "@/app/actions"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface User {
    id: string
    name: string | null
    email: string
    role: string
    createdAt: Date
}

interface Props {
    users: User[]
}

export function UsersTable({ users }: Props) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const router = useRouter()

    const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'TEACHER' | 'STUDENT') => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return

        setLoadingId(userId)
        try {
            await updateUserRole(userId, newRole)
            router.refresh()
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <Card className="h-full shadow-md">
            <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight">User Management</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border border-gray-200">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-gray-50/50">
                                    <TableCell className="font-medium">{user.name || "No Name"}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            user.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-200' :
                                                user.role === 'TEACHER' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                    'bg-blue-50 text-blue-700 border-blue-200'
                                        }>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {loadingId === user.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            ) : (
                                                <select
                                                    className="text-sm border rounded px-2 py-1 bg-white"
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                                                >
                                                    <option value="STUDENT">Student</option>
                                                    <option value="TEACHER">Teacher</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
