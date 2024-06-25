import { Editor, MarkdownFileInfo, MarkdownView } from "obsidian";
import { pageHeadingToken, panelHeadingToken } from "./tokens";
import { isSuperscriptEnabled } from "./isSuperscriptEnabled";

export const autonumberHeadings = (editor: Editor, info: MarkdownFileInfo | MarkdownView) => {
  if (!isSuperscriptEnabled(info)) return;

  let pageNumber = 0;
  let panelNumber = 0;

  for (let line = 0; line < editor.lastLine(); line++) {
    const text = editor.getLine(line);
    const pageHeadingMatches = pageHeadingToken.regex.exec(text)
    const panelHeadingMatches = panelHeadingToken.regex.exec(text)

    if (pageHeadingMatches) {
      pageNumber++;
      panelNumber = 0;

      const matchingPageNumber = pageHeadingMatches[2];

      if (parseInt(matchingPageNumber) !== pageNumber) {
        editor.replaceRange(pageNumber.toString(10), { line, ch: pageHeadingMatches[1].length + 1 }, { line, ch: text.length })
      }
    } else if (panelHeadingMatches) {
      panelNumber++;

      const matchingPanelNumber = panelHeadingMatches[2];

      if (parseInt(matchingPanelNumber) !== panelNumber) {
        editor.replaceRange(panelNumber.toString(10), { line, ch: panelHeadingMatches[1].length + 1 }, { line, ch: text.length })
      }
    }
  }
}
