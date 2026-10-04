import { useState, useRef } from 'react'

import 'katex/dist/katex.min.css'
import Preview from './Preview'
import DrawingToolbar from './DrawingToolbar'
import type { ToolType } from './DrawingToolbar'
import type { DrawingCanvasHandle } from './DrawingCanvas'
import type { FreeformTextBox } from './TextBoxLayer'
import './index.css'

export type ThemeType = 'grid' | 'dark' | 'dark-clean' | 'dotgrid' | 'clean'
export type FontType = 'architect' | 'kalam' | 'caveat' | 'shadows' | 'reenie' | 'gochi'
export type LayoutType = 'single' | 'two-column' | 'cornell'

export interface NotePage {
  id: string
  title: string
  inputText: string
  markdown: string
  drawingDataUrl?: string
  textBoxes?: FreeformTextBox[]
}

function App() {
  // Multi-page state
  const [pages, setPages] = useState<NotePage[]>([
    {
      id: 'page-1',
      title: 'Page 1',
      inputText: '',
      markdown: '',
      textBoxes: []
    }
  ])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  // Appearance state
  const [theme, setTheme] = useState<ThemeType>('grid')
  const [font, setFont] = useState<FontType>('architect')
  const [layout, setLayout] = useState<LayoutType>('single')

  // Direct editing state for generated notes
  const [isEditingMarkdown, setIsEditingMarkdown] = useState(false)

  // Drawing & Text Annotation state
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [drawTool, setDrawTool] = useState<ToolType>('pen')
  const [drawColor, setDrawColor] = useState('#1e3a8a')
  const [drawLineWidth, setDrawLineWidth] = useState(3)
  const canvasRef = useRef<DrawingCanvasHandle | null>(null)

  // Generation & Export state
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [stats, setStats] = useState({ total: 0, preserved: 0 })
  const [error, setError] = useState<string | null>(null)

  const currentPage = pages[currentPageIndex] || pages[0]

  // Update current page's fields
  const updateCurrentPage = (updates: Partial<NotePage>) => {
    setPages((prevPages) => {
      const next = [...prevPages]
      next[currentPageIndex] = { ...next[currentPageIndex], ...updates }
      return next
    })
  }

  // Handle adding a new page
  const handleAddPage = () => {
    const newPageNumber = pages.length + 1
    const newPage: NotePage = {
      id: `page-${Date.now()}`,
      title: `Page ${newPageNumber}`,
      inputText: '',
      markdown: '',
      textBoxes: []
    }
    setPages((prev) => [...prev, newPage])
    setCurrentPageIndex(pages.length)
  }

  // Handle deleting the current page
  const handleDeletePage = () => {
    if (pages.length <= 1) return
    const nextPages = pages.filter((_, idx) => idx !== currentPageIndex)
    setPages(nextPages)
    setCurrentPageIndex((prev) => Math.max(0, prev - 1))
  }

  // Generate clean notes via Gemma AI
  const handleGenerate = async () => {
    if (!currentPage.inputText.trim()) return
    setIsGenerating(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:8000/api/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: currentPage.inputText,
          layout: layout
        }),
      })
      
      if (!response.ok) {
        const errData = await response.json().catch(() => null)
        throw new Error(errData?.detail || 'Failed to clean notes with Gemma AI')
      }
      
      const data = await response.json()
      updateCurrentPage({ markdown: data.markdown })
      setStats({
        total: data.equations_total,
        preserved: data.equations_preserved
      })
      setIsEditingMarkdown(false) // Show formatted result
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  // Load sample plain text (no markdown, no latex)
  const loadExample = () => {
    const rawSample = `eigenvalues and eigenvectors
linear transformation Av = lambda v where lambda is eigenvalue, v is non zero eigenvector
to find lambda solve characteristic equation det(A - lambda I) = 0
example 2x2 matrix with row 1: 2, 1 and row 2: 1, 2
find eigenvalues: det is (2 - lambda)^2 - 1 = lambda^2 - 4lambda + 3 = 0
factor it: (lambda - 3)(lambda - 1) = 0 so lambda1 = 3 and lambda2 = 1
since A is symmetric eigenvectors are guaranteed to be orthogonal
formula for roots: x = (-b +- sqrt(b^2 - 4ac)) / (2a)
key takeaway: matrix powers can be computed easily via A^k = P * D^k * P^-1`
    
    updateCurrentPage({ inputText: rawSample })
  }

  // Save drawing strokes to current page
  const handleSaveDrawing = (dataUrl: string) => {
    updateCurrentPage({ drawingDataUrl: dataUrl })
  }

  // Update freeform text boxes on current page
  const handleUpdateTextBoxes = (boxes: FreeformTextBox[]) => {
    updateCurrentPage({ textBoxes: boxes })
  }

  // Highest-Quality Server-Side PDF Export (Vector-based, no Chrome dependency)
  const exportPDF = async () => {
    setIsExporting(true)
    setError(null)

    // Synchronize latest active drawing from canvas before compiling
    if (canvasRef.current) {
      const liveData = canvasRef.current.getCanvasDataUrl()
      if (liveData) {
        updateCurrentPage({ drawingDataUrl: liveData })
      }
    }

    try {
      // Grab the already-rendered HTML directly from the preview DOM
      // This guarantees the PDF looks EXACTLY like the preview
      const previewContent = document.getElementById('inkwell-preview-content')
      const renderedHtml = previewContent ? previewContent.innerHTML : ''

      // Build request payload for backend
      const payload = {
        theme,
        font,
        layout,
        filename: pages.length > 1
          ? `inkwell-notes-${pages.length}-pages-${theme}-${layout}.pdf`
          : `inkwell-notes-${theme}-${layout}.pdf`,
        pages: pages.map((page, index) => ({
          html: index === currentPageIndex ? renderedHtml : page.markdown,
          markdown: index === currentPageIndex ? undefined : page.markdown,
          drawings: page.drawingDataUrl ? [page.drawingDataUrl] : undefined,
          textBoxes: page.textBoxes
        }))
      };

      const response = await fetch('http://localhost:8000/api/compile-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errMessage = 'PDF compilation failed on server';
        try {
          const errData = await response.json();
          errMessage = errData.detail || errMessage;
        } catch {
           // ignore JSON parse error for error responses
        }
        throw new Error(errMessage);
      }

      // Download the returned PDF blob
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = payload.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(`PDF Export Error: ${err.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  // Native Vector Print-to-PDF (100% vector text and math)
  const handleVectorPrint = () => {
    window.print()
  }

  const isDark = theme.startsWith('dark')

  return (
    <div className="app-container">
      <header className="header glass">
        <div className="brand">
          <h1>🖋️ Inkwell</h1>
          <span className="brand-tag">Vector PDF & Pen</span>
        </div>

        <div className="controls">
          {stats.total > 0 && (
            <span className={`badge ${stats.preserved === stats.total ? 'success' : 'warning'}`}>
              {stats.preserved} Math Formulas
            </span>
          )}

          {/* Page Navigator */}
          <div className="page-navigation-bar">
            <button
              className="page-btn"
              onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0}
              title="Previous Page"
            >
              ◀
            </button>
            <span className="page-indicator">
              Page {currentPageIndex + 1} of {pages.length}
            </span>
            <button
              className="page-btn"
              onClick={() => setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1))}
              disabled={currentPageIndex === pages.length - 1}
              title="Next Page"
            >
              ▶
            </button>
            <button
              className="add-page-btn"
              onClick={handleAddPage}
              title="Add a new blank page to your notes"
            >
              + Page
            </button>
            {pages.length > 1 && (
              <button
                className="delete-page-btn"
                onClick={handleDeletePage}
                title="Delete this page"
              >
                🗑️
              </button>
            )}
          </div>

          {/* Theme Selector */}
          <div className="control-group">
            <label className="control-label" htmlFor="theme-select">Paper:</label>
            <select
              id="theme-select"
              className="select-input"
              value={theme}
              onChange={(e) => {
                const newTheme = e.target.value as ThemeType
                setTheme(newTheme)
                if (newTheme.startsWith('dark')) {
                  setDrawColor('#38bdf8')
                } else {
                  setDrawColor('#1e3a8a')
                }
              }}
            >
              <option value="grid">📐 Minimal Grid</option>
              <option value="dark">🌙 Dark Slate Grid</option>
              <option value="dark-clean">🖤 Dark Minimal</option>
              <option value="dotgrid">⠇ Dot Matrix</option>
              <option value="clean">📄 Clean White</option>
            </select>
          </div>

          {/* Font Selector */}
          <div className="control-group">
            <label className="control-label" htmlFor="font-select">Handwriting:</label>
            <select
              id="font-select"
              className="select-input"
              value={font}
              onChange={(e) => setFont(e.target.value as FontType)}
            >
              <option value="architect">✍️ Architects Daughter</option>
              <option value="kalam">🖋️ Kalam (Ballpoint Gel)</option>
              <option value="caveat">📝 Caveat (Fountain Pen)</option>
              <option value="shadows">🖊️ Shadows Into Light</option>
              <option value="reenie">⚡ Reenie Beanie (Scribble)</option>
              <option value="gochi">✏️ Gochi Hand (Marker)</option>
            </select>
          </div>

          {/* Layout Selector */}
          <div className="control-group">
            <label className="control-label" htmlFor="layout-select">Layout:</label>
            <select
              id="layout-select"
              className="select-input"
              value={layout}
              onChange={(e) => setLayout(e.target.value as LayoutType)}
            >
              <option value="single">📄 1 Column</option>
              <option value="two-column">📰 2 Columns (Cheat Sheet)</option>
              <option value="cornell">📑 Cornell Notes</option>
            </select>
          </div>

          {/* Drawing & Annotation Mode Toggle Button in Navbar */}
          <button
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={`btn-secondary draw-toggle-btn ${isDrawingMode ? 'active' : ''}`}
            title="Toggle Drawing, Highlighting & Freeform Text annotations"
          >
            {isDrawingMode ? '✏️ Annotating (Active)' : '✏️ Annotate'}
          </button>

          <button onClick={loadExample} className="btn-secondary" title="Load sample raw text notes">
            Load Example
          </button>

          <button 
            onClick={handleGenerate} 
            disabled={isGenerating || !currentPage.inputText.trim()} 
            className="btn-primary"
          >
            {isGenerating ? (
              <>
                <span className="spinner"></span> Gemma AI Formatting...
              </>
            ) : (
              'Generate Notes'
            )}
          </button>

          {/* High-Resolution 300 DPI Export */}
          <button 
            onClick={exportPDF} 
            disabled={isExporting || (!currentPage.markdown && pages.every(p => !p.markdown))} 
            className="btn-export"
            title="Compile ultra-high quality 300 DPI PDF (lossless PNG, paper background, math & highlights)"
          >
            {isExporting ? (
              <>
                <span className="spinner"></span> Compiling PDF...
              </>
            ) : (
              pages.length > 1 ? `📥 Download PDF (${pages.length}P)` : '📥 Download PDF'
            )}
          </button>

          {/* Native Vector Print to PDF */}
          <button
            onClick={handleVectorPrint}
            className="btn-secondary"
            title="Print or Save as Vector PDF using browser's native vector print engine"
          >
            🖨️ Vector Print
          </button>
        </div>
      </header>

      <main className="split-pane">
        <div className="pane left-pane">
          <div className="editor-wrapper">
            <div className="editor-header">
              <span>{currentPage.title}: Plain Text Input (No LaTeX needed)</span>
              <span>Gemma AI Powered</span>
            </div>
            <textarea 
              className="editor"
              value={currentPage.inputText}
              onChange={(e) => updateCurrentPage({ inputText: e.target.value })}
              placeholder="Paste or type messy lecture notes in plain text here. Gemma AI will format headings and convert all equations, formulas, and matrices to LaTeX!"
            />
          </div>
        </div>
        
        <div className="pane right-pane">
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError(null)} title="Dismiss">✕</button>
            </div>
          )}

          {/* Header over preview allowing toggle between Formatted Preview and Direct Markdown Editor */}
          <div className="preview-pane-header">
            <span className="pane-title">{currentPage.title}: Notes Preview & Annotations</span>
            <div className="view-mode-tabs">
              <button
                className={`mode-tab-btn ${!isEditingMarkdown ? 'active' : ''}`}
                onClick={() => setIsEditingMarkdown(false)}
                title="View formatted notes with math formulas and drawings"
              >
                👁️ Formatted View
              </button>
              <button
                className={`mode-tab-btn ${isEditingMarkdown ? 'active' : ''}`}
                onClick={() => setIsEditingMarkdown(true)}
                title="Directly edit the generated markdown and LaTeX equations"
              >
                ✏️ Edit Generated Text
              </button>
            </div>
          </div>

          <div className="preview-container">
            <Preview 
              markdown={currentPage.markdown} 
              theme={theme} 
              font={font} 
              layout={layout}
              isDrawingMode={isDrawingMode}
              tool={drawTool}
              color={drawColor}
              lineWidth={drawLineWidth}
              drawingDataUrl={currentPage.drawingDataUrl}
              onSaveDrawing={handleSaveDrawing}
              canvasRef={canvasRef}
              textBoxes={currentPage.textBoxes || []}
              onUpdateTextBoxes={handleUpdateTextBoxes}
              isEditingMarkdown={isEditingMarkdown}
              onUpdateMarkdown={(md) => updateCurrentPage({ markdown: md })}
              onToggleEditMarkdown={() => setIsEditingMarkdown(!isEditingMarkdown)}
            />

            {/* Floating Ultra-Modern Annotation Palette anchored cleanly over preview */}
            {isDrawingMode && !isEditingMarkdown && (
              <DrawingToolbar
                tool={drawTool}
                onSelectTool={setDrawTool}
                color={drawColor}
                onSelectColor={setDrawColor}
                lineWidth={drawLineWidth}
                onSelectLineWidth={setDrawLineWidth}
                onUndo={() => canvasRef.current?.undo()}
                onClear={() => {
                  canvasRef.current?.clear()
                  updateCurrentPage({ textBoxes: [] })
                }}
                onClose={() => setIsDrawingMode(false)}
                isDarkTheme={isDark}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
