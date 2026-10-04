export type ToolType = 'pen' | 'highlighter' | 'eraser' | 'text'

interface DrawingToolbarProps {
  tool: ToolType
  onSelectTool: (tool: ToolType) => void
  color: string
  onSelectColor: (color: string) => void
  lineWidth: number
  onSelectLineWidth: (width: number) => void
  onUndo: () => void
  onClear: () => void
  onClose: () => void
  isDarkTheme: boolean
}

const LIGHT_PALETTE = [
  { name: 'Navy Ink', value: '#1e3a8a' },
  { name: 'Graphite', value: '#18181b' },
  { name: 'Red Pen', value: '#dc2626' },
  { name: 'Forest Green', value: '#15803d' },
  { name: 'Royal Purple', value: '#7e22ce' },
  { name: 'Neon Yellow', value: '#facc15' },
  { name: 'Cyan Glow', value: '#06b6d4' },
  { name: 'Hot Coral', value: '#f43f5e' },
]

const DARK_PALETTE = [
  { name: 'Chalk White', value: '#f8fafc' },
  { name: 'Electric Cyan', value: '#38bdf8' },
  { name: 'Lavender Neon', value: '#c084fc' },
  { name: 'Highlighter Yellow', value: '#facc15' },
  { name: 'Vibrant Rose', value: '#fb7185' },
  { name: 'Mint Green', value: '#4ade80' },
  { name: 'Bright Orange', value: '#fb923c' },
]

export default function DrawingToolbar({
  tool,
  onSelectTool,
  color,
  onSelectColor,
  lineWidth,
  onSelectLineWidth,
  onUndo,
  onClear,
  onClose,
  isDarkTheme
}: DrawingToolbarProps) {
  const palette = isDarkTheme ? DARK_PALETTE : LIGHT_PALETTE

  return (
    <div className="drawing-toolbar-floating">
      {/* Primary Tool Segment */}
      <div className="tool-segment">
        <button
          className={`tool-pill ${tool === 'pen' ? 'active' : ''}`}
          onClick={() => onSelectTool('pen')}
          title="Ink Pen (Smooth handwriting strokes)"
        >
          <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" />
            <circle cx="11" cy="11" r="2" />
          </svg>
          <span>Pen</span>
        </button>

        <button
          className={`tool-pill ${tool === 'highlighter' ? 'active' : ''}`}
          onClick={() => onSelectTool('highlighter')}
          title="Highlighter (Translucent marker with blend-mode)"
        >
          <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2l4 4L7 17H3v-4L14 2z" />
            <path d="M3 22h18" strokeDasharray="2 2" />
          </svg>
          <span>Highlight</span>
        </button>

        <button
          className={`tool-pill ${tool === 'text' ? 'active' : ''}`}
          onClick={() => onSelectTool('text')}
          title="Type Anywhere on Paper (Click to place text box)"
        >
          <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
          <span>Text</span>
        </button>

        <button
          className={`tool-pill ${tool === 'eraser' ? 'active' : ''}`}
          onClick={() => onSelectTool('eraser')}
          title="Eraser (Clean strokes & annotations)"
        >
          <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13l-5 5L2 7l5-5 11 11z" />
            <path d="M22 22H7" />
          </svg>
          <span>Eraser</span>
        </button>
      </div>

      <div className="divider-v" />

      {/* Color Palette (hidden in eraser mode) */}
      {tool !== 'eraser' && (
        <>
          <div className="palette-segment">
            {palette.map((c) => {
              const isSelected = color === c.value
              return (
                <button
                  key={c.value}
                  className={`color-bubble ${isSelected ? 'selected' : ''}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => onSelectColor(c.value)}
                  title={c.name}
                >
                  {isSelected && <span className="bubble-dot" />}
                </button>
              )
            })}
          </div>
          <div className="divider-v" />
        </>
      )}

      {/* Tip Size Selector */}
      <div className="size-segment">
        <button
          className={`size-gauge ${lineWidth === 2 ? 'active' : ''}`}
          onClick={() => onSelectLineWidth(2)}
          title={tool === 'text' ? 'Fine Text (18px)' : 'Fine Tip (2px)'}
        >
          <span className="dot dot-fine" />
        </button>
        <button
          className={`size-gauge ${lineWidth === 4 ? 'active' : ''}`}
          onClick={() => onSelectLineWidth(4)}
          title={tool === 'text' ? 'Medium Text (24px)' : 'Medium Tip (4px)'}
        >
          <span className="dot dot-med" />
        </button>
        <button
          className={`size-gauge ${lineWidth === 8 ? 'active' : ''}`}
          onClick={() => onSelectLineWidth(8)}
          title={tool === 'text' ? 'Bold Text (32px)' : 'Chisel Tip (8px)'}
        >
          <span className="dot dot-bold" />
        </button>
      </div>

      <div className="divider-v" />

      {/* Action Buttons: Undo, Clear, Close */}
      <div className="action-segment">
        <button className="action-pill" onClick={onUndo} title="Undo last stroke (Ctrl+Z)">
          <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 14 4 9l5-5"/>
            <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>
          </svg>
          <span>Undo</span>
        </button>
        <button className="action-pill danger" onClick={onClear} title="Clear all drawings on page">
          <svg className="tool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            <line x1="10" x2="10" y1="11" y2="17"/>
            <line x1="14" x2="14" y1="11" y2="17"/>
          </svg>
          <span>Clear</span>
        </button>
        <button 
          className="btn-done-pill" 
          onClick={onClose} 
          title="Finish annotating and close toolbar"
        >
          ✕ Done
        </button>
      </div>
    </div>
  )
}
