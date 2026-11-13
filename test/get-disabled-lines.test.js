import { describe, expect, it } from 'vitest'
import { getDisabledLines } from '../lib/get-disabled-lines.js'
import { unified } from 'unified'
import remarkParse from 'remark-parse'

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
