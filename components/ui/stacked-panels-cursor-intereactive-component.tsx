"use client"

import * as React from "react"
import {
  AnimatePresence,
  motion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"

const PANEL_COUNT = 22
const WAVE_SPRING = { stiffness: 160, damping: 22, mass: 0.6 }
const SCENE_SPRING = { stiffness: 80, damping: 22, mass: 1 }
const CURSOR_SPRING = { stiffness: 140, damping: 24, mass: 0.8 }
const Z_SPREAD = 42
const SIGMA = 2.8

const DEFAULT_PANEL_IMAGES = [
  "https://images.unsplash.com/photo-1579054633799-fcbd9319625c?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1694175271713-a6e2cc378980?q=80&w=1065&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1594750301245-b1a185b40ce5?q=80&w=974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1533102412356-cd8b0799505c?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1611182993400-4827ad83e3be?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1557040640-9ae9fb23e085?q=80&w=1035&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1664277497095-424e085175e8?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1556742521-9713bf272865?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1584472666879-7d92db132958?q=80&w=1001&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1632800237110-f9c87acc2222?q=80&w=1064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1621609764710-57a57cb444f5?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/flagged/photo-1559264243-77e7b0942b77?q=80&w=1035&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1728906393690-1753bc263ade?q=80&w=1015&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1638349693988-beedf009e9fe?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1722347757335-3f9aefe6f30f?q=80&w=978&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1718010571964-bac048b9ded0?q=80&w=1970&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1610473068533-b68dbcd23543?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1543938173-7e12b7b3ba11?q=80&w=2028&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1525183480399-e8706926adac?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1635961073801-d650fdaf862b?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1765648636080-eea4cb482355?q=80&w=988&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/flagged/photo-1563855078923-9cb686dc0e7a?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
]

const GRADIENT_OVERLAYS = [
  "linear-gradient(135deg, rgba(99,55,255,0.55) 0%, rgba(236,72,153,0.45) 100%)",
  "linear-gradient(135deg, rgba(6,182,212,0.55) 0%, rgba(59,130,246,0.45) 100%)",
  "linear-gradient(135deg, rgba(245,158,11,0.55) 0%, rgba(239,68,68,0.45) 100%)",
  "linear-gradient(135deg, rgba(16,185,129,0.45) 0%, rgba(6,182,212,0.55) 100%)",
  "linear-gradient(135deg, rgba(236,72,153,0.55) 0%, rgba(245,158,11,0.45) 100%)",
  "linear-gradient(135deg, rgba(59,130,246,0.55) 0%, rgba(99,55,255,0.45) 100%)",
  "linear-gradient(135deg, rgba(239,68,68,0.45) 0%, rgba(236,72,153,0.55) 100%)",
  "linear-gradient(135deg, rgba(6,182,212,0.45) 0%, rgba(16,185,129,0.55) 100%)",
  "linear-gradient(135deg, rgba(99,55,255,0.45) 0%, rgba(6,182,212,0.55) 100%)",
  "linear-gradient(135deg, rgba(245,158,11,0.45) 0%, rgba(16,185,129,0.55) 100%)",
  "linear-gradient(135deg, rgba(239,68,68,0.55) 0%, rgba(245,158,11,0.45) 100%)",
  "linear-gradient(135deg, rgba(99,55,255,0.55) 0%, rgba(59,130,246,0.45) 100%)",
  "linear-gradient(135deg, rgba(16,185,129,0.55) 0%, rgba(99,55,255,0.45) 100%)",
  "linear-gradient(135deg, rgba(236,72,153,0.45) 0%, rgba(59,130,246,0.55) 100%)",
  "linear-gradient(135deg, rgba(6,182,212,0.55) 0%, rgba(245,158,11,0.45) 100%)",
  "linear-gradient(135deg, rgba(59,130,246,0.45) 0%, rgba(16,185,129,0.55) 100%)",
  "linear-gradient(135deg, rgba(245,158,11,0.55) 0%, rgba(99,55,255,0.45) 100%)",
  "linear-gradient(135deg, rgba(239,68,68,0.45) 0%, rgba(6,182,212,0.55) 100%)",
  "linear-gradient(135deg, rgba(99,55,255,0.45) 0%, rgba(236,72,153,0.55) 100%)",
  "linear-gradient(135deg, rgba(16,185,129,0.45) 0%, rgba(245,158,11,0.55) 100%)",
  "linear-gradient(135deg, rgba(236,72,153,0.55) 0%, rgba(239,68,68,0.45) 100%)",
  "linear-gradient(135deg, rgba(59,130,246,0.55) 0%, rgba(6,182,212,0.45) 100%)",
]

type StackedPanelsProps = {
  images?: string[]
  className?: string
}

function Panel({
  index,
  total,
  active,
  cursorIndex,
  imageUrl,
  isFront,
}: {
  index: number
  total: number
  active: boolean
  cursorIndex: MotionValue<number>
  imageUrl: string
  isFront: boolean
}) {
  const t = index / (total - 1)
  const baseZ = (index - (total - 1)) * Z_SPREAD

  const width = 200 + t * 80
  const height = 280 + t * 120
  const opacity = 0.25 + t * 0.75
  const gradient = GRADIENT_OVERLAYS[index % GRADIENT_OVERLAYS.length]

  const waveYRaw = useTransform(cursorIndex, (cursor) => {
    if (!active) return 0
    const dist = Math.abs(index - cursor)
    const influence = Math.exp(-(dist * dist) / (2 * SIGMA * SIGMA))
    return -influence * 70
  })

  const scaleYRaw = useTransform(cursorIndex, (cursor) => {
    if (!active) return 1
    const dist = Math.abs(index - cursor)
    const influence = Math.exp(-(dist * dist) / (2 * SIGMA * SIGMA))
    return 0.35 + influence * 0.65
  })

  const waveY = useSpring(waveYRaw, WAVE_SPRING)
  const scaleY = useSpring(scaleYRaw, WAVE_SPRING)

  return (
    <motion.div
      className="pointer-events-none absolute overflow-hidden rounded-xl"
      style={{
        width,
        height,
        marginLeft: -width / 2,
        marginTop: -height / 2,
        translateZ: baseZ,
        y: waveY,
        scaleY,
        transformOrigin: "bottom center",
        opacity,
      }}
    >
      {isFront ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={imageUrl}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </AnimatePresence>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: gradient,
          mixBlendMode: "multiply",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.32) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          border: `1px solid rgba(255,255,255,${0.08 + t * 0.22})`,
          boxSizing: "border-box",
        }}
      />
    </motion.div>
  )
}

export default function StackedPanels({
  images = DEFAULT_PANEL_IMAGES,
  className,
}: StackedPanelsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState(false)

  const panelCount = PANEL_COUNT
  const center = (panelCount - 1) / 2
  const resolvedImages = images.length > 0 ? images : DEFAULT_PANEL_IMAGES

  const [frontImageIndex, setFrontImageIndex] = React.useState(() =>
    Math.floor(Math.random() * resolvedImages.length)
  )

  const cursorIndex = useSpring(center, CURSOR_SPRING)
  const rotY = useSpring(-42, SCENE_SPRING)
  const rotX = useSpring(18, SCENE_SPRING)

  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      setActive(true)

      const cx = (event.clientX - rect.left) / rect.width
      const cy = (event.clientY - rect.top) / rect.height

      rotY.set(-42 + (cx - 0.5) * 14)
      rotX.set(18 + (cy - 0.5) * -10)
      cursorIndex.set(cx * (panelCount - 1))
    },
    [cursorIndex, panelCount, rotX, rotY]
  )

  const handleMouseLeave = React.useCallback(() => {
    setActive(false)
    rotY.set(-42)
    rotX.set(18)
    cursorIndex.set(center)
  }, [center, cursorIndex, rotX, rotY])

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFrontImageIndex((prev) => {
        if (resolvedImages.length <= 1) return prev

        let next = prev
        while (next === prev) {
          next = Math.floor(Math.random() * resolvedImages.length)
        }
        return next
      })
    }, 3200)

    return () => window.clearInterval(intervalId)
  }, [resolvedImages.length])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative flex h-full w-full items-center justify-center select-none ${className ?? ""}`}
      style={{ perspective: "900px" }}
    >
      <motion.div
        style={{
          rotateY: rotY,
          rotateX: rotX,
          transformStyle: "preserve-3d",
          position: "relative",
          width: 0,
          height: 0,
        }}
      >
        {Array.from({ length: panelCount }).map((_, index) => (
          <Panel
            key={index}
            index={index}
            total={panelCount}
            active={active}
            cursorIndex={cursorIndex}
            imageUrl={
              index === panelCount - 1
                ? resolvedImages[frontImageIndex]
                : resolvedImages[index % resolvedImages.length]
            }
            isFront={index === panelCount - 1}
          />
        ))}
      </motion.div>
    </div>
  )
}
