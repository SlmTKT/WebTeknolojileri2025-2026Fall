"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { EnrollButton } from "@/components/enroll-button"
import { Users, BookOpen } from "lucide-react"

interface Course {
    id: string
    title: string
    description: string | null
    summary?: string | null
    curriculum?: string | null
    type?: "FACE_TO_FACE" | "ONLINE" | string // type might be string from DB
    capacity?: number | null
    category: { name: string }
    teacher?: { name: string | null, email: string } | null
    enrollments: { id: string }[] // We need count
}

interface Props {
    courses: Course[]
    enrolledCourseIds: string[]
}

export function StudentCourseGrid({ courses, enrolledCourseIds }: Props) {
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

    const selectedCourse = courses.find(c => c.id === selectedCourseId) || null

    // Colors helper
    const categoryColors: Record<string, string> = {
        Mathematics: "bg-orange-500 text-white border-none",
        Science: "bg-green-500 text-white border-none",
        "Language Arts": "bg-blue-500 text-white border-none",
        History: "bg-yellow-500 text-white border-none",
        Technology: "bg-purple-500 text-white border-none",
        Default: "bg-gray-800 text-white border-none"
    }

    const openModal = (courseId: string) => {
        setSelectedCourseId(courseId)
    }

    return (
        <>
            {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No courses available yet.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => {
                        const isEnrolled = enrolledCourseIds.includes(course.id)
                        const catName = course.category?.name || "Uncategorized"

                        return (
                            <Card
                                key={course.id}
                                className="flex flex-col overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 group"
                                onClick={() => openModal(course.id)}
                            >
                                <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                                    <img
                                        src={"https://placehold.co/600x400?text=" + encodeURIComponent(course.title)}
                                        alt={course.title}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    {course.type === 'ONLINE' && (
                                        <Badge className="absolute top-2 right-2 bg-blue-600 text-white hover:bg-blue-700">Online</Badge>
                                    )}
                                    {course.type === 'FACE_TO_FACE' && (
                                        <Badge className="absolute top-2 right-2 bg-emerald-600 text-white hover:bg-emerald-700">In Person</Badge>
                                    )}
                                </div>

                                <CardContent className="flex flex-1 flex-col gap-3 p-6">
                                    <Badge className={categoryColors[catName] || categoryColors.Default + " w-fit"}>
                                        {catName}
                                    </Badge>

                                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                        {course.title}
                                    </h3>

                                    <p className="text-sm text-gray-500 line-clamp-2">
                                        {course.description || "No description provided."}
                                    </p>

                                    {course.teacher && (
                                        <p className="text-xs text-muted-foreground mt-2 font-medium">
                                            Lecturer: <span className="text-foreground">{course.teacher.name || course.teacher.email}</span>
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* COURSE DETAIL MODAL */}
            <Dialog open={!!selectedCourseId} onOpenChange={(open) => !open && setSelectedCourseId(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedCourse && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="mb-2">{selectedCourse.category.name}</Badge>
                                    <div className="flex gap-2">
                                        {selectedCourse.type === 'ONLINE' ? (
                                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Online</Badge>
                                        ) : (
                                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Face-to-Face</Badge>
                                        )}
                                    </div>
                                </div>
                                <DialogTitle className="text-2xl font-bold">{selectedCourse.title}</DialogTitle>
                                <DialogDescription className="text-base text-gray-600 mt-2">
                                    {selectedCourse.description}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                {/* Enrollment Stats */}
                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div className="p-2 bg-white rounded-full shadow-sm">
                                        <Users className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Class Status</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {selectedCourse.enrollments.length}
                                            {selectedCourse.capacity ? ` / ${selectedCourse.capacity}` : ' Students Enrolled'}
                                        </p>
                                    </div>
                                </div>

                                {/* Summary */}
                                {selectedCourse.summary && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" /> Course Summary
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                            {selectedCourse.summary}
                                        </p>
                                    </div>
                                )}

                                {/* Curriculum */}
                                {selectedCourse.curriculum && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Curriculum</h4>
                                        <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-md whitespace-pre-wrap font-mono">
                                            {selectedCourse.curriculum}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-0">
                                <div className="w-full">
                                    <EnrollButton
                                        courseId={selectedCourse.id}
                                        isEnrolled={enrolledCourseIds.includes(selectedCourse.id)}
                                    />
                                </div>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
