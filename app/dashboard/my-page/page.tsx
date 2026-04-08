import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const activeLinks = [
  { title: "React Native Crash Course", type: "GATE", price: "$12" },
  { title: "Buy me chai", type: "TIP", price: "Any amount" },
  { title: "Design teardown notes", type: "GATE", price: "$4" },
]

export default function MyPagePage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Preview creator page
        </h1>
        <p className="text-sm text-muted-foreground">
          This is the page your audience sees at xpesa.com/wanjiru.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <Card className="rounded-2xl border-none bg-transparent shadow-none lg:col-span-3">
          <CardContent className="space-y-4">
            <div className="rounded-xl border p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div>
                  <p className="font-medium">Wanjiru M.</p>
                  <p className="text-xs text-muted-foreground">@wanjiru</p>
                </div>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Product designer sharing resources, templates, and practical
                guides for early creators.
              </p>
              <div className="space-y-2">
                {activeLinks.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-2xl border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.type}
                      </p>
                    </div>
                    <Badge>{item.price}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-transparent shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle>Share</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Share your creator page link and manage your content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border p-3 text-sm">
              <p className="font-medium">xpesa.com/wanjiru</p>
              <p className="text-xs text-muted-foreground">
                Public URL for your audience
              </p>
            </div>
            <Button className="w-full">Copy page link</Button>
            <Button variant="secondary" asChild className="w-full">
              <Link href="/dashboard/profile">Edit profile content</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/links/create">Create another link</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
