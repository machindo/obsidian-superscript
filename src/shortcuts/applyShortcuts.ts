import SuperscriptPlugin from '../main'

export const applyShortcuts = (plugin: SuperscriptPlugin) => (event: KeyboardEvent) => {
  const editor = plugin.app.workspace.activeEditor?.editor

  if (!editor) return

  if (event.key === 'Enter') {
    const cursor = editor.getCursor()

    if (cursor.ch !== 0) return

    const line = editor.getLine(cursor.line - 1)

    if (line.toLowerCase() === 'pp') {
      event.preventDefault()
      editor.replaceRange('PAGE 0', { line: cursor.line - 1, ch: 0 }, { line: cursor.line - 1, ch: 2 })
      editor.setCursor({ line: cursor.line - 1, ch: 6 })
      return
    }

    if (line.toLowerCase() === 'p') {
      event.preventDefault()
      editor.replaceRange('Panel 0', { line: cursor.line - 1, ch: 0 }, { line: cursor.line - 1, ch: 1 })
      editor.setCursor({ line: cursor.line - 1, ch: 7 })
    }
  }
}
