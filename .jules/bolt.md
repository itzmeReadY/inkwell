## 2025-02-18 - Heavy Markdown Re-rendering

**Learning:** Re-rendering `ReactMarkdown` with remark/rehype plugins (like Katex) on every parent component state change (e.g., drawing interactions, tool switching) creates significant lag because parsing and rendering complex Markdown/LaTeX ASTs is computationally expensive.

**Action:** Always wrap heavy, static text/markdown renderers in `React.memo` when they live alongside highly interactive components (like canvas drawing layers) to prevent unnecessary re-computations when only non-related props or states change.
