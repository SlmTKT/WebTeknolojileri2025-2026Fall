"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, X } from "lucide-react" // Removed unused icons
import Image from "next/image"
// ... imports
import { createCourse, deleteCourse, updateCourseTeacher } from "@/app/actions"
import { Loader2 } from "lucide-react"

interface CourseWithCategoryAndTeacher {
  id: string
  title: string
  description: string | null
  imageUrl?: string | null
  summary?: string | null
  curriculum?: string | null
  category: { name: string }
  teacher?: { id: string; name: string | null; email: string } | null
}

interface Props {
  courses: CourseWithCategoryAndTeacher[]
  categories: { id: string; name: string }[]
  users?: { id: string; name: string | null; email: string }[] // Potential teachers
}

import { useRouter } from "next/navigation"

// ... (interfaces stay same)

export function CoursesTable({ courses, categories, users }: Props) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({})
  const [courseType, setCourseType] = useState<"FACE_TO_FACE" | "ONLINE">("FACE_TO_FACE")
  const router = useRouter()

  const handleTeacherChange = async (courseId: string, teacherId: string) => {
    // If empty string, pass null to remove
    const finalTeacherId = teacherId === "" ? null : teacherId

    setLoadingIds(prev => ({ ...prev, [courseId]: true }))
    try {
      await updateCourseTeacher(courseId, finalTeacherId)
      router.refresh()
    } finally {
      setLoadingIds(prev => ({ ...prev, [courseId]: false }))
    }
  }

  return (
    <>
      <Card className="h-full shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-bold">Manage Courses</CardTitle>
          <Button onClick={() => setIsAddOpen(true)} className="bg-black text-white hover:bg-gray-800">
            <Plus className="mr-2 h-4 w-4" /> Add New Course
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead className="w-1/4">Course Title</TableHead>
                  <TableHead className="w-1/6">Category</TableHead>
                  <TableHead className="w-1/6">Teacher</TableHead>
                  <TableHead className="w-1/6">Summary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                      No courses found. Click "Add New Course" to start.
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow key={course.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="relative h-10 w-10 overflow-hidden rounded-md bg-gray-100">
                          <img
                            src={course.imageUrl || "https://placehold.co/100"}
                            alt={course.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">{course.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{course.description}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {course.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {/* If users (potential teachers) are provided, allow editing (Admin Mode) */}
                        {users ? (
                          <div className="flex items-center gap-2">
                            {loadingIds[course.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            ) : (
                              <select
                                className="text-sm border rounded px-2 py-1 bg-white max-w-[150px]"
                                value={course.teacher?.id || ""}
                                onChange={(e) => handleTeacherChange(course.id, e.target.value)}
                              >
                                <option value="">Unassigned</option>
                                {users.map(u => (
                                  <option key={u.id} value={u.id}>
                                    {u.name || u.email}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-gray-700">
                            {course.teacher?.name || course.teacher?.email || "Unassigned"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500 truncate max-w-[150px]">
                          {course.summary || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <form action={deleteCourse.bind(null, course.id)}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL FORM */}
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

              {/* Title & Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <input name="title" required className="w-full border rounded-md p-2 text-sm" placeholder="Course Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select name="categoryId" className="w-full border rounded-md p-2 text-sm bg-white">
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Teacher Selection (Only if users provided -> Admin) */}
              {users && users.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign Teacher (Optional)</label>
                  <select name="teacherId" className="w-full border rounded-md p-2 text-sm bg-white">
                    <option value="">-- Select Teacher --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Short Description</label>
                <input name="description" required className="w-full border rounded-md p-2 text-sm" placeholder="Short blurb for card..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Summary (Detailed)</label>
                <textarea name="summary" className="w-full border rounded-md p-2 text-sm h-24" placeholder="Full course summary..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Curriculum</label>
                <textarea name="curriculum" className="w-full border rounded-md p-2 text-sm h-24" placeholder="Week 1: ..., Week 2: ..." />
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