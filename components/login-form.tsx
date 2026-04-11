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
import { IconBrandGoogle, IconBrandTwitter } from "@tabler/icons-react"
import { login } from "@/actions/auth"
import { toast } from "sonner"
import { useState } from "react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email || !password) {
      toast.error("Please enter both email and password.")
      console.error("Email and password are required.")
      return
    }

    if (!email) {
      toast.error("Email is required.")
      console.error("Email is required.")
      return
    }

    if (!password) {
      toast.error("Password is required.")
      console.error("Password is required.")
      return
    }

    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)

    try {
      await login(formData)
    } catch (error) {
      console.error("Login failed:", error)
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
            <a
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
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
          <Button type="submit">Login</Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button variant="outline" type="button">
            <IconBrandGoogle className="size-4" aria-hidden="true" />
            Login with Google
          </Button>
          <Button variant="outline" type="button">
            <IconBrandTwitter className="size-4" aria-hidden="true" />
            Login with Twitter
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
