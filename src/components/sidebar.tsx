"use client"

import { LayoutDashboard, BookOpen, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

import Link from "next/link"

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin", active: false },
  { name: "Manage Courses", icon: BookOpen, href: "/admin/courses", active: true },
  { name: "Users", icon: Users, href: "/admin/users", active: false },
  { name: "Settings", icon: Settings, href: "/admin/settings", active: false },
]

import { usePathname } from "next/navigation"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h1 className="text-lg font-semibold">School Admin</h1>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          // Simple active check: exact match or starts with (if sub-paths exist)
          // For now, exact match is safer for root /admin vs /admin/users
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
