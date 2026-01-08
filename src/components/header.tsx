"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { logout } from "@/app/actions"

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <h2 className="text-xl font-semibold text-card-foreground">Manage Courses</h2>
      <form action={logout}>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </form>
    </header>
  )
}
