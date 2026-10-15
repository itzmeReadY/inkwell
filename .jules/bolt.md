## 2024-05-24 - ReactMarkdown re-renders
**Learning:** ReactMarkdown re-renders completely if plugin arrays are defined inline. Markdown and LaTeX rendering is computationally expensive and causes lag when other state (like drawing tools) updates.
**Action:** Always define plugin arrays outside the component and wrap expensive renderers in React.memo.
