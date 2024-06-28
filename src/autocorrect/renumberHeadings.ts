import { Editor, EditorChange, MarkdownFileInfo, MarkdownView } from 'obsidian'
import { pageHeadingToken, panelHeadingToken } from '../config/tokens'
import { isSuperscriptEnabled } from '../utils/isSuperscriptEnabled'

export const renumberHeadings = (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
  if (!editor) return
  if (!isSuperscriptEnabled(ctx)) return

  const changes: EditorChange[] = []
  const cursor = editor.getCursor()

  let pageNumber = 0
  let panelNumber = 0

  for (let line = 0; line < editor.lastLine(); line++) {
    const cursorOnCurrentLine = cursor.line === line
    const text = editor.getLine(line)
    const { pageKeyword, pageStart, pageEnd, pageDot } = pageHeadingToken.regex.exec(text)?.groups ?? {}
    const { panelKeyword, panelStart, panelEnd, panelDot } = panelHeadingToken.regex.exec(text)?.groups ?? {}

    if (pageStart) {
      const pageStartNumber = parseInt(pageStart)
      const pageEndNumber = parseInt(pageEnd ?? pageStart)
      const additionalPageCount = pageEndNumber - pageStartNumber
      const expectedPageNumber = pageDot ? pageStartNumber : (pageNumber + 1)

      if (!cursorOnCurrentLine && (pageStartNumber !== expectedPageNumber || (!additionalPageCount && text.includes('-')))) {
        changes.push({
          from: { line, ch: pageKeyword.length + 1 },
          to: { line, ch: text.length },
          text: additionalPageCount ? `${expectedPageNumber}-${expectedPageNumber + additionalPageCount}` : `${expectedPageNumber}`,
        })
      }

      pageNumber = cursorOnCurrentLine ? pageEndNumber : expectedPageNumber + additionalPageCount
      panelNumber = 0
    }
    else if (panelStart) {
      const panelStartNumber = parseInt(panelStart)
      const panelEndNumber = parseInt(panelEnd ?? panelStart)
      const additionalPanelCount = panelEndNumber - panelStartNumber
      const expectedPanelNumber = panelDot ? panelStartNumber : (panelNumber + 1)

      if (!cursorOnCurrentLine && (panelStartNumber !== expectedPanelNumber || (!additionalPanelCount && text.includes('-')))) {
        changes.push({
          from: { line, ch: panelKeyword.length + 1 },
          to: { line, ch: text.length },
          text: additionalPanelCount ? `${expectedPanelNumber}-${expectedPanelNumber + additionalPanelCount}` : `${expectedPanelNumber}`,
        })
      }

      panelNumber = cursorOnCurrentLine ? panelEndNumber : expectedPanelNumber + additionalPanelCount
    }
  }

  if (changes.length) editor.transaction({ changes })
}
