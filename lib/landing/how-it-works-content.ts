export type HowItWorksStep = {
  value: string
  icon: "create" | "share" | "withdraw"
  label: string
  shortDescription: string
  content: {
    badge: string
    title: string
    description: string
    buttonText: string
    imageSrc: string
    imageAlt: string
  }
}

export const howItWorksContent = {
  badge: "How it works",
  heading: "From link to payout in three steps",
  description:
    "Create a paid link in minutes, share it anywhere your audience already follows you, and get paid in USDC with one-click M-Pesa withdrawal.",
  steps: [
    {
      value: "create",
      icon: "create",
      label: "Create a link + set price",
      shortDescription:
        "Paste your destination URL, choose gate or tip mode, and set your price in seconds.",
      content: {
        badge: "Step 1",
        title: "Create a paid link in under 3 minutes",
        description:
          "Add your Notion page, Google Drive folder, Telegram invite, or any destination URL, then publish your unique xpesa link with clear pricing.",
        buttonText: "Create your first link",
        imageSrc:
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
        imageAlt: "Creator setting up product link",
      },
    },
    {
      value: "share",
      icon: "share",
      label: "Share with your audience",
      shortDescription:
        "Post your xpesa link in bio, social posts, newsletters, and chat communities.",
      content: {
        badge: "Step 2",
        title: "Share once, automate delivery",
        description:
          "Fans pay through your link and get immediate access without manual confirmations, screenshots, or payment DMs.",
        buttonText: "Explore audience flow",
        imageSrc:
          "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200&q=80",
        imageAlt: "Audience discovery through mobile feed",
      },
    },
    {
      value: "withdraw",
      icon: "withdraw",
      label: "Get paid in USDC, withdraw locally",
      shortDescription:
        "Receive stablecoins instantly and cash out to a local mobile money account when you need local spend.",
      content: {
        badge: "Step 3",
        title: "Collect earnings and withdraw smoothly",
        description:
          "Your earnings settle on Hedera as USDC, then xpesa routes your offramp via Kotani Pay so you can receive funds in M-Pesa.",
        buttonText: "View payout path",
        imageSrc:
          "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80",
        imageAlt: "Mobile payment confirmation",
      },
    },
  ] as HowItWorksStep[],
}
