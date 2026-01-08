import { Button } from "@/components/ui/button"
import { enrollInCourse, dropCourse } from "@/app/actions"
import { useState } from "react"
import { Loader2, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

interface EnrollButtonProps {
    courseId: string
    isEnrolled: boolean
}

export function EnrollButton({ courseId, isEnrolled }: EnrollButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleEnroll = async () => {
        setLoading(true)
        try {
            await enrollInCourse(courseId)
            router.refresh()
        } finally {
            setLoading(false)
        }
    }

    const handleDrop = async () => {
        if (!confirm("Are you sure you want to drop this course? This action cannot be undone.")) return

        setLoading(true)
        try {
            await dropCourse(courseId)
            router.refresh()
        } finally {
            setLoading(false)
        }
    }

    if (isEnrolled) {
        return (
            <div className="flex gap-2 w-full">
                <Button disabled className="flex-1 bg-green-600 hover:bg-green-700 text-white opacity-80 cursor-not-allowed">
                    Enrolled
                </Button>
                <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDrop}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
                    Drop Course
                </Button>
            </div>
        )
    }

    return (
        <Button
            className="w-full"
            onClick={handleEnroll}
            disabled={loading}
        >
            {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
            Enroll Now
        </Button>
    )
}
