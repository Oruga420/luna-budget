"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginAction } from "@/app/actions/auth"
import { useActionState } from "react"

const initialState = {
  error: '',
}

export default function LoginPage() {
  const [state, dispatch] = useActionState(loginAction, initialState)

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-[var(--color-primary)]">Luna Budget</CardTitle>
          <CardDescription className="text-center">
            Enter your email to access your budget.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="name@seshwithfriends.org"
                required
                className="w-full"
              />
            </div>
            {state?.error && (
              <p className="text-sm text-red-500 text-center">{state.error}</p>
            )}
            <Button type="submit" className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] text-white font-bold">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
