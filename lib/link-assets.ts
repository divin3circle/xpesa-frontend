const linkImages = {
  PACK: "/pack.jpg",
  PACK1: "/pack1.avif",
  DOCUMENT: "/docs.webp",
  GATE_LINK: "/links.avif",
  TIPS: "/tips.png",
}

export function getLinkImageURL(type: string) {
  switch (type) {
    case "pack":
      return linkImages.PACK
    case "document":
      return linkImages.DOCUMENT
    case "gate":
      return linkImages.GATE_LINK
    case "tip":
      return linkImages.TIPS
    default:
      return linkImages.GATE_LINK
  }
}
