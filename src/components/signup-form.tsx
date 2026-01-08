"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"
import { signup } from "@/app/actions"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function SignupForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData()
        formData.append("email", email)
        formData.append("password", password)
        formData.append("name", name)

        try {
            const result = await signup(formData)
            if (result && result.error) {
                setMessage({ text: result.error, type: 'error' })
            } else {
                setMessage({ text: "Account created! Please sign in.", type: 'success' })
                // Optional: Redirect to login after delay
                setTimeout(() => router.push('/'), 2000)
            }
        } catch (err) {
            setMessage({ text: "An unexpected error occurred", type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="space-y-3 text-center">
                <div className="flex justify-center">
                    <div className="rounded-xl bg-primary p-3">
                        <GraduationCap className="h-8 w-8 text-primary-foreground" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-semibold text-balance">Create Account</CardTitle>
                <CardDescription className="text-base">Enter your details to get started</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@school.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 minLength={6}"
                        />
                    </div>

                    {message && (
                        <div className={`p-3 rounded text-sm ${message.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {message.text}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
                        {loading ? "Creating Account..." : "Sign Up"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center border-t p-4">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/" className="font-medium text-primary hover:underline">
                        Sign In
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}
