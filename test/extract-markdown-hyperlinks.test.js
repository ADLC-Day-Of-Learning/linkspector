import { describe, expect, it } from 'vitest'
import { extractMarkdownHyperlinks } from '../lib/extract-markdown-hyperlinks.js'
import { getDisabledLines } from '../lib/get-disabled-lines.js'
import { updateLinkStatusObj } from '../lib/update-linkstatus-obj.js'
import { unified } from 'unified'
import remarkParse from 'remark-parse'

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

describe('getDisabledLines - nodes without position metadata', () => {
  it('should safely handle html nodes without position metadata', () => {
    const tree = unified()
      .use(remarkParse)
      .parse('<!-- linkspector-disable -->')
    // Manually delete position metadata to simulate AST node without position
    delete tree.children[0].position
    expect(() =>
      getDisabledLines(tree, '<!-- linkspector-disable -->')
    ).not.toThrow()
  })

  it('should return false from isDisabled when line is null or undefined', () => {
    const tree = unified().use(remarkParse).parse('Some text')
    const { isDisabled } = getDisabledLines(tree, 'Some text')
    expect(isDisabled(undefined)).toBe(false)
    expect(isDisabled(null)).toBe(false)
  })
})

describe('updateLinkStatusObj - nodes without position metadata', () => {
  it('should assign fallback position and line_number when position is missing', () => {
    const astNodes = [
      {
        type: 'link',
        title: null,
        url: 'https://example.com/image.jpg',
        children: [{ type: 'text', value: 'https://example.com/image.jpg' }],
      },
    ]
    const linkStatus = [
      {
        link: 'https://example.com/image.jpg',
        status: 'alive',
        status_code: 200,
        line_number: null,
        position: undefined,
        error_message: null,
      },
    ]

    const result = updateLinkStatusObj(astNodes, linkStatus)
    expect(result.length).toBe(1)
    expect(result[0].link).toBe('https://example.com/image.jpg')
    expect(result[0].line_number).toBe(1)
    expect(result[0].position).toEqual({
      start: { line: 1, column: 1 },
      end: { line: 1, column: 1 },
    })
  })

  it('should handle mailto links without position metadata', () => {
    const astNodes = [
      {
        type: 'link',
        title: null,
        url: 'mailto:info@example.com',
        children: [{ type: 'text', value: 'info@example.com' }],
      },
    ]
    const linkStatus = []

    const result = updateLinkStatusObj(astNodes, linkStatus)
    expect(result.length).toBe(1)
    expect(result[0].link).toBe('mailto:info@example.com')
    expect(result[0].status).toBe('skipped')
  })
})
