export interface WikiLink {
  target_path: string
  link_text: string | null
}

/**
 * Extract wikilinks from markdown content.
 * Matches [[target]] and [[target|display text]].
 * Skips content inside fenced code blocks and inline code.
 */
export function parseWikilinks(content: string): WikiLink[] {
  const links: WikiLink[] = []

  // Remove fenced code blocks (``` ... ```)
  const withoutFenced = content.replace(/```[\s\S]*?```/g, '')

  // Remove inline code (` ... `)
  const withoutCode = withoutFenced.replace(/`[^`]+`/g, '')

  // Match [[target]] or [[target|display text]]
  const regex = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(withoutCode)) !== null) {
    const target = match[1].trim()
    const display = match[2]?.trim() ?? null

    if (target) {
      links.push({
        target_path: target,
        link_text: display,
      })
    }
  }

  return links
}
