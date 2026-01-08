"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"
import { login } from "@/app/actions"
import Link from "next/link"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)

    try {
      const result = await login(formData)
      if (result && result.error) {
        setError(result.error)
      }
    } catch (err: any) {
      // Next.js redirect throws an error, so we need to ignore it or rethrow it
      if (err.message === 'NEXT_REDIRECT') {
        throw err
      }
      console.error(err)
      setError("An unexpected error occurred")
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
        <CardTitle className="text-2xl font-semibold text-balance">School Management System</CardTitle>
        <CardDescription className="text-base">Sign in to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11"
            />
          </div>

          {error && (
            <div className="p-3 rounded text-sm bg-red-100 text-red-600">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
          <div className="pt-2 text-center hidden">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium">Demo Accounts:</span>
              <br />
              admin@school.com / student@school.com
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t p-4">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
