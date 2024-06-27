import { Editor, MarkdownFileInfo, MarkdownView } from 'obsidian'
import { pageHeadingToken, panelHeadingToken } from './tokens'
import { isSuperscriptEnabled } from './isSuperscriptEnabled'

export const autonumberHeadings = (editor: Editor, info: MarkdownFileInfo | MarkdownView) => {
  if (!isSuperscriptEnabled(info)) return

  let pageNumber = 0
  let panelNumber = 0

  for (let line = 0; line < editor.lastLine(); line++) {
    const cursorOnCurrentLine = editor.getCursor().line === line
    const text = editor.getLine(line)
    const { pageKeyword, pageStart, pageEnd, pageDot } = pageHeadingToken.regex.exec(text)?.groups ?? {}
    const { panelKeyword, panelStart, panelEnd, panelDot } = panelHeadingToken.regex.exec(text)?.groups ?? {}

    if (pageStart) {
      const pageStartNumber = parseInt(pageStart)
      const pageEndNumber = parseInt(pageEnd ?? pageStart)
      const additionalPageCount = pageEndNumber - pageStartNumber
      const expectedPageNumber = pageDot ? pageStartNumber : (pageNumber + 1)

      if (!cursorOnCurrentLine && (pageStartNumber !== expectedPageNumber || (!additionalPageCount && text.includes('-')))) {
        editor.replaceRange(
          additionalPageCount ? `${expectedPageNumber}-${expectedPageNumber + additionalPageCount}` : `${expectedPageNumber}`,
          { line, ch: pageKeyword.length + 1 },
          { line, ch: text.length },
        )
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
        editor.replaceRange(
          additionalPanelCount ? `${expectedPanelNumber}-${expectedPanelNumber + additionalPanelCount}` : `${expectedPanelNumber}`,
          { line, ch: panelKeyword.length + 1 },
          { line, ch: text.length },
        )
      }

      panelNumber = cursorOnCurrentLine ? panelEndNumber : expectedPanelNumber + additionalPanelCount
    }
  }
}
