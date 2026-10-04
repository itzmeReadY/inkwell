import React, { useState, useRef, useEffect } from 'react'

export interface FreeformTextBox {
  id: string
  x: number
  y: number
  text: string
  color: string
  fontSize: number
}

interface TextBoxLayerProps {
  textBoxes: FreeformTextBox[]
  onUpdateTextBoxes: (boxes: FreeformTextBox[]) => void
  isDrawingMode: boolean
  isTextTool: boolean
  activeColor: string
  activeFontSize: number
  containerRef: React.RefObject<HTMLDivElement | null>
}

export default function TextBoxLayer({
  textBoxes,
  onUpdateTextBoxes,
  isDrawingMode,
  isTextTool,
  activeColor,
  activeFontSize,
  containerRef
}: TextBoxLayerProps) {
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null)
  const draggingBox = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null)
  
  // Use a ref so mouse handlers always access latest state without re-attaching listeners
  const textBoxesRef = useRef(textBoxes)
  textBoxesRef.current = textBoxes

  // Handle clicking on the paper to create a new text box when Text tool is active
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingMode || !isTextTool) return
    const container = containerRef.current
    if (!container) return

    // If clicked on an existing text box or floating toolbar, do not create another one
    const target = e.target as HTMLElement
    if (target.closest('.freeform-text-box') || target.closest('.drawing-toolbar-floating')) {
      return
    }

    const rect = container.getBoundingClientRect()
    const x = Math.max(15, Math.round(e.clientX - rect.left + container.scrollLeft))
    const y = Math.max(15, Math.round(e.clientY - rect.top + container.scrollTop))

    const newBox: FreeformTextBox = {
      id: `tb-${Date.now()}`,
      x,
      y,
      text: '',
      color: activeColor,
      fontSize: activeFontSize
    }

    onUpdateTextBoxes([...textBoxesRef.current, newBox])
    setActiveEditingId(newBox.id)
  }

  // Handle drag movement with 60fps responsiveness
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingBox.current) return
      const { id, startX, startY, origX, origY } = draggingBox.current

      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY

      const newX = Math.max(10, Math.round(origX + deltaX))
      const newY = Math.max(10, Math.round(origY + deltaY))

      onUpdateTextBoxes(
        textBoxesRef.current.map((box) => (box.id === id ? { ...box, x: newX, y: newY } : box))
      )
    }

    const handleMouseUp = () => {
      draggingBox.current = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [onUpdateTextBoxes])

  const startDrag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const box = textBoxesRef.current.find((b) => b.id === id)
    if (!box) return
    draggingBox.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: box.x,
      origY: box.y
    }
  }

  const updateText = (id: string, text: string) => {
    onUpdateTextBoxes(
      textBoxesRef.current.map((box) => (box.id === id ? { ...box, text } : box))
    )
  }

  const handleBlur = (id: string, text: string) => {
    if (!text.trim()) {
      // Remove empty box on blur so canvas stays tidy
      onUpdateTextBoxes(textBoxesRef.current.filter((b) => b.id !== id))
    }
    setActiveEditingId(null)
  }

  const deleteBox = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onUpdateTextBoxes(textBoxesRef.current.filter((b) => b.id !== id))
    if (activeEditingId === id) {
      setActiveEditingId(null)
    }
  }

  return (
    <div 
      className={`text-box-layer ${isTextTool && isDrawingMode ? 'text-tool-active' : ''}`}
      onClick={handleContainerClick}
    >
      {textBoxes.map((box) => {
        const isEditing = activeEditingId === box.id

        return (
          <div
            key={box.id}
            className={`freeform-text-box ${isEditing ? 'editing' : ''} ${isDrawingMode ? 'annotating' : ''}`}
            style={{
              left: `${box.x}px`,
              top: `${box.y}px`,
              color: box.color,
              fontSize: `${box.fontSize}px`
            }}
            onClick={(e) => {
              if (!isDrawingMode) return
              e.stopPropagation()
              setActiveEditingId(box.id)
            }}
          >
            {/* Drag Handle & Delete (Only shown when annotation mode is active) */}
            {isDrawingMode && (
              <div className="text-box-controls">
                <span 
                  className="text-drag-handle" 
                  onMouseDown={(e) => startDrag(box.id, e)}
                  title="Drag to reposition anywhere on paper"
                >
                  ⠿
                </span>
                <button
                  className="text-delete-btn"
                  onClick={(e) => deleteBox(box.id, e)}
                  title="Delete text box"
                >
                  ✕
                </button>
              </div>
            )}

            {isEditing ? (
              <textarea
                autoFocus
                className="text-box-editor"
                value={box.text}
                onChange={(e) => updateText(box.id, e.target.value)}
                onBlur={(e) => handleBlur(box.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    handleBlur(box.id, box.text)
                  }
                }}
                placeholder="Type note or math..."
                style={{
                  color: box.color,
                  fontSize: `${box.fontSize}px`
                }}
                rows={Math.max(1, box.text.split('\n').length)}
              />
            ) : (
              <div 
                className="text-box-display"
                style={{
                  color: box.color,
                  fontSize: `${box.fontSize}px`
                }}
              >
                {box.text || (isDrawingMode ? '(empty text)' : '')}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
