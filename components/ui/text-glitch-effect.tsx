"use client"

import { useEffect, useRef, useState } from "react"

interface TextEffectProps {
  text: string
  hoverText?: string
  href?: string
  className?: string
  delay?: number
}

export function TextGlitch({
  text,
  hoverText,
  href,
  className = "",
  delay = 0,
}: TextEffectProps) {
  const textRef = useRef<HTMLHeadingElement>(null)
  const spanRef = useRef<HTMLSpanElement>(null)
  const [displayHoverText, setDisplayHoverText] = useState(hoverText || text)
  const hoverIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import("gsap")

      if (textRef.current) {
        gsap.set(textRef.current, {
          backgroundSize: "0%",
          scale: 0.95,
          opacity: 0.7,
        })

        const tl = gsap.timeline({ delay })

        tl.to(textRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
        }).to(
          textRef.current,
          {
            backgroundSize: "100%",
            duration: 2,
            ease: "elastic.out(1, 0.5)",
          },
          "-=0.3"
        )
      }
    }

    loadGSAP()
  }, [delay])

  const handleMouseEnter = () => {
    if (hoverText) {
      let iteration = 0

      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current)
      }

      hoverIntervalRef.current = setInterval(() => {
        setDisplayHoverText(
          hoverText
            .split("")
            .map((letter, index) => {
              if (letter === " ") return " "
              if (index < iteration) return hoverText[index]

              return letters[Math.floor(Math.random() * letters.length)]
            })
            .join("")
        )

        if (iteration >= hoverText.length) {
          clearInterval(hoverIntervalRef.current!)
        }

        iteration += 1 / 3
      }, 30)
    }

    if (spanRef.current) {
      spanRef.current.style.clipPath =
        "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
    }
  }

  const handleMouseLeave = () => {
    if (hoverIntervalRef.current) {
      clearInterval(hoverIntervalRef.current)
    }

    setDisplayHoverText(hoverText || text)

    if (spanRef.current) {
      spanRef.current.style.clipPath =
        "polygon(0 50%, 100% 50%, 100% 50%, 0 50%)"
    }
  }

  useEffect(() => {
    return () => {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current)
      }
    }
  }, [])

  const spanContent = hoverText ? (
    href ? (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-inherit no-underline"
      >
        {displayHoverText}
      </a>
    ) : (
      displayHoverText
    )
  ) : (
    text
  )

  return (
    <h1
      ref={textRef}
      className={`relative m-0 flex w-full cursor-pointer flex-col items-start justify-center overflow-hidden border-b border-neutral-600/20 bg-gradient-to-r from-neutral-800 to-neutral-500 bg-clip-text bg-no-repeat font-heading text-[clamp(3rem,10vw,7rem)] font-black leading-[0.9] tracking-normal text-neutral-600/20 transition-all duration-500 ease-out dark:from-neutral-100 dark:to-neutral-400 ${className}`}
      style={{
        backgroundSize: "0%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        maxWidth: "100%",
        wordBreak: "break-word",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {text}
      <span
        ref={spanRef}
        className="pointer-events-none absolute inset-0 flex h-full w-full flex-col justify-center overflow-hidden bg-[#ffff02] font-heading font-black text-black transition-all duration-400 ease-out"
        style={{
          clipPath: "polygon(0 50%, 100% 50%, 100% 50%, 0 50%)",
          transformOrigin: "center",
          maxWidth: "100%",
          wordBreak: "break-word",
        }}
      >
        {spanContent}
      </span>
    </h1>
  )
}
