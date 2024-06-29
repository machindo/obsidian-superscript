import { WidgetType } from '@codemirror/view'
import { range } from 'remeda'

type PageHeadingParityWidgetOptions = {
  additionalPageCount: number
  direction: 'ltr' | 'rtl'
  pageNumber: number
  oddPageSide: 'left' | 'right'
}

const ceilEven = (n: number) => n % 2 ? n + 1 : n

const isBetween = (n: number, min: number, max: number) => n >= min && n <= max

const pagePath = ({ filled, offset, side }: { filled?: boolean, offset: number, side: 'left' | 'right' }) => `
  <path
    d="${side === 'left' ? 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' : 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'}"
    fill="${filled ? 'currentColor' : 'none'}"
    ${filled ? '' : 'stroke-dasharray="3"'} 
    transform="translate(${offset * 24} 0)"
  />
`

const pagePaths = ({ pageSpan, start }: { pageSpan: number, start: 'left' | 'right' }) => {
  const pagePathCount = ceilEven(pageSpan + (start === 'left' ? 0 : 1))
  const startIndex = start === 'left' ? 0 : 1
  const endIndex = pageSpan + startIndex - 1

  return range(0, pagePathCount).map(i =>
    pagePath({
      filled: isBetween(i, startIndex, endIndex),
      offset: Math.floor(i / 2),
      side: i % 2 === 0 ? 'left' : 'right',
    }),
  )
}

const pageIconSVG = ({ direction, pageSpan, start }: { direction: 'ltr' | 'rtl', pageSpan: number, start: 'left' | 'right' }) => {
  const directionalStart = direction === 'ltr' ? start : start === 'left' ? 'right' : 'left'
  const width = ceilEven(pageSpan + (directionalStart === 'left' ? 0 : 1)) / 2 * 24

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="24"
      viewBox="0 0 ${width} 24"
      stroke-width="2"
      stroke-linejoin="round"
      class="svg-icon svg-icon-${direction}"
    >
      ${pagePaths({ pageSpan, start: directionalStart }).join('')}
    </svg>`
}

const pageSide = (options: {
  pageNumber: number
  oddPageSide: 'left' | 'right'
}) =>
  options.pageNumber % 2 === 0
    ? options.oddPageSide === 'left' ? 'right' : 'left'
    : options.oddPageSide === 'left' ? 'left' : 'right'

export class PageHeadingParityWidget extends WidgetType {
  constructor(readonly options: PageHeadingParityWidgetOptions) {
    super()
  }

  toDOM() {
    const div = document.createElement('div')

    div.className = 'cm-superscript-page-heading-parity'
    div.innerHTML = pageIconSVG({
      direction: this.options.direction,
      pageSpan: this.options.additionalPageCount + 1,
      start: pageSide(this.options),
    })

    return div
  }
}
