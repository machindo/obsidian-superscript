import { MarkdownPostProcessor } from 'obsidian'
import { tokenNames } from '../config/tokens'
import { SuperscriptState } from '../styling/SuperscriptState'
import { getLineFormat } from '../styling/getLineFormat'

export const markdownPostProcessor: MarkdownPostProcessor = (el) => {
  const ctx = {
    afterEmptyLine: true,
    beforeEmptyLine: false,
    isLastLine: false,
  }

  let state: SuperscriptState = {
    inDialogue: false,
    inPage: false,
    pageHeadings: [],
    panelHeadings: [],
    characters: [],
  }

  if (!el.textContent) return

  const { state: nextState, matches, token } = getLineFormat(el.textContent, state, ctx)

  state = nextState

  if (!token || !matches) return

  switch (token) {
    case tokenNames.pageHeading: {
      el.empty()
      el.createEl('h2', { text: matches.groups?.pageDot ? matches[0].slice(0, -1) : matches[0], cls: 'reading-superscript-page-heading' })
      break
    }
    case tokenNames.panelHeading:
      el.empty()
      el.createEl('h3', { text: matches.groups?.panelDot ? matches[0].slice(0, -1) : matches[0], cls: 'reading-superscript-panel-heading' })
      break
    case tokenNames.character:
      el.empty()
      el.createEl('h4', { text: matches[0], cls: 'reading-superscript-character' })
      break
    case tokenNames.dialogue:
      el.empty()
      el.createEl('p', { text: matches[0], cls: 'reading-superscript-dialogue' })
      break
  }
}
