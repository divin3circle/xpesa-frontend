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
import { toast } from "sonner"
import { useState } from "react"
import type { ComponentProps } from "react"
import { useSignIn, useSignInWithProvider } from "@/hooks/use-auth";
import LoadingSpinner from "./ui/loading-spinner";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>

export function LoginForm({
  className,
  ...props
}: ComponentProps<"form">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { mutate: loginInUser, isPending } = useSignIn()
  const { mutate: loginWithProvider, isPending: isProviderPending } = useSignInWithProvider()

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault()

    if (!email || !password) {
      toast.error("Please enter both email and password.")
      return
    }

    if (!email) {
      toast.error("Email is required.")
      return
    }

    if (!password) {
      toast.error("Password is required.")
      return
    }

    try {
      loginInUser({ email, password })
    } catch {
      toast.error("Login failed")
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Welcome back! Please enter your details to sign in to your account.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="m@example.com"
            required
            className="border border-muted-foreground/20 bg-background"
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="border border-muted-foreground/20 bg-background"
          />
        </Field>
        <Field>
          <Button
            disabled={isPending || email === "" || password === ""}
            className="flex items-center justify-center"
            type="submit"
          >
            {isPending ? <LoadingSpinner /> : "Login"}
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
                Login with Google
              </>
            )}
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="underline underline-offset-4">
              Sign up
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
