"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { IconBrandGoogle } from "@tabler/icons-react"
import { useState } from "react"
import type { ComponentProps, FormEvent } from "react"
import { useSignInWithProvider, useSignUp } from "@/hooks/use-auth"
import LoadingSpinner from "./ui/loading-spinner"

export function SignupForm({
  className,
  ...props
}: ComponentProps<"form">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const { mutate: signUp, isPending } = useSignUp()
  const { mutate: loginWithProvider, isPending: isProviderPending } = useSignInWithProvider()


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    signUp({ email, password })
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="m@example.com"
            required
            className="border border-muted-foreground/20 bg-background"
          />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-muted-foreground/20 bg-background"
          />
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="border border-muted-foreground/20 bg-background"
          />
          <FieldDescription>Please confirm your password.</FieldDescription>
        </Field>
        <Field>
          <Button
            type="submit"
            disabled={
              !(email && password && confirmPassword) ||
              password !== confirmPassword
            }
            className="w-full"
            onClick={(e) => handleSubmit(e)}
          >
            {isPending ? <LoadingSpinner /> : "Create Account"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
            <Button
              type="button"
              variant="outline"
              className="flex items-center justify-center"
              onClick={(event) => {
                event.preventDefault()
                loginWithProvider({
                  provider: "google",
                })
              }}
              disabled={isProviderPending}
            >
              {isProviderPending ? (
                <LoadingSpinner />
              ) : (
                <>
                  <IconBrandGoogle className="size-4" aria-hidden="true" />
                  Signup with Google
                </>
              )}
            </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account? <a href="/login">Sign in</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
