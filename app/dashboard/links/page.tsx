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

const links = [
  {
    title: "React Native Crash Course",
    type: "Gate",
    price: "$12",
    stats: "245 views • 33 payments • $396 earned",
    active: true,
  },
  {
    title: "Design teardown notes",
    type: "Gate",
    price: "$4",
    stats: "112 views • 19 payments • $76 earned",
    active: true,
  },
  {
    title: "Buy me chai",
    type: "Tip",
    price: "Any",
    stats: "62 views • 21 tips • $48 earned",
    active: false,
  },
]

export default function LinksPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            My links
          </h1>
          <p className="text-sm text-muted-foreground">
            Create, publish, and manage both gate and tip links.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/links/create">Create new link</Link>
        </Button>
      </section>

      <section className="flex flex-wrap gap-2">
        <Badge>All</Badge>
        <Badge variant="secondary">Gate links</Badge>
        <Badge variant="secondary">Tip links</Badge>
        <Badge variant="outline">Inactive</Badge>
      </section>

      <section className="grid gap-4">
        {links.map((item) => (
          <Card key={item.title}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription>{item.stats}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.type}</Badge>
                  <Badge>{item.price}</Badge>
                  <Badge variant={item.active ? "default" : "secondary"}>
                    {item.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary">
                Copy link
              </Button>
              <Button size="sm" variant="outline">
                Edit
              </Button>
              <Button size="sm" variant="outline">
                Toggle status
              </Button>
              <Button size="sm" variant="destructive">
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
