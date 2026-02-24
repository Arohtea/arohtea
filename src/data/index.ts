import resumeData from './resume.json'

import { getLocalPosts, type Post } from './posts'

export type { Post }

// Dynamically fetch and export the parsed local markdown posts
export const mockPosts: Post[] = getLocalPosts()

// Expose parsed JSON from cc.json (resume)
export const profile = {
    name: resumeData.basics.name,
    headline: resumeData.basics.headline,
    email: resumeData.basics.email,
    phone: resumeData.basics.phone,
    location: resumeData.basics.location,
    summary: resumeData.summary.content,
    picture: resumeData.picture.url
}

export const socialLinks = resumeData.sections.profiles.items.map(item => ({
    network: item.network,
    username: item.username,
    url: item.website.url
}))

export const projects = resumeData.sections.projects.items.map(proj => ({
    id: proj.id,
    name: proj.name,
    description: proj.description,
    url: proj.website?.url || ""
}))

export const experience = resumeData.sections.experience.items

export const education = resumeData.sections.education.items

export const skills = resumeData.sections.skills.items
