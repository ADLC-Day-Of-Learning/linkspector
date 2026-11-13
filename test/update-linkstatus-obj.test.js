import { describe, expect, it } from 'vitest'
import { updateLinkStatusObj } from '../lib/update-linkstatus-obj.js'

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
