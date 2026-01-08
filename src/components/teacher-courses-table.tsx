"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { assignTeacherToCourse, removeStudentFromCourse, createCourse } from "@/app/actions"
import { Loader2, Users, UserMinus, Check, AlertCircle, Plus, X } from "lucide-react"

interface Student {
    id: string
    name: string | null
    email: string
}

interface Enrollment {
    user: Student
}

interface Course {
    id: string
    title: string
    teacherId: string | null
    category: { name: string }
    enrollments: Enrollment[]
}

interface Props {
    courses: Course[]
    currentUserId: string
    categories: { id: string; name: string }[]
}

export function TeacherCoursesTable({ courses, currentUserId, categories }: Props) {
    const [filter, setFilter] = useState<'ALL' | 'MINE'>('ALL')
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null) // For Manage Students Modal
    const [isAddOpen, setIsAddOpen] = useState(false) // For Create Course Modal
    const [courseType, setCourseType] = useState<"FACE_TO_FACE" | "ONLINE">("FACE_TO_FACE")

    const filteredCourses = filter === 'MINE'
        ? courses.filter(c => c.teacherId === currentUserId)
        : courses

    const handleClaim = async (courseId: string) => {
        setLoadingId(courseId)
        try {
            await assignTeacherToCourse(courseId)
        } finally {
            setLoadingId(null)
        }
    }

    const handleRemoveStudent = async (studentId: string) => {
        if (!selectedCourse) return
        if (!confirm("Remove this student from the course?")) return

        setLoadingId(studentId)
        try {
            await removeStudentFromCourse(selectedCourse.id, studentId)
            // Optimistic update or refresh? RevalidatePath handles refresh, but we need to close modal or update local state?
            // For simplicity, the revalidatePath will refresh the page props, but we might need to close modal or reload to see changes if client state doesn't sync perfectly.
            // Actually, since this is a client component receiving props from server, revalidatePath -> page reload -> new props.
            // But the modal state might persist with old data? No, react refresh often resets.
            // Let's just close modal for safety.
            setSelectedCourse(null)
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <>
            <Card className="h-full shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        {filter === 'MINE' ? 'My Courses' : 'All Courses'}
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button
                            variant={filter === 'ALL' ? 'secondary' : 'ghost'}
                            onClick={() => setFilter('ALL')}
                        >
                            All Courses
                        </Button>
                        <Button
                            variant={filter === 'MINE' ? 'secondary' : 'ghost'}
                            onClick={() => setFilter('MINE')}
                        >
                            My Courses
                        </Button>
                        <Button onClick={() => setIsAddOpen(true)} className="ml-2 gap-2">
                            <Plus className="h-4 w-4" /> Add Course
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-gray-200">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead>Course Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Teacher Status</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCourses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No courses found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCourses.map((course) => (
                                        <TableRow key={course.id}>
                                            <TableCell className="font-medium">{course.title}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{course.category.name}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {course.teacherId === currentUserId ? (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                                        <Check className="w-3 h-3 mr-1" /> You
                                                    </Badge>
                                                ) : course.teacherId ? (
                                                    <span className="text-muted-foreground text-sm">Assigned</span>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 h-7"
                                                        onClick={() => handleClaim(course.id)}
                                                        disabled={loadingId === course.id}
                                                    >
                                                        {loadingId === course.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Claim Course"}
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-muted-foreground" />
                                                    <span>{course.enrollments.length}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {/* Only allow managing students if I am the teacher */}
                                                {course.teacherId === currentUserId && (
                                                    <Button size="sm" variant="ghost" onClick={() => setSelectedCourse(course)}>
                                                        Manage Students
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* MANAGE STUDENTS MODAL */}
            {selectedCourse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-4">
                            <div>
                                <h3 className="text-lg font-semibold">{selectedCourse.title}</h3>
                                <p className="text-sm text-muted-foreground">Enrolled Students</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedCourse(null)}>X</Button>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            {selectedCourse.enrollments.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">No students enrolled yet.</p>
                            ) : (
                                selectedCourse.enrollments.map(e => (
                                    <div key={e.user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-sm">{e.user.name || "Unnamed Student"}</p>
                                            <p className="text-xs text-muted-foreground">{e.user.email}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleRemoveStudent(e.user.id)}
                                            disabled={loadingId === e.user.id}
                                        >
                                            {loadingId === e.user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-2 text-right">
                            <Button onClick={() => setSelectedCourse(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE COURSE MODAL (Teacher Version - Simplified) */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">Create New Course</h3>
                            <Button variant="ghost" size="icon" onClick={() => setIsAddOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <form action={async (formData) => {
                            await createCourse(formData);
                            setIsAddOpen(false);
                        }} className="p-6 space-y-4">

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <input name="title" required className="w-full border rounded-md p-2 text-sm" placeholder="Course Name" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select name="categoryId" className="w-full border rounded-md p-2 text-sm bg-white" required>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Short Description</label>
                                <input name="description" required className="w-full border rounded-md p-2 text-sm" placeholder="Short blurb..." />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Summary (Detailed)</label>
                                <textarea name="summary" className="w-full border rounded-md p-2 text-sm h-24" placeholder="Course content details..." />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Curriculum</label>
                                <textarea name="curriculum" className="w-full border rounded-md p-2 text-sm h-24" placeholder="Week 1..., Week 2..." />
                            </div>

                            {/* Type and Capacity */}
                            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Course Type</label>
                                    <div className="flex gap-4 pt-1">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="FACE_TO_FACE"
                                                checked={courseType === "FACE_TO_FACE"}
                                                onChange={() => setCourseType("FACE_TO_FACE")}
                                            />
                                            Face-to-Face
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="ONLINE"
                                                checked={courseType === "ONLINE"}
                                                onChange={() => setCourseType("ONLINE")}
                                            />
                                            Online
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Capacity <span className="text-xs text-gray-500">(Default: 40)</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        className="w-full border rounded-md p-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                                        placeholder="40"
                                        disabled={courseType === "ONLINE"}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t mt-2">
                                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-black text-white">Create Course</Button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
