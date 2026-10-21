## 2026-10-18 - Expensive React Components
**Learning:** Rendering markdown with LaTeX (via react-markdown, remark-math, rehype-katex) is computationally expensive. When inline plugins are used, array identity changes on every render break React's internal optimizations, causing UI/typing lag during frequent state updates like drawing.
**Action:** Always isolate heavy markdown/LaTeX renderers in a `React.memo()` component and define their plugin arrays (e.g., remarkPlugins, rehypePlugins) outside the component to prevent unnecessary re-renders.
