declare module '*.md' {
    import React from 'react'

    // When "Mode.HTML" is requested
    const html: string

    // When "Mode.TOC" is requested
    const toc: { level: string, content: string }[]

    // When "Mode.REACT" is requested
    const ReactComponent: React.ComponentType

    // When "Mode.REACT" is requested, frontmatter is also available
    const attributes: Record<string, any>

    export { html, toc, attributes, ReactComponent }
}
