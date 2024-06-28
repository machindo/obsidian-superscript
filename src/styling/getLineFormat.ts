import { create } from 'mutative'
import { TokenName, lineTokens, tokenNames } from '../config/tokens'
import { SuperscriptContext } from './SuperscriptContext'
import { SuperscriptState } from './SuperscriptState'

const mdPageHeadingLevelRegex = /^#{1,2} /

const countWords = (text: string) => text.match(/\S+/g)?.length ?? 0

export const getLineFormat = (
  line: string,
  state: SuperscriptState,
  ctx: SuperscriptContext,
): {
  token?: TokenName
  matches?: RegExpExecArray
  state: SuperscriptState
} => {
  if (mdPageHeadingLevelRegex.test(line)) {
    state = create(state, (draft) => {
      draft.inPage = false
    })
  }

  if (line.trim() === '') {
    // at least two spaces to be considered
    // https://fountain.io/syntax#line-breaks
    return line.length < 2 ? { state: { ...state, inDialogue: false } } : { state }
  }

  for (const { id: token, regex: tRegex } of lineTokens) {
    const matches = tRegex.exec(line)

    if (matches) {
      if (token === tokenNames.character) {
        if (ctx.afterEmptyLine && !ctx.beforeEmptyLine && !ctx.isLastLine) {
          return { matches, token, state: { ...state, inDialogue: true } }
        }

        break
      }
      if (token === tokenNames.pageHeading) {
        return { matches, token, state: { ...state, inPage: true } }
      }

      return { matches, token, state }
    }
  }

  if (state.inDialogue) {
    return {
      token: tokenNames.dialogue,
      state: create(state, (draft) => {
        if (draft.characters.length > 0) {
          draft.characters[draft.characters.length - 1].wordCount += countWords(line)
        }

        if (draft.panelHeadings.length > 0) {
          draft.panelHeadings[draft.panelHeadings.length - 1].wordCount += countWords(line)
        }

        if (draft.pageHeadings.length > 0) {
          draft.pageHeadings[draft.pageHeadings.length - 1].wordCount += countWords(line)
        }
      }),
    }
  }

  return { token: tokenNames.action, state }
}
