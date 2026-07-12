import type { ReceiptMetadataInput } from "./types"

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function shortHash(value: string) {
  return `${value.slice(0, 10)}...${value.slice(-6)}`
}

function truncate(value: string, max = 28) {
  if (value.length <= max) return value
  return `${value.slice(0, max - 4)}...`
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function detailRows(input: ReceiptMetadataInput) {
  return [
    ["Creator", truncate(input.creatorName, 30)],
    ["Points Earned", `${input.points}`],
    ["Network", input.networkName],
    ["Transaction", shortHash(input.paymentTxHash)],
    ["Date &amp; Time", formatDateTime(input.createdAt)],
  ]
    .map(
      ([label, value], index) => `
<text x="345" y="${745 + index * 120}" fill="#6B7772" font-family="Space Grotesk, Arial, sans-serif" font-size="27">${label}</text>
<text x="345" y="${790 + index * 120}" fill="#0D2B22" font-family="Space Grotesk, Arial, sans-serif" font-size="30" font-weight="700">${escapeXml(value)}</text>`
    )
    .join("")
}

export function buildReceiptSvg(input: ReceiptMetadataInput) {
  const receiptId = shortHash(input.paymentId)
  const amount = `${input.amountUsdc.toFixed(2)} USDC`

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
  <defs>
    <pattern id="receiptPattern" width="56" height="56" patternUnits="userSpaceOnUse">
      <rect x="17" y="17" width="22" height="22" rx="4" fill="none" stroke="#0D2B22" stroke-width="3" opacity="0.035"/>
      <rect x="22" y="22" width="12" height="12" rx="2" fill="none" stroke="#0D2B22" stroke-width="2" opacity="0.035"/>
    </pattern>
    <filter id="receiptShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="24" stdDeviation="30" flood-color="#000000" flood-opacity="0.14"/>
    </filter>
    <clipPath id="receiptClip">
      <path d="
        M 270 80 H 930 Q 990 80 990 140 V 400
        Q 960 400 960 430 Q 960 460 990 460 V 1430
        Q 970 1430 960 1450 Q 950 1470 930 1470
        Q 910 1470 900 1450 Q 890 1430 870 1430
        Q 850 1430 840 1450 Q 830 1470 810 1470
        Q 790 1470 780 1450 Q 770 1430 750 1430
        Q 730 1430 720 1450 Q 710 1470 690 1470
        Q 670 1470 660 1450 Q 650 1430 630 1430
        Q 610 1430 600 1450 Q 590 1470 570 1470
        Q 550 1470 540 1450 Q 530 1430 510 1430
        Q 490 1430 480 1450 Q 470 1470 450 1470
        Q 430 1470 420 1450 Q 410 1430 390 1430
        Q 370 1430 360 1450 Q 350 1470 330 1470
        Q 310 1470 300 1450 Q 290 1430 270 1430
        V 460 Q 300 460 300 430 Q 300 400 270 400
        V 140 Q 270 80 330 80 Z
      "/>
    </clipPath>
  </defs>
  <rect width="1200" height="1600" fill="#E8E8E8"/>
  <g filter="url(#receiptShadow)">
    <rect x="270" y="80" width="720" height="1390" fill="#FFFFFF" clip-path="url(#receiptClip)"/>
    <rect x="270" y="350" width="720" height="1080" fill="url(#receiptPattern)" clip-path="url(#receiptClip)"/>
    <path d="M 270 140 Q 270 80 330 80 H 930 Q 990 80 990 140 V 350 H 270 Z" fill="#0D2B22" clip-path="url(#receiptClip)"/>
    <text x="345" y="155" fill="#FFFFFF" font-family="Space Grotesk, Arial, sans-serif" font-size="32" font-weight="500">Receipt</text>
    <rect x="345" y="185" width="174" height="52" rx="26" fill="#1A5C3E"/>
    <text x="432" y="219" text-anchor="middle" fill="#D4EBB0" font-family="Space Grotesk, Arial, sans-serif" font-size="23" font-weight="500">Successful</text>
    <g transform="translate(850 142)">
      <rect x="-8" y="-42" width="16" height="84" rx="8" fill="#A8D5B5"/>
      <rect x="-8" y="-42" width="16" height="84" rx="8" fill="#A8D5B5" transform="rotate(45)"/>
      <rect x="-8" y="-42" width="16" height="84" rx="8" fill="#A8D5B5" transform="rotate(90)"/>
      <rect x="-8" y="-42" width="16" height="84" rx="8" fill="#A8D5B5" transform="rotate(135)"/>
    </g>
    <text x="345" y="445" fill="#6B7772" font-family="Space Grotesk, Arial, sans-serif" font-size="28">Amount</text>
    <text x="345" y="505" fill="#0D2B22" font-family="Oxanium, Arial, sans-serif" font-size="54" font-weight="700">${escapeXml(amount)}</text>
    <text x="345" y="610" fill="#6B7772" font-family="Space Grotesk, Arial, sans-serif" font-size="27">Receipt ID</text>
    <text x="345" y="655" fill="#0D2B22" font-family="Space Grotesk, Arial, sans-serif" font-size="29" font-weight="700">${escapeXml(receiptId)}</text>
    ${detailRows(input)}
    <line x1="315" y1="1330" x2="945" y2="1330" stroke="#DCE4E0" stroke-width="2" stroke-dasharray="12 10"/>
    <text x="315" y="1385" fill="#6B7772" font-family="Space Grotesk, Arial, sans-serif" font-size="21">This receipt confirms a completed creator payment.</text>
    <text x="315" y="1422" fill="#6B7772" font-family="Space Grotesk, Arial, sans-serif" font-size="21">It also represents your on-chain proof of support.</text>
  </g>
</svg>`.trim()
}
