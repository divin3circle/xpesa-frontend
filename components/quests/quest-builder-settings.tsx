"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  title: string
  description: string
  rewardMode: string
  maxAttempts?: string
  leaderboardVisible?: boolean
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onRewardModeChange: (value: string) => void
  onMaxAttemptsChange?: (value: string) => void
  onLeaderboardVisibleChange?: (value: boolean) => void
}

export function QuestBuilderSettings({
  title,
  description,
  rewardMode,
  maxAttempts,
  onTitleChange,
  onDescriptionChange,
  onRewardModeChange,
  onMaxAttemptsChange,
}: Props) {
  return (
    <section className="grid gap-4 rounded-2xl border border-dashed px-2 py-5 md:grid-cols-2">
      <section className="cursor-not-allowed space-y-2 px-4">
        <h1 className="font-body font-semibold">Quest Name</h1>
        <Input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Quest title"
        />
      </section>
      <section className="space-y-2 px-4">
        <h1 className="font-body font-semibold">Reward Mode</h1>
        <Select value={rewardMode} onValueChange={onRewardModeChange}>
          <SelectTrigger className="h-10 w-full md:w-1/2">
            <SelectValue placeholder="Reward mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No reward</SelectItem>
            <SelectItem value="top_1">Reward top 1</SelectItem>
            <SelectItem value="top_3">Reward top 3</SelectItem>
          </SelectContent>
        </Select>
      </section>
      <section className="cursor-not-allowed space-y-2 px-4">
        <h1 className="font-body font-semibold">Quest Description</h1>
        <Textarea
          className="md:col-span-2"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="Quest description"
        />
      </section>
      <section className="space-y-2 px-4">
        <h1 className="font-body font-semibold">Max Attempts</h1>
        {onMaxAttemptsChange && (
          <Input
            type="number"
            min={1}
            max={5}
            value={maxAttempts}
            onChange={(event) => onMaxAttemptsChange(event.target.value)}
            placeholder="Max attempts"
            className="w-full md:w-1/2"
          />
        )}
      </section>
    </section>
  )
}
