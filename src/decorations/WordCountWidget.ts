import { WidgetType } from '@codemirror/view'

export class WordCountWidget extends WidgetType {
  constructor(readonly wordCount: number) {
    super()
    this.wordCount = wordCount
  }

  toDOM() {
    const div = document.createElement('div')
    div.className = 'cm-superscript-word-count'
    div.innerHTML = `<span>${this.wordCount}w</span>`

    return div
  }
}
