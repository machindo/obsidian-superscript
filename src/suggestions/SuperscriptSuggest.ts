import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo } from 'obsidian'
import { pageHeadingToken, panelHeadingToken } from '../config/tokens'
import { isSuperscriptEnabled } from '../utils/isSuperscriptEnabled'

type SuperscriptSuggestion = {
  description: string
  replacement: string
}

const findPreviousPageHeadingNumber = (editor: Editor, cursor: EditorPosition): number => {
  if (cursor.line === 0) return 0

  const line = editor.getLine(cursor.line)
  const matches = pageHeadingToken.regex.exec(line)
  const number = matches?.groups?.pageStart !== undefined ? parseInt(matches.groups.pageStart, 10) : undefined

  return number ?? findPreviousPageHeadingNumber(editor, { line: cursor.line - 1, ch: 0 })
}

const findPreviousPanelHeadingNumber = (editor: Editor, cursor: EditorPosition): number => {
  if (cursor.line === 0) return 0

  const line = editor.getLine(cursor.line)

  if (pageHeadingToken.regex.test(line)) return 0

  const matches = panelHeadingToken.regex.exec(line)
  const number = matches?.groups?.panelStart !== undefined ? parseInt(matches.groups.panelStart, 10) : undefined

  return number ?? findPreviousPanelHeadingNumber(editor, { line: cursor.line - 1, ch: 0 })
}

export class SuperscriptSuggest extends EditorSuggest<SuperscriptSuggestion> {
  constructor(public app: App) {
    super(app)
  }

  onTrigger(cursor: EditorPosition, editor: Editor): EditorSuggestTriggerInfo | null {
    if (!this.app.workspace.activeEditor || !isSuperscriptEnabled(this.app.workspace.activeEditor)) return null

    const line = editor.getLine(cursor.line)
    const matches = /^(?:pa?g?e? ?|pa?n?e?l? ?)$/i.exec(line)

    return matches
      ? {
        start: { ...cursor, ch: 0 },
        end: { ...cursor, ch: line.length },
        query: line,
      }
      : null
  }

  getSuggestions(context: EditorSuggestContext) {
    const { query } = context
    const suggestions: SuperscriptSuggestion[] = []

    if (/^pa?n?e?l? ?$/i.test(query)) {
      const previousPanelHeadingNumber = findPreviousPanelHeadingNumber(context.editor, context.start)

      suggestions.push({ description: 'Insert panel heading', replacement: `Panel ${previousPanelHeadingNumber + 1}` })
    }

    if (/^pa?g?e? ?$/i.test(query)) {
      const previousPageHeadingNumber = findPreviousPageHeadingNumber(context.editor, context.start)

      suggestions.push({ description: 'Insert page heading', replacement: `Page ${previousPageHeadingNumber + 1}` })
    }

    return suggestions
  }

  renderSuggestion(value: SuperscriptSuggestion, el: HTMLElement): void {
    el.createSpan({ text: value.description })
  }

  selectSuggestion(value: SuperscriptSuggestion): void {
    this.context?.editor.replaceRange(value.replacement, this.context.start, this.context.end)
  }
}
