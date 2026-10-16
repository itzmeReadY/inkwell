1. **Refactor `frontend/src/Preview.tsx`:**
   - Extract `ReactMarkdown` into a new `MemoizedMarkdown` component wrapped with `React.memo`.
   - Extract `remarkPlugins={[remarkMath]}` and `rehypePlugins={[rehypeKatex]}` outside the component to preserve array reference equality across renders.
   - This prevents the expensive Markdown/KaTeX rendering from executing on every keystroke when users type in the drawing/textbox layer (which shares the same `Preview` component and causes it to re-render).
2. **Journal the learning in `.jules/bolt.md`:**
   - Document the architectural bottleneck (mixing computationally expensive KaTeX rendering with high-frequency state updates like typing) and how memoization and referential stability of plugin arrays solved it.
3. **Complete pre-commit steps:**
   - Run verification scripts (`npm run lint`, `npm run build` in the frontend).
   - Ensure proper testing, verification, review, and reflection are done.
4. **Submit PR:**
   - Create a PR with the title format `⚡ Bolt: [performance improvement]`.
