// Fetch all markdown files from the posts directory
// We use { eager: true } so they are bundled upfront for a static build
const postModules = import.meta.glob('../posts/*.md', { eager: true })

export interface Post {
    id: string;
    title: string;
    excerpt: string;
    date: string;
    category: string;
    image?: string;
}

export const getLocalPosts = (): Post[] => {
    const posts: Post[] = []

    for (const path in postModules) {
        // vite-plugin-markdown standard export when mode includes 'react' or 'html'
        // the frontmatter is injected into the exported "attributes" object
        const mod = postModules[path] as any
        const { attributes } = mod

        if (attributes && attributes.id && attributes.title) {
            posts.push({
                id: attributes.id,
                title: attributes.title,
                excerpt: attributes.excerpt || '',
                date: attributes.date || '',
                category: attributes.category || 'Uncategorized',
                image: attributes.image,
            })
        }
    }

    // Sort by date descending
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Function to get a specific raw module (to render the React component)
export const getPostComponent = (id: string) => {
    for (const path in postModules) {
        const mod = postModules[path] as any
        if (mod.attributes?.id === id) {
            // Because we requested mode "react" in vite.config.ts, 
            // vite-plugin-markdown provides the compiled ReactComponent.
            return mod.ReactComponent
        }
    }
    return null
}
