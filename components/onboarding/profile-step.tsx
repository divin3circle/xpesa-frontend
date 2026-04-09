"use client"

import { ChangeEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OnboardingStepHeader } from "@/components/onboarding/step-header"
import { useOnboardingStepGuard } from "@/components/onboarding/onboarding-step-guard"
import { useOnboarding } from "@/components/onboarding/onboarding-provider"
import { isMpesaValid } from "@/lib/onboarding/validation"
import Image from "next/image"
import { Textarea } from "../ui/textarea"
import { onNavigate } from "@/lib/utils"

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean)
  if (!parts.length) return "XP"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function ProfileStep() {
  useOnboardingStepGuard("profile")

  const router = useRouter()
  const { state, setProfile, markStepComplete, getPayload } = useOnboarding()
  const [displayName, setDisplayName] = useState(
    state.profile.displayName || "New Creator"
  )
  const [bio, setBio] = useState(state.profile.bio)
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(
    state.profile.avatarDataUrl
  )
  const [mpesaNumber, setMpesaNumber] = useState(state.profile.mpesaNumber)

  const isMpesaFieldValid = isMpesaValid(mpesaNumber)

  const initials = useMemo(() => getInitials(displayName), [displayName])

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setAvatarDataUrl(objectUrl)
  }

  function handleSubmit() {
    if (!displayName || !isMpesaFieldValid) return

    setProfile({
      displayName,
      bio,
      avatarDataUrl,
      mpesaNumber,
    })
    markStepComplete("profile")

    const payload = getPayload()

    if (payload) {
      const requestBody = {
        ...payload,
        profile: {
          ...payload.profile,
          displayName,
          bio,
          avatarDataUrl,
          mpesaNumber,
        },
      }

      console.log("Onboarding payload", requestBody)
    }

    toast.success(
      "Setup complete. Welcome to xpesa. Get started with our docs.",
      {
        action: {
          label: "Learn more",
          onClick() {
            onNavigate("/learn", router)
          },
        },
      }
    )
    router.push("/dashboard")
  }

  return (
    <section>
      <OnboardingStepHeader step="profile" />

      <div className="grid max-w-2xl gap-5">
        <div className="grid gap-2">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="bio">Short bio (optional)</Label>
          <Textarea
            id="bio"
            value={bio}
            maxLength={120}
            onChange={(event) => setBio(event.target.value)}
            placeholder="What should people know about you?"
            className="min-h-24 w-full rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          />
          <p className="text-right text-xs text-muted-foreground">
            {bio.length}/120
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="avatar">Avatar (optional)</Label>
          <div className="flex items-center gap-4 rounded-3xl border border-border/70 bg-muted/30 p-4">
            {avatarDataUrl ? (
              <Image
                src={avatarDataUrl}
                alt="Avatar preview"
                width={500}
                height={500}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-16 items-center justify-center rounded-full bg-primary/15 font-heading text-lg font-semibold text-primary">
                {initials}
              </div>
            )}
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="mpesa">M-Pesa number</Label>
          <Input
            id="mpesa"
            value={mpesaNumber}
            onChange={(event) =>
              setMpesaNumber(event.target.value.replace(/\s+/g, ""))
            }
            placeholder="07XXXXXXXX or 01XXXXXXXX"
            aria-invalid={Boolean(mpesaNumber) && !isMpesaFieldValid}
          />
          <p className="text-sm text-muted-foreground">
            Required to withdraw earnings. You can change this later in
            settings. We never share this with anyone.
          </p>
          {mpesaNumber && !isMpesaFieldValid ? (
            <p className="text-sm text-destructive">
              Use format 07XXXXXXXX or 01XXXXXXXX.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-8">
        <Button
          type="button"
          size="lg"
          onClick={handleSubmit}
          disabled={!displayName || !isMpesaFieldValid}
        >
          Finish setup →
        </Button>
      </div>
    </section>
  )
}
