import { WidgetType } from '@codemirror/view'

export class ShortcutTipWidget extends WidgetType {
  constructor(readonly shortcut: 'page' | 'panel') {
    super()
  }

  toDOM() {
    const span = document.createElement('span')
    span.className = 'cm-superscript-shortcut-tip'
    span.innerHTML = `<span>Press ENTER to insert a new ${this.shortcut === 'page' ? 'page' : 'panel'}</span>`

    return span
  }
}
