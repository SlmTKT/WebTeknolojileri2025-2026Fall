"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface Props {
    data: {
        classSizeData: { name: string; students: number }[]
    }
}

export function TeacherCharts({ data }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-1">
            <Card>
                <CardHeader>
                    <CardTitle>Class Enrollment</CardTitle>
                    <CardDescription>Number of students in each of your courses</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={data.classSizeData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" stroke="#888888" fontSize={12} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={150}
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                            <Bar dataKey="students" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
