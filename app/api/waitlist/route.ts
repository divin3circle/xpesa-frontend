import { NextResponse } from "next/server"
import { google } from "googleapis"
import { GoogleAuth } from "google-auth-library"

type WaitlistRequest = {
  name?: string
  email?: string
  creatorFocus?: string
  notes?: string
}

const googleApplicationCredentials =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.GOOGLE_APPLICATION_CREDETIALS ||
  ""
const googleApplicationScopes = ["https://www.googleapis.com/auth/spreadsheets"]
const sheetId = process.env.SHEET_ID || ""

function createSheetsAuth() {
  const credentialSource = googleApplicationCredentials.trim()

  if (!credentialSource) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not configured")
  }

  const authConfig = credentialSource.startsWith("{")
    ? { credentials: JSON.parse(credentialSource) }
    : { keyFilename: credentialSource }

  return new GoogleAuth({
    ...authConfig,
    scopes: googleApplicationScopes,
  })
}

async function appendRow({
  name,
  email,
  creatorFocus,
  notes,
}: {
  name: string
  email: string
  creatorFocus: string
  notes: string
}) {
  if (!sheetId) {
    throw new Error("SHEET_ID is not configured")
  }

  const auth = createSheetsAuth()
  const sheets = google.sheets({ version: "v4", auth })

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A:D",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[name, email, creatorFocus, notes]],
    },
  })
}

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      creatorFocus,
      notes = "",
    } = (await req.json()) as WaitlistRequest

    if (!name || !email || !creatorFocus) {
      console.error("Please enter a valid email address")
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    await appendRow({
      name,
      email,
      creatorFocus,
      notes,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("couldn't join waitlist", e)
    return NextResponse.json(
      { error: "Couldn't join waitlist." },
      { status: 500 }
    )
  }
}
