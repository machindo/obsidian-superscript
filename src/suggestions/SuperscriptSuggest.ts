import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo } from 'obsidian'

type SuperscriptSuggestion = {
  description: string
  replacement: string
}

export class SuperscriptSuggest extends EditorSuggest<SuperscriptSuggestion> {
  onTrigger(cursor: EditorPosition, editor: Editor): EditorSuggestTriggerInfo | null {
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

  renderSuggestion(value: SuperscriptSuggestion, el: HTMLElement): void {
    el.createSpan({ text: value.description })
  }

  selectSuggestion(value: SuperscriptSuggestion): void {
    if (!this.context) return

    this.context.editor.replaceRange(value.replacement, this.context.start, this.context.end)

    this.close()
  }

  constructor(public app: App) {
    super(app)
  }

  getSuggestions(context: EditorSuggestContext) {
    const { query } = context
    const suggestions: SuperscriptSuggestion[] = []

    if (/^pa?n?e?l? ?$/i.test(query)) {
      suggestions.push({ description: 'Insert panel heading', replacement: 'Panel 0' })
    }

    if (/^pa?g?e? ?$/i.test(query)) {
      suggestions.push({ description: 'Insert page heading', replacement: 'Page 0' })
    }

    return suggestions
  }
}
