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

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your public identity, payout number, and wallet metadata.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Public profile</CardTitle>
            <CardDescription>
              This appears on your public creator page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input id="display-name" defaultValue="Wanjiru M." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="handle">Handle</Label>
              <Input id="handle" defaultValue="wanjiru" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                defaultValue="Product designer sharing practical resources and guides for creators."
              />
            </div>
            <Button>Save public profile</Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Security and payouts</CardTitle>
            <CardDescription>
              Keep payout details accurate and wallet routing safe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wallet-address">Wallet address</Label>
              <Input
                id="wallet-address"
                defaultValue="0x7A21...Fe89"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mpesa">M-Pesa number</Label>
              <Input id="mpesa" defaultValue="07XXXXXXXX" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary">Update payout number</Button>
              <Button variant="outline">Connect new wallet</Button>
            </div>
            <div className="rounded-2xl border border-destructive/50 bg-destructive/5 p-3 text-sm">
              <p className="font-medium text-destructive">Danger zone</p>
              <p className="text-muted-foreground">
                Deleting your account disables all active links.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
