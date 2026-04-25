import type { TransactionRecord } from "@/components/ui/transaction-management-table"

export type ViewerMode = "overview" | "document" | "link" | "pack" | "tip"

export type ViewerOverview = {
  title: string
  description: string
  tokenLabel: string
  expiresIn: string
  viewsRemaining: number | null
  accessNote: string
}

export type ViewerDocumentMock = {
  title: string
  description: string
  pageCount: number
  fileSizeLabel: string
  fileTypeLabel: string
  pages: Array<{ label: string; preview: string }>
}

export type ViewerLinkMock = {
  title: string
  description: string
  destinationLabel: string
  destinationHost: string
  previewLabel: string
}

export type ViewerPackMock = {
  title: string
  description: string
  fileCount: number
  totalSizeLabel: string
  files: Array<{ name: string; type: string; size: string }>
}

export type ViewerTipMock = {
  title: string
  description: string
  thankYouMessage: string
  suggestedAmounts: string[]
}

export const viewerOverviewMock: ViewerOverview = {
  title: "Secure token session",
  description:
    "Pick the mode that matches the content the creator shared with you.",
  tokenLabel: "Protected by tokenId",
  expiresIn: "Forever",
  viewsRemaining: 5,
  accessNote: "This content is private and unlocked after payment or approval.",
}

export const viewerDocumentMock: ViewerDocumentMock = {
  title: "Design teardown notes",
  description:
    "A private document with page-by-page reading, watermarking, and protected controls.",
  pageCount: 24,
  fileSizeLabel: "8.2 MB",
  fileTypeLabel: "PDF",
  pages: [
    { label: "Cover", preview: "/dashboard.avif" },
    { label: "Overview", preview: "/share.avif" },
    { label: "Breakdown", preview: "/error1.avif" },
    { label: "Results", preview: "/error2.avif" },
  ],
}

export const viewerLinkMock: ViewerLinkMock = {
  title: "React Native Crash Course",
  description:
    "A creator link that unlocks an external destination after payment.",
  destinationLabel: "Open destination",
  destinationHost: "reactnative.dev",
  previewLabel: "Ready to unlock the original destination URL",
}

export const viewerPackMock: ViewerPackMock = {
  title: "KCSE Revision Pack",
  description:
    "A multi-file bundle with PDFs and images grouped into one protected pack.",
  fileCount: 6,
  totalSizeLabel: "42.1 MB",
  files: [
    { name: "Invoice.pdf", type: "PDF", size: "2.4 MB" },
    { name: "Guide.docx", type: "DOCX", size: "1.2 MB" },
    { name: "Workbook.pdf", type: "PDF", size: "4.8 MB" },
    { name: "Cover.png", type: "IMAGE", size: "1.6 MB" },
  ],
}

export const viewerTipMock: ViewerTipMock = {
  title: "Buy me chai",
  description:
    "A lightweight support page with suggested tips and a gratitude note.",
  thankYouMessage: "Thank you for your support! I appreciate every tip.",
  suggestedAmounts: ["2.00", "5.00", "10.00"],
}

export const overviewTransactions: TransactionRecord[] = [
  {
    hash: "0x9f...e2b",
    link: "Design teardown notes",
    wallet: "0x4D2B...A91e",
    amount: "$12.00",
    date: "Today, 11:42",
    network: "hedera-mainnet",
    token: "USDC",
    blockNumber: 24561219,
    gasFee: "$0.03",
    confirmations: 48,
    status: "confirmed",
    fromAddress: "0x5A7B...F329",
    toAddress: "0x4D2B...A91e",
    explorerUrl: "https://hashscan.io/mainnet",
  },
  {
    hash: "0x7a...119",
    link: "KCSE Revision Pack",
    wallet: "0x91Aa...f2B0",
    amount: "$5.00",
    date: "Today, 09:18",
    network: "Polygon",
    token: "USDT",
    blockNumber: 61488221,
    gasFee: "$0.02",
    confirmations: 32,
    status: "confirmed",
    fromAddress: "0x2f11...9c66",
    toAddress: "0x91Aa...f2B0",
    explorerUrl: "https://polygonscan.com",
  },
]

export const documentTransactions: TransactionRecord[] = [
  {
    hash: "0xa1...c91",
    link: "Design teardown notes",
    wallet: "0x11cA...9b12",
    amount: "$4.00",
    date: "Today, 14:10",
    network: "hedera-mainnet",
    token: "USDC",
    blockNumber: 24561284,
    gasFee: "$0.03",
    confirmations: 27,
    status: "confirmed",
    explorerUrl: "https://hashscan.io/mainnet",
  },
  {
    hash: "0x8b...e10",
    link: "Design teardown notes",
    wallet: "0x6B2f...28D1",
    amount: "$4.00",
    date: "Yesterday, 18:22",
    network: "hedera-mainnet",
    token: "USDC",
    blockNumber: 24560201,
    gasFee: "$0.03",
    confirmations: 64,
    status: "confirmed",
    explorerUrl: "https://hashscan.io/mainnet",
  },
]

export const linkTransactions: TransactionRecord[] = [
  {
    hash: "0x5c...2f4",
    link: "React Native Crash Course",
    wallet: "0xA1d2...31aa",
    amount: "$12.00",
    date: "Today, 10:46",
    network: "hedera-mainnet",
    token: "USDC",
    blockNumber: 24561111,
    gasFee: "$0.03",
    confirmations: 41,
    status: "confirmed",
    explorerUrl: "https://hashscan.io/mainnet",
  },
  {
    hash: "0xd8...8aa",
    link: "React Native Crash Course",
    wallet: "0xC0f3...e9f1",
    amount: "$12.00",
    date: "Today, 08:04",
    network: "hedera-mainnet",
    token: "USDC",
    blockNumber: 24560988,
    gasFee: "$0.03",
    confirmations: 53,
    status: "pending",
    explorerUrl: "https://hashscan.io/mainnet",
  },
]

export const packTransactions: TransactionRecord[] = [
  {
    hash: "0x21...7bc",
    link: "KCSE Revision Pack",
    wallet: "0x44Fe...12b0",
    amount: "$16.00",
    date: "Today, 12:30",
    network: "Polygon",
    token: "USDC",
    blockNumber: 61488310,
    gasFee: "$0.02",
    confirmations: 20,
    status: "confirmed",
    explorerUrl: "https://polygonscan.com",
  },
  {
    hash: "0xfe...331",
    link: "KCSE Revision Pack",
    wallet: "0x8d7B...c710",
    amount: "$16.00",
    date: "Yesterday, 09:11",
    network: "Polygon",
    token: "USDC",
    blockNumber: 61487123,
    gasFee: "$0.02",
    confirmations: 88,
    status: "confirmed",
    explorerUrl: "https://polygonscan.com",
  },
]

export const tipTransactions: TransactionRecord[] = [
  {
    hash: "0x19...7d1",
    link: "Buy me chai",
    wallet: "0x0C7f...A9ad",
    amount: "$2.00",
    date: "Today, 13:01",
    network: "hedera-mainnet",
    token: "USDC",
    blockNumber: 24561204,
    gasFee: "$0.03",
    confirmations: 30,
    status: "confirmed",
    explorerUrl: "https://hashscan.io/mainnet",
  },
  {
    hash: "0x4a...6f2",
    link: "Buy me chai",
    wallet: "0x88eA...0cA1",
    amount: "$5.00",
    date: "Today, 07:28",
    network: "hedera-mainnet",
    token: "USDC",
    blockNumber: 24560880,
    gasFee: "$0.03",
    confirmations: 72,
    status: "confirmed",
    explorerUrl: "https://hashscan.io/mainnet",
  },
]
