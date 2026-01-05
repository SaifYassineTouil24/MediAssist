"use client"

import type React from "react"
import { useEffect } from "react"

interface OrdonnanceTemplateProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  onImageLoaded: () => void
}

export function OrdonnanceTemplate({ canvasRef, onImageLoaded }: OrdonnanceTemplateProps) {
  useEffect(() => {
    const loadImage = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PGr2JQS1oesOKBCfb8y3TQLIvkwOJq.png"

      img.onload = () => {
        // Set canvas size to match image dimensions
        canvas.width = img.width
        canvas.height = img.height

        // Draw the image
        ctx.drawImage(img, 0, 0)
        onImageLoaded()
      }

      img.onerror = () => {
        console.error("[v0] Failed to load ordonnance image")
        // Fallback: set canvas size and white background
        canvas.width = 800
        canvas.height = 1100
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        onImageLoaded()
      }
    }

    loadImage()
  }, [canvasRef, onImageLoaded])

  return null
}
