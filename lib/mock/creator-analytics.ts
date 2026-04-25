import type { LinkPublic } from "@/app/api/public/creator/[handle]/route"

export interface CreatorAnalytics {
  totalProfileViews: number
  confirmedSales: number
  netEarningsUsdc: number
  uniqueSupporters: number
  totalFeesUsdc: number
  totalRevenueUsdc: number
  primaryNetwork: string
  averagePriceUsdc: number
  conversionRate: number
  topContentType: string
}

const MOCK_TRANSACTION_DATA_BY_HANDLE: Record<
  string,
  {
    confirmedSales: number
    netEarningsUsdc: number
    uniqueSupporters: number
    totalFeesUsdc: number
    totalRevenueUsdc: number
    primaryNetwork: string
  }
> = {
  demo: {
    confirmedSales: 18,
    netEarningsUsdc: 722.6,
    uniqueSupporters: 14,
    totalFeesUsdc: 67.4,
    totalRevenueUsdc: 790,
    primaryNetwork: "Hedera",
  },
}

function formatTopType(links: LinkPublic[]) {
  if (!links.length) return "N/A"

  const counts = links.reduce<Record<string, number>>((acc, link) => {
    acc[link.type] = (acc[link.type] ?? 0) + 1
    return acc
  }, {})

  const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  if (!topEntry) return "N/A"

  return topEntry[0].charAt(0).toUpperCase() + topEntry[0].slice(1)
}

export async function getCreatorAnalyticsMock(
  handle: string,
  links: LinkPublic[]
): Promise<CreatorAnalytics> {
  const normalizedHandle = handle.trim().toLowerCase()
  const mocked = MOCK_TRANSACTION_DATA_BY_HANDLE[normalizedHandle]

  const totalProfileViews = links.reduce(
    (sum, link) => sum + (link.view_count ?? 0),
    0
  )

  const pricedLinks = links.filter(
    (link) => link.price_usdc && link.price_usdc > 0
  )
  const averagePriceUsdc = pricedLinks.length
    ? pricedLinks.reduce((sum, link) => sum + (link.price_usdc ?? 0), 0) /
      pricedLinks.length
    : 0

  const fallbackSales = links.reduce(
    (sum, link) => sum + (link.payment_count ?? 0),
    0
  )

  const confirmedSales = mocked?.confirmedSales ?? fallbackSales
  const conversionRate =
    totalProfileViews > 0 ? (confirmedSales / totalProfileViews) * 100 : 0

  return {
    totalProfileViews,
    confirmedSales,
    netEarningsUsdc:
      mocked?.netEarningsUsdc ?? confirmedSales * averagePriceUsdc,
    uniqueSupporters:
      mocked?.uniqueSupporters ?? Math.max(0, confirmedSales - 1),
    totalFeesUsdc: mocked?.totalFeesUsdc ?? confirmedSales * 0.15,
    totalRevenueUsdc:
      mocked?.totalRevenueUsdc ??
      confirmedSales * Math.max(averagePriceUsdc, 1),
    primaryNetwork: mocked?.primaryNetwork ?? "Hedera",
    averagePriceUsdc,
    conversionRate,
    topContentType: formatTopType(links),
  }
}
