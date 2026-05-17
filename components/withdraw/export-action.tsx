import Image from "next/image"
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download01FreeIcons } from "@hugeicons/core-free-icons"

export function ExportActionFooter(){
  return (
    <DrawerFooter className="mx-auto my-0 w-full md:max-w-md">
      <Button className="flex items-center gap-1">
        Download
      <HugeiconsIcon icon={Download01FreeIcons} />
      </Button>
      <DrawerClose>
        <Button variant="outline" className="w-full">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>

  )
}

export default function ExportAction() {
  return (
    <div className="my-4 flex flex-col items-center gap-2">
      <Image src="/export.png" alt="Export" height={1000} width={1000} className="object-contain" />
    </div>
  )
}