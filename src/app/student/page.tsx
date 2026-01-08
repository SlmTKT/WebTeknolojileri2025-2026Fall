import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GraduationCap } from "lucide-react"
import { getStudentData, logout } from "@/app/actions" // Real data fetcher
import { StudentCourseGrid } from "@/components/student-course-grid"

export default async function StudentCatalogPage() {
  const { courses, enrolledCourseIds, user } = await getStudentData()

  // Helper map for badges (using category names directly)
  const categoryColors: Record<string, string> = {
    Mathematics: "bg-chart-1 text-white border-chart-1",
    Science: "bg-chart-2 text-white border-chart-2",
    "Language Arts": "bg-chart-3 text-white border-chart-3",
    History: "bg-chart-4 text-white border-chart-4",
    Technology: "bg-chart-5 text-white border-chart-5",
    // Default fallback
    Default: "bg-primary text-secondary-foreground"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* White Navbar */}
      <nav className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-foreground">School Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.name || user?.email}</span>
            <Avatar className="h-9 w-9">
              <AvatarImage src="/student-avatar.png" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {(user?.name?.[0] || user?.email?.[0] || "S").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <form action={logout}>
              <Button variant="outline" size="sm" className="ml-2 gap-2">
                Log Out
              </Button>
            </form>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-primary/5 via-chart-1/5 to-chart-2/5">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="text-balance text-4xl font-bold text-foreground">Welcome Back!</h1>
          <p className="mt-2 text-pretty text-muted-foreground">
            Explore our course catalog and continue your learning journey.
          </p>
        </div>
      </section>

      {/* Course Grid */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground">Available Courses</h2>
          <p className="text-sm text-muted-foreground">Browse and enroll in courses that interest you</p>
        </div>

        <StudentCourseGrid courses={courses as any} enrolledCourseIds={enrolledCourseIds} />
      </main>
    </div>
  )
}
