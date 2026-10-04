import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react'

export interface DrawingCanvasHandle {
  undo: () => void
  clear: () => void
  hasDrawings: () => boolean
  getCanvasDataUrl: () => string
}

interface DrawingCanvasProps {
  isDrawingMode: boolean
  tool: 'pen' | 'highlighter' | 'eraser'
  color: string
  lineWidth: number
  initialDataUrl?: string
  onSaveDrawing?: (dataUrl: string) => void
  containerRef: React.RefObject<HTMLDivElement | null>
}

const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(({
  isDrawingMode,
  tool,
  color,
  lineWidth,
  initialDataUrl,
  onSaveDrawing,
  containerRef
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawing = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const lastSavedDataUrl = useRef<string | null>(null)

  // Adjust canvas size to match the container's exact content size
  const syncCanvasSize = useCallback(() => {
    if (isDrawing.current) return // Do not resize mid-stroke
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const width = Math.max(container.scrollWidth, container.clientWidth, 600)
    const height = Math.max(container.scrollHeight, container.clientHeight, 800)

    if (canvas.width !== width || canvas.height !== height) {
      const prevData = canvas.toDataURL()
      canvas.width = width
      canvas.height = height
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      const ctx = canvas.getContext('2d')
      if (ctx && prevData && prevData !== 'data:,') {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
        }
        img.src = prevData
      }
    }
  }, [containerRef])

  useEffect(() => {
    syncCanvasSize()
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      syncCanvasSize()
    })
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [syncCanvasSize, containerRef])

  // Load initial drawing when switching pages (do NOT clear if canvas already holds this state)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (initialDataUrl === lastSavedDataUrl.current) return
    lastSavedDataUrl.current = initialDataUrl || null

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (initialDataUrl && initialDataUrl.startsWith('data:image')) {
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        setHistory([initialDataUrl])
      }
      img.src = initialDataUrl
    } else {
      setHistory([])
    }
  }, [initialDataUrl])

  // Calculate coordinates with exact canvas pixel to CSS pixel scaling
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    const scaleX = rect.width ? canvas.width / rect.width : 1
    const scaleY = rect.height ? canvas.height / rect.height : 1

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    isDrawing.current = true
    const { x, y } = getCanvasCoords(e)
    lastPoint.current = { x, y }

    // Save history point before stroke
    setHistory((prev) => [...prev, canvas.toDataURL()])

    // Draw initial dot immediately
    ctx.save()
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, lineWidth * 4, 0, Math.PI * 2)
      ctx.fill()
    } else if (tool === 'highlighter') {
      // Fluorescent highlighter initial dot
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = hexToRgba(color, 0.45)
      ctx.beginPath()
      ctx.arc(x, y, (lineWidth * 4) / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // Pen
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, Math.max(1.5, lineWidth / 2), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !isDrawingMode) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !lastPoint.current) return

    const { x, y } = getCanvasCoords(e)

    ctx.save()
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = lineWidth * 6
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (tool === 'highlighter') {
      // Clean, bright highlighter with smooth chisel line
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = hexToRgba(color, 0.45)
      ctx.lineWidth = lineWidth * 4.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    } else {
      // Pen
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    ctx.restore()

    lastPoint.current = { x, y }
  }

  const stopDrawing = () => {
    if (!isDrawing.current) return
    isDrawing.current = false
    lastPoint.current = null

    const canvas = canvasRef.current
    if (canvas && onSaveDrawing) {
      const dataUrl = canvas.toDataURL()
      lastSavedDataUrl.current = dataUrl
      onSaveDrawing(dataUrl)
    }
  }

  useImperativeHandle(ref, () => ({
    undo: () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx || history.length === 0) return

      const newHistory = [...history]
      const prevState = newHistory.pop()
      setHistory(newHistory)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (prevState && prevState.startsWith('data:image')) {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          const dataUrl = canvas.toDataURL()
          lastSavedDataUrl.current = dataUrl
          if (onSaveDrawing) onSaveDrawing(dataUrl)
        }
        img.src = prevState
      } else {
        lastSavedDataUrl.current = ''
        if (onSaveDrawing) onSaveDrawing('')
      }
    },
    clear: () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setHistory([])
      lastSavedDataUrl.current = ''
      if (onSaveDrawing) onSaveDrawing('')
    },
    hasDrawings: () => history.length > 0,
    getCanvasDataUrl: () => {
      const canvas = canvasRef.current
      return canvas ? canvas.toDataURL() : ''
    }
  }))

  return (
    <canvas
      ref={canvasRef}
      className={`drawing-canvas-overlay ${isDrawingMode ? 'drawing-active tool-' + tool : 'drawing-inactive'}`}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  )
})

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16)
    const g = parseInt(cleanHex[1] + cleanHex[1], 16)
    const b = parseInt(cleanHex[2] + cleanHex[2], 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return hex
}

export default DrawingCanvas
