"use client"

import { LayoutDashboard, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/teacher", active: true },
    { name: "My Courses", icon: BookOpen, href: "/teacher/courses", active: false },
]

import { usePathname } from "next/navigation"

export function TeacherSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
            <div className="flex h-16 items-center border-b border-sidebar-border px-6">
                <h1 className="text-lg font-semibold">Teacher Portal</h1>
            </div>
            <nav className="space-y-1 p-4">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-gray-200 text-gray-900"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
