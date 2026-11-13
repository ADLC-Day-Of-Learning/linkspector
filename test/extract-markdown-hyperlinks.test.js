import { describe, expect, it } from 'vitest'
import { extractMarkdownHyperlinks } from '../lib/extract-markdown-hyperlinks.js'

describe('extractMarkdownHyperlinks - nodes without position metadata', () => {
  it('should not throw when extracting links from bracketed references or JSON array links', () => {
    const markdownWithBracketedLink =
      'Instances of abusive behavior may be reported to [info@example.org].'
    expect(() =>
      extractMarkdownHyperlinks(markdownWithBracketedLink, {})
    ).not.toThrow()

    const { links: bracketedLinks } = extractMarkdownHyperlinks(
      markdownWithBracketedLink,
      {}
    )
    expect(bracketedLinks.length).toBe(1)
    expect(bracketedLinks[0].url).toBe('mailto:info@example.org')

    const jsonSnippet =
      '{\n  "images": [\n    "https://example.com/image.jpg"\n  ]\n}'
    expect(() => extractMarkdownHyperlinks(jsonSnippet, {})).not.toThrow()

    const { links: jsonLinks } = extractMarkdownHyperlinks(jsonSnippet, {})
    expect(jsonLinks.length).toBe(1)
    expect(jsonLinks[0].url).toBe('https://example.com/image.jpg')
  })

  it('should handle standard markdown links with position metadata correctly', () => {
    const markdown = '[Example](https://example.com)'
    const { links } = extractMarkdownHyperlinks(markdown, {})
    expect(links.length).toBe(1)
    expect(links[0].url).toBe('https://example.com')
    expect(links[0].position).toBeDefined()
    expect(links[0].position.start.line).toBe(1)
  })
})
