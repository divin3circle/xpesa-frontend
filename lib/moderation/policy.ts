import { readFile } from "fs/promises"
import path from "path"

export async function loadCreatorGuidelines() {
  const filePath = path.join(
    process.cwd(),
    "public",
    "policies",
    "Creator_Guidelines.md"
  )
  return readFile(filePath, "utf8")
}

export function buildModerationText(input: {
  type: string
  title: string
  description: string | null
  destinationUrl?: string | null
}) {
  return [
    `Type: ${input.type}`,
    `Title: ${input.title}`,
    `Description: ${input.description || "None"}`,
    input.destinationUrl ? `Destination URL: ${input.destinationUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n")
}

export function localPolicyReason(text: string) {
  const lowered = text.toLowerCase()
  const severe = [
    "porn",
    "sexually explicit",
    "malware",
    "phishing",
    "stolen",
    "pirated",
    "cracked software",
  ]
  const matched = severe.find((term) => lowered.includes(term))
  return matched ? `Potential guideline violation: ${matched}` : null
}
