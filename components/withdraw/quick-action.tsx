"use client"

import React, { useRef } from "react"
import LottieComponent, { AnimationFile } from "@/components/lottie-animation"
import { Button } from "@/components/ui/button"
import type { DotLottie } from "@lottiefiles/dotlottie-react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

export interface IQuickAction {
  id: AnimationFile
  title: string
  description: string
  onClick: () => void
  content: React.ReactNode
  footer: React.ReactNode
}

export default function QuickAction({
  quickAction,
}: {
  quickAction: IQuickAction
}) {
  const dotLottieRef = useRef<DotLottie | null>(null)

  const handleDotLottieRef = (instance: DotLottie | null) => {
    dotLottieRef.current = instance
  }

  const handleMouseEnter = () => {
    const dot = dotLottieRef.current
    if (!dot) return
    dot.stop()
    dot.setFrame(0)
    dot.play()
  }

  return (
    <Drawer>
      <DrawerTrigger>
        <Button
          variant="ghost"
          className="my-2 flex size-44 flex-none cursor-pointer flex-col gap-2 rounded-2xl border border-foreground/15 p-2 shadow"
          onClick={quickAction.onClick}
          onMouseEnter={handleMouseEnter}
        >
          <LottieComponent
            loop={false}
            page={quickAction.id}
            dotLottieRefCallback={handleDotLottieRef}
          />
          <div className="flex items-center justify-center">
            <p className="text-sm font-semibold md:text-base">
              {quickAction.title}
            </p>
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="font-sans text-xl font-semibold">
            {quickAction.title}
          </DrawerTitle>
          <DrawerDescription className="text-sm">
            {quickAction.description}
          </DrawerDescription>
        </DrawerHeader>
        <div className="mx-auto my-0 w-full overflow-y-scroll md:max-w-md">
          {quickAction.content}
        </div>
        {quickAction.footer}
      </DrawerContent>
    </Drawer>
  )
}
