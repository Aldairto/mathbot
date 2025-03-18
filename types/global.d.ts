interface Window {
    katex: {
        render: (formula: string,
        element: Element, options?: {
        displayMode?: boolean }) =>
        void
    }
}