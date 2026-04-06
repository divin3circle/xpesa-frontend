import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CreateLinkPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Create link
        </h1>
        <p className="text-sm text-muted-foreground">
          Build either a gate link or a tip link with fan-ready preview.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-primary/60">
          <CardHeader>
            <CardTitle>Gate a link</CardTitle>
            <CardDescription>
              Fan pays to unlock your destination URL.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Accept tips</CardTitle>
            <CardDescription>
              Fans send support with optional amount input.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Link details</CardTitle>
            <CardDescription>
              Keep it short, clear, and conversion-friendly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="React Native Crash Course" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Tell fans what they get after payment."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination URL</Label>
              <Input id="destination" placeholder="https://example.com/private-resource" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USDC)</Label>
                <Input id="price" placeholder="12.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry">Access expiry</Label>
                <select
                  id="expiry"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option>Forever</option>
                  <option>One-time only</option>
                  <option>24 hours</option>
                  <option>7 days</option>
                  <option>30 days</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                Suggested $1
              </Button>
              <Button variant="outline" size="sm">
                Suggested $2
              </Button>
              <Button variant="outline" size="sm">
                Suggested $5
              </Button>
              <Button variant="outline" size="sm">
                Suggested $10
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button>Create link</Button>
              <Button variant="secondary">Save draft</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Fan preview</CardTitle>
            <CardDescription>What your audience sees before payment.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 rounded-xl border p-4">
              <Badge>Locked content</Badge>
              <p className="font-medium">React Native Crash Course</p>
              <p className="text-sm text-muted-foreground">
                Complete practical guide with project files and implementation
                checklist.
              </p>
              <div className="rounded-md bg-muted p-3 text-sm">
                <p>Price: 12.00 USDC</p>
                <p className="text-muted-foreground">~ KES 1,548</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
