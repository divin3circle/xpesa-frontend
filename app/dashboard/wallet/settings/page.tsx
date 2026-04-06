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

export default function PayoutSettingsPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Payout settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Control payout identity, defaults, and risk controls.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payout profile</CardTitle>
            <CardDescription>
              Used by Kotani Pay during withdrawal processing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mpesa-number">M-Pesa number</Label>
              <Input id="mpesa-number" defaultValue="07XXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal-name">Legal name</Label>
              <Input id="legal-name" defaultValue="Wanjiru Mwangi" />
            </div>
            <Button>Save payout profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Tune your default withdraw behavior and notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <label className="flex items-start gap-2 rounded-md border p-3">
              <input type="checkbox" defaultChecked className="mt-0.5" />
              <span>
                Email me when a payout completes
                <p className="text-xs text-muted-foreground">
                  Useful for reconciling earnings and transfer success.
                </p>
              </span>
            </label>
            <label className="flex items-start gap-2 rounded-md border p-3">
              <input type="checkbox" defaultChecked className="mt-0.5" />
              <span>
                Require confirmation modal before every withdraw
                <p className="text-xs text-muted-foreground">
                  Adds one extra review step for safety.
                </p>
              </span>
            </label>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
