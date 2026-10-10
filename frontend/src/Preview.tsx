import React, { useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import './Preview.css'
import DrawingCanvas from './DrawingCanvas'
import type { DrawingCanvasHandle } from './DrawingCanvas'
import type { ToolType } from './DrawingToolbar'
import TextBoxLayer from './TextBoxLayer'
import type { FreeformTextBox } from './TextBoxLayer'

// ⚡ Bolt: Memoize plugins and ReactMarkdown component to prevent unnecessary re-rendering
// Creating arrays inline like `remarkPlugins={[remarkMath]}` breaks memoization in ReactMarkdown
// causing the entire KaTeX math tree to be re-parsed on every keystroke in the left editor
const REMARK_PLUGINS = [remarkMath] as any;
const REHYPE_PLUGINS = [rehypeKatex] as any;

const MemoizedMarkdown = React.memo(({ markdown }: { markdown: string }) => (
  <ReactMarkdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS}>{markdown}</ReactMarkdown>
));

interface PreviewProps {
  markdown: string
  theme: string
  font: string
  layout?: string
  isDrawingMode: boolean
  tool: ToolType
  color: string
  lineWidth: number
  drawingDataUrl?: string
  onSaveDrawing?: (dataUrl: string) => void
  canvasRef: React.RefObject<DrawingCanvasHandle | null>
  textBoxes?: FreeformTextBox[]
  onUpdateTextBoxes?: (boxes: FreeformTextBox[]) => void
  isEditingMarkdown?: boolean
  onUpdateMarkdown?: (markdown: string) => void
  onToggleEditMarkdown?: () => void
}

export default function Preview({
  markdown,
  theme,
  font,
  layout = 'single',
  isDrawingMode,
  tool,
  color,
  lineWidth,
  drawingDataUrl,
  onSaveDrawing,
  canvasRef,
  textBoxes = [],
  onUpdateTextBoxes = () => {},
  isEditingMarkdown = false,
  onUpdateMarkdown = () => {},
  onToggleEditMarkdown = () => {}
}: PreviewProps) {
  const paperRef = useRef<HTMLDivElement | null>(null)

  // Map line width to font size for text tool (2px -> 18px, 4px -> 24px, 8px -> 32px)
  const activeFontSize = lineWidth === 2 ? 18 : lineWidth === 8 ? 32 : 24

  if (!markdown && !isEditingMarkdown) {
    return (
      <div className={`paper theme-${theme} font-${font} layout-${layout} empty-preview`} ref={paperRef}>
        <div className="empty-placeholder">
          <span className="empty-icon">📐</span>
          <h3>No notes on this page yet</h3>
          <p>
            Type or paste your messy lecture notes in plain text on the left and click <strong>Generate Notes</strong>, 
            or click <strong>Load Example</strong> to test.
          </p>
          <button 
            className="btn-secondary" 
            style={{ marginTop: 14 }}
            onClick={onToggleEditMarkdown}
          >
            ✏️ Or Type Directly in Markdown
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`paper theme-${theme} font-${font} layout-${layout} ${isDrawingMode ? 'mode-drawing' : ''}`} 
      id="preview-paper"
      ref={paperRef}
    >
      {/* Quick button to toggle direct text editing */}
      <button 
        className="paper-edit-toggle-btn"
        onClick={onToggleEditMarkdown}
        title={isEditingMarkdown ? "Switch to Formatted Preview" : "Directly Edit Notes & Formulas"}
      >
        {isEditingMarkdown ? '👁️ Done (View Preview)' : '✏️ Edit Text'}
      </button>

      {isEditingMarkdown ? (
        <div className="markdown-editor-container">
          <div className="markdown-editor-hint">
            Directly editing notes & math equations (KaTeX syntax supported: $inline$, $$display$$):
          </div>
          <textarea
            className="direct-markdown-editor"
            value={markdown}
            onChange={(e) => onUpdateMarkdown(e.target.value)}
            placeholder="Type or edit notes in markdown with LaTeX math..."
            autoFocus
          />
        </div>
      ) : (
        <div className="content" id="inkwell-preview-content">
          <MemoizedMarkdown markdown={markdown} />
        </div>
      )}

      {/* Freeform Typing Layer (Type anywhere on canvas) */}
      {!isEditingMarkdown && (
        <TextBoxLayer
          textBoxes={textBoxes}
          onUpdateTextBoxes={onUpdateTextBoxes}
          isDrawingMode={isDrawingMode}
          isTextTool={tool === 'text'}
          activeColor={color}
          activeFontSize={activeFontSize}
          containerRef={paperRef}
        />
      )}

      {/* Interactive Drawing Layer (Pen / Highlighter / Eraser) */}
      {!isEditingMarkdown && (
        <DrawingCanvas
          ref={canvasRef}
          isDrawingMode={isDrawingMode && tool !== 'text'}
          tool={tool === 'text' ? 'pen' : tool}
          color={color}
          lineWidth={lineWidth}
          initialDataUrl={drawingDataUrl}
          onSaveDrawing={onSaveDrawing}
          containerRef={paperRef}
        />
      )}
    </div>
  )
}
