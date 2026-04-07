import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  AvatarGroupCount,
} from "@/components/ui/avatar"

interface AvatarGroupDisplayProps<T> {
  items: T[]
  showGroupRemaining?: boolean
  getAvatarSrc: (item: T) => string
  getAvatarAlt: (item: T) => string
  getAvatarFallback: (item: T) => string
}

export function AvatarDisplay({
  items,
  showGroupRemaining,
  getAvatarSrc,
  getAvatarAlt,
  getAvatarFallback,
}: AvatarGroupDisplayProps<any>) {
  return (
    <AvatarGroup className="mt-0">
      {items.slice(0, 3).map((item, index) => (
        <Avatar key={index}>
          <AvatarImage
            src={getAvatarSrc(item)}
            alt={getAvatarAlt(item)}
            className="border-0 border-transparent"
          />
          <AvatarFallback>{getAvatarFallback(item)}</AvatarFallback>
        </Avatar>
      ))}
      {showGroupRemaining && (
        <AvatarGroupCount>+{items.length - 3}</AvatarGroupCount>
      )}
    </AvatarGroup>
  )
}
