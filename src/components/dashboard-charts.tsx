"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts"

interface Props {
    data: {
        studentClassDistribution: { classes: string; students: number }[]
        teacherClassDistribution: { name: string; classes: number }[]
        courseEnrollmentDistribution: { name: string; students: number }[]
        courseAssignmentStats: { name: string; value: number; fill: string }[]
    }
}

export function DashboardCharts({ data }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

            {/* 1. Students per Class Count (Histogram) */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Student Engagement</CardTitle>
                    <CardDescription>Number of students taking X number of classes</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={data.studentClassDistribution}>
                            <XAxis dataKey="classes" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                            <Bar dataKey="students" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* 2. Assigned vs Unassigned Courses (Pie Chart) */}
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Course Teacher Assignment</CardTitle>
                    <CardDescription>Assigned vs Unassigned Classes</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={data.courseAssignmentStats}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.courseAssignmentStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px' }} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* 3. Teacher Workload (Bar Chart) */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Teacher Workload</CardTitle>
                    <CardDescription>Number of classes per teacher</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[350px] w-full overflow-x-auto">
                        {/* Using a minimum width to allow scrolling if many teachers */}
                        <div className="w-full h-full min-w-[500px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.teacherClassDistribution} layout="vertical" margin={{ left: 40 }}>
                                    <XAxis type="number" stroke="#888888" fontSize={12} />
                                    <YAxis type="category" dataKey="name" width={100} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                    <Bar dataKey="classes" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 4. Popular Courses (Bar Chart) */}
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Class Sizes</CardTitle>
                    <CardDescription>Number of students per class</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.courseEnrollmentDistribution} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" stroke="#888888" fontSize={12} />
                                <YAxis type="category" dataKey="name" width={100} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                <Bar dataKey="students" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
