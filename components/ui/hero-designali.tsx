"use client"

import * as React from "react"
import { ReactTyped } from "react-typed"

import { cn } from "@/lib/utils"

type OscillatorOptions = {
  phase?: number
  offset?: number
  frequency?: number
  amplitude?: number
}

class Oscillator {
  private phase: number
  private offset: number
  private frequency: number
  private amplitude: number
  private current: number

  constructor(options: OscillatorOptions = {}) {
    this.phase = options.phase || 0
    this.offset = options.offset || 0
    this.frequency = options.frequency || 0.001
    this.amplitude = options.amplitude || 1
    this.current = this.offset
  }

  update() {
    this.phase += this.frequency
    this.current = this.offset + Math.sin(this.phase) * this.amplitude
    return this.current
  }
}

class Node {
  x = 0
  y = 0
  vy = 0
  vx = 0
}

const effectConfig = {
  friction: 0.5,
  trails: 80,
  size: 50,
  dampening: 0.025,
  tension: 0.99,
}

let ctx: (CanvasRenderingContext2D & { running?: boolean; frame?: number }) | null
let hue: Oscillator
let pos = { x: 0, y: 0 }
let lines: Line[] = []
let animationFrame = 0
let cleanupCanvas: (() => void) | undefined

class Line {
  private spring: number
  private friction: number
  private nodes: Node[]

  constructor(options: { spring: number }) {
    this.spring = options.spring + 0.1 * Math.random() - 0.05
    this.friction = effectConfig.friction + 0.01 * Math.random() - 0.005
    this.nodes = []

    for (let index = 0; index < effectConfig.size; index++) {
      const node = new Node()
      node.x = pos.x
      node.y = pos.y
      this.nodes.push(node)
    }
  }

  update() {
    let spring = this.spring
    let node = this.nodes[0]

    node.vx += (pos.x - node.x) * spring
    node.vy += (pos.y - node.y) * spring

    for (let index = 0; index < this.nodes.length; index++) {
      node = this.nodes[index]

      if (index > 0) {
        const previous = this.nodes[index - 1]
        node.vx += (previous.x - node.x) * spring
        node.vy += (previous.y - node.y) * spring
        node.vx += previous.vx * effectConfig.dampening
        node.vy += previous.vy * effectConfig.dampening
      }

      node.vx *= this.friction
      node.vy *= this.friction
      node.x += node.vx
      node.y += node.vy
      spring *= effectConfig.tension
    }
  }

  draw() {
    if (!ctx) return

    let x = this.nodes[0].x
    let y = this.nodes[0].y

    ctx.beginPath()
    ctx.moveTo(x, y)

    let index = 1
    const length = this.nodes.length - 2

    for (; index < length; index++) {
      const current = this.nodes[index]
      const next = this.nodes[index + 1]
      x = 0.5 * (current.x + next.x)
      y = 0.5 * (current.y + next.y)
      ctx.quadraticCurveTo(current.x, current.y, x, y)
    }

    const current = this.nodes[index]
    const next = this.nodes[index + 1]
    ctx.quadraticCurveTo(current.x, current.y, next.x, next.y)
    ctx.stroke()
    ctx.closePath()
  }
}

function createLines() {
  lines = []

  for (let index = 0; index < effectConfig.trails; index++) {
    lines.push(
      new Line({
        spring: 0.45 + (index / effectConfig.trails) * 0.025,
      })
    )
  }
}

function updatePointer(event: MouseEvent | TouchEvent) {
  if ("touches" in event && event.touches.length > 0) {
    pos.x = event.touches[0].pageX
    pos.y = event.touches[0].pageY
  } else if ("clientX" in event) {
    pos.x = event.clientX
    pos.y = event.clientY
  }
}

function onTouchStart(event: TouchEvent) {
  if (event.touches.length === 1) {
    pos.x = event.touches[0].pageX
    pos.y = event.touches[0].pageY
  }
}

function onInitialPointerMove(event: MouseEvent | TouchEvent) {
  document.removeEventListener("mousemove", onInitialPointerMove)
  document.removeEventListener("touchstart", onInitialPointerMove)
  document.addEventListener("mousemove", updatePointer)
  document.addEventListener("touchmove", updatePointer, { passive: true })
  document.addEventListener("touchstart", onTouchStart)
  updatePointer(event)
  createLines()
  render()
}

function render() {
  if (!ctx?.running) return

  ctx.globalCompositeOperation = "source-over"
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.globalCompositeOperation = "lighter"
  ctx.strokeStyle = `hsla(${Math.round(hue.update())},100%,50%,0.025)`
  ctx.lineWidth = 10

  for (let index = 0; index < effectConfig.trails; index++) {
    lines[index]?.update()
    lines[index]?.draw()
  }

  ctx.frame = (ctx.frame || 0) + 1
  animationFrame = window.requestAnimationFrame(render)
}

function resizeCanvas() {
  if (!ctx) return

  ctx.canvas.width = Math.max(window.innerWidth - 20, 0)
  ctx.canvas.height = window.innerHeight
}

const renderCanvas = function () {
  cleanupCanvas?.()

  const canvas = document.getElementById("canvas") as HTMLCanvasElement | null
  const nextCtx = canvas?.getContext("2d")

  if (!canvas || !nextCtx) return () => {}

  ctx = nextCtx as CanvasRenderingContext2D & {
    running?: boolean
    frame?: number
  }
  ctx.running = true
  ctx.frame = 1
  pos = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  }
  hue = new Oscillator({
    phase: Math.random() * 2 * Math.PI,
    amplitude: 85,
    frequency: 0.0015,
    offset: 285,
  })

  const onFocus = () => {
    if (!ctx?.running) {
      ctx!.running = true
      render()
    }
  }

  const onBlur = () => {
    if (ctx) ctx.running = false
  }

  document.addEventListener("mousemove", onInitialPointerMove)
  document.addEventListener("touchstart", onInitialPointerMove)
  document.body.addEventListener("orientationchange", resizeCanvas)
  window.addEventListener("resize", resizeCanvas)
  window.addEventListener("focus", onFocus)
  window.addEventListener("blur", onBlur)
  resizeCanvas()

  cleanupCanvas = () => {
    if (ctx) ctx.running = false
    window.cancelAnimationFrame(animationFrame)
    document.removeEventListener("mousemove", onInitialPointerMove)
    document.removeEventListener("touchstart", onInitialPointerMove)
    document.removeEventListener("mousemove", updatePointer)
    document.removeEventListener("touchmove", updatePointer)
    document.removeEventListener("touchstart", onTouchStart)
    document.body.removeEventListener("orientationchange", resizeCanvas)
    window.removeEventListener("resize", resizeCanvas)
    window.removeEventListener("focus", onFocus)
    window.removeEventListener("blur", onBlur)
    lines = []
    ctx = null
  }

  return cleanupCanvas
}

interface TypeWriterProps {
  strings: string[]
}

const TypeWriter = ({ strings }: TypeWriterProps) => {
  return (
    <ReactTyped
      loop
      typeSpeed={80}
      backSpeed={20}
      strings={strings}
      smartBackspace
      backDelay={1000}
      loopCount={0}
      showCursor
      cursorChar="|"
    />
  )
}

type TColorProp = string | string[]

interface ShineBorderProps {
  borderRadius?: number
  borderWidth?: number
  duration?: number
  color?: TColorProp
  className?: string
  children: React.ReactNode
}

function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  color = "#000000",
  className,
  children,
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          "--border-radius": `${borderRadius}px`,
        } as React.CSSProperties
      }
      className={cn(
        "relative grid h-full w-full place-items-center rounded-3xl bg-white p-3 text-black dark:bg-black dark:text-white",
        className
      )}
    >
      <div
        style={
          {
            "--border-width": `${borderWidth}px`,
            "--border-radius": `${borderRadius}px`,
            "--shine-pulse-duration": `${duration}s`,
            "--mask-linear-gradient":
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            "--background-radial-gradient": `radial-gradient(transparent, transparent, ${
              color instanceof Array ? color.join(",") : color
            }, transparent, transparent)`,
          } as React.CSSProperties
        }
        className='before:bg-shine-size before:absolute before:inset-0 before:aspect-square before:size-full before:rounded-3xl before:p-[--border-width] before:will-change-[background-position] before:content-[""] before:![-webkit-mask-composite:xor] before:[background-image:--background-radial-gradient] before:[background-size:300%_300%] before:![mask-composite:exclude] before:[mask:--mask-linear-gradient] motion-safe:before:animate-[shine-pulse_var(--shine-pulse-duration)_infinite_linear]'
      />
      {children}
    </div>
  )
}

export { renderCanvas, TypeWriter, ShineBorder }
