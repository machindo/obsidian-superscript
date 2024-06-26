import { Editor, MarkdownFileInfo, MarkdownView } from 'obsidian'
import { pageHeadingToken, panelHeadingToken } from './tokens'
import { isSuperscriptEnabled } from './isSuperscriptEnabled'

export const autonumberHeadings = (editor: Editor, info: MarkdownFileInfo | MarkdownView) => {
  if (!isSuperscriptEnabled(info)) return

  let pageNumber = 0
  let panelNumber = 0

  for (let line = 0; line < editor.lastLine(); line++) {
    const text = editor.getLine(line)
    const pageHeadingMatches = pageHeadingToken.regex.exec(text)
    const panelHeadingMatches = panelHeadingToken.regex.exec(text)

    if (pageHeadingMatches) {
      pageNumber++
      panelNumber = 0

      const matchingPageNumberStart = parseInt(pageHeadingMatches[2])
      const matchingPageNumberEnd = parseInt(pageHeadingMatches[3] ?? pageHeadingMatches[2])
      const additionalPageCount = matchingPageNumberEnd - matchingPageNumberStart

      if (matchingPageNumberStart !== pageNumber) {
        editor.replaceRange(
          additionalPageCount ? `${pageNumber}-${pageNumber + additionalPageCount}` : `${pageNumber}`,
          { line, ch: pageHeadingMatches[1].length + 1 },
          { line, ch: text.length },
        )
      }

      if (additionalPageCount) {
        pageNumber += additionalPageCount
      }
    }
    else if (panelHeadingMatches) {
      panelNumber++

      const matchingPanelNumberStart = parseInt(panelHeadingMatches[2])
      const matchingPanelNumberEnd = parseInt(panelHeadingMatches[3] ?? panelHeadingMatches[2])
      const additionalPanelCount = matchingPanelNumberEnd - matchingPanelNumberStart

      if (matchingPanelNumberStart !== panelNumber) {
        editor.replaceRange(
          additionalPanelCount ? `${panelNumber}-${panelNumber + additionalPanelCount}` : `${panelNumber}`,
          { line, ch: panelHeadingMatches[1].length + 1 },
          { line, ch: text.length },
        )
      }

      if (additionalPanelCount) {
        panelNumber += additionalPanelCount
      }
    }
  }
}
