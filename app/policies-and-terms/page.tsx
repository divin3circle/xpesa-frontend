import { readFile } from "fs/promises"
import path from "path"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { BrandLogo } from "@/components/landing/brand-logo"

const policyItems = [
  {
    id: "cookie-policy",
    title: "Cookie Policy",
    description: "How we use cookies and similar technologies.",
    fileName: "Cookie_Policy.md",
  },
  {
    id: "terms-of-service",
    title: "Terms of Service",
    description: "The rules and agreement for using XPesa.",
    fileName: "Terms_Of_Service.md",
  },
  {
    id: "privacy-policy",
    title: "Privacy Policy",
    description: "How we collect, use, and protect your information.",
    fileName: "Privacy_Policy.md",
  },
  {
    id: "creator-guidelines",
    title: "Creator Guidelines",
    description: "Standards and best practices for XPesa creators.",
    fileName: "Creator_Guidelines.md",
  },
]

const policyRoot = path.join(process.cwd(), "public", "policies")

function cleanPolicyMarkdown(markdown: string) {
  return markdown
    .split("\n")
    .filter((line) => !/^XPesa Creators \u00b7/i.test(line.trim()))
    .filter(
      (line) => !/^(XPesacreators\.xyz|xpesacreators\.xyz)$/i.test(line.trim())
    )
    .join("\n")
    .trim()
}

async function loadPolicyMarkdown(fileName: string) {
  const filePath = path.join(policyRoot, fileName)
  const contents = await readFile(filePath, "utf8")
  return cleanPolicyMarkdown(contents)
}

export default async function PoliciesAndTermsPage() {
  const policyContent = await Promise.all(
    policyItems.map(async (item) => ({
      ...item,
      content: await loadPolicyMarkdown(item.fileName),
    }))
  )

  return (
    <main className="min-h-svh bg-background">
      <div className="border-b border-border/70 bg-linear-to-b from-muted/40 via-background to-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 lg:py-14">
          <div className="flex items-center justify-between">
            <BrandLogo tone="default" />
            <Link
              href="/"
              className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            >
              Back to home
            </Link>
          </div>
          <div className="space-y-3">
            <h1 className="font-heading text-3xl font-semibold text-foreground md:text-4xl">
              Policies and Terms
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              Read our privacy policy, cookie policy, terms of service, and
              creator guidelines in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-border/70 bg-card/70 p-4">
              <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                On this page
              </p>
              <nav className="mt-4 flex flex-col gap-3">
                {policyItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="rounded-2xl border border-transparent px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:border-border/70 hover:text-foreground"
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
            <div className="rounded-3xl border border-border/70 bg-card/70 p-4 text-xs text-muted-foreground">
              These documents are provided as-is and may be updated from time to
              time. We will always publish the latest versions here.
            </div>
          </aside>

          <div className="space-y-12">
            {policyContent.map((policy) => (
              <section
                key={policy.id}
                id={policy.id}
                className="scroll-mt-24 rounded-3xl border border-border/70 bg-card/60 p-6 md:p-8"
              >
                <div className="space-y-2">
                  <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                    {policy.title}
                  </p>
                  <h2 className="font-heading text-2xl font-semibold text-foreground">
                    {policy.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {policy.description}
                  </p>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/90">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h2: ({ children }) => (
                        <h3 className="pt-4 text-xl font-semibold text-foreground">
                          {children}
                        </h3>
                      ),
                      h3: ({ children }) => (
                        <h4 className="pt-3 text-lg font-semibold text-foreground">
                          {children}
                        </h4>
                      ),
                      p: ({ children }) => (
                        <p className="text-sm text-foreground/90">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="ml-4 list-disc space-y-2">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="ml-4 list-decimal space-y-2">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-sm text-foreground/90">
                          {children}
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">
                          {children}
                        </strong>
                      ),
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          className="font-semibold text-primary hover:underline"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {policy.content}
                  </ReactMarkdown>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
