import { Decoration, EditorView } from '@codemirror/view'
import { A, D, F } from '@mobily/ts-belt'
import { clsx } from 'clsx/lite'
import { create } from 'mutative'
import { editorInfoField } from 'obsidian'
import { SuperscriptPluginSettings } from '../settings/SuperscriptPluginSettings'
import { PageHeadingParityWidget } from './PageHeadingParityWidget'
import { SuperscriptContext } from './SuperscriptContext'
import { SuperscriptState } from './SuperscriptState'
import { WordCountWidget } from './WordCountWidget'
import { getDirection } from './getDirection'
import { getOddPageSide } from './getOddPageSide'
import { isSuperscriptEnabled } from '../utils/isSuperscriptEnabled'
import { TokenName, lineTokens, pageHeadingToken, tokenNames } from '../config/tokens'

const mdPageHeadingLevelRegex = /^#{1,2} /

const pageHeadingLevelRegex = RegExp(`${mdPageHeadingLevelRegex.source}|${pageHeadingToken.regex.source}`, 'i')

const composeClass = (token: string) => `cm-formatting cm-superscript-formatting-${token}`

const countWords = (text: string) => {
  const words = text.match(/\S+/g)

  return words?.length ?? 0
}

const getLineFormat = (
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

type DecorationSpec = { from: number, to: number, decoration: Decoration }

export const computeDecorations = (view: EditorView, settings: SuperscriptPluginSettings): DecorationSpec[] => {
  if (!isSuperscriptEnabled(view.state.field(editorInfoField))) return []

  const decorations: DecorationSpec[] = []

  let state: SuperscriptState = {
    inDialogue: false,
    inPage: false,
    pageHeadings: [],
    panelHeadings: [],
    characters: [],
  }

  for (const { from, to } of view.visibleRanges) {
    const visibleText = view.state.sliceDoc(from, to)
    const maxLines = view.state.doc.lines

    for (let pos = from; pos <= to;) {
      const line = view.state.doc.lineAt(pos)
      const { from: lFrom, to: lTo, text: lText } = line
      const relFrom = lFrom - from
      const relTo = lTo - from
      const ctx = {
        afterEmptyLine: visibleText[relFrom - 2] === '\n',
        beforeEmptyLine: visibleText[relTo + 1] === '\n',
        isLastLine: line.number === maxLines,
      }
      const { matches, token, state: nextState } = getLineFormat(lText, state, ctx)

      state = nextState

      const isPageEnd = state.inPage && (lTo >= to || pageHeadingLevelRegex.test(view.state.doc.lineAt(lTo + 1).text))
      const isBeforePageStart = !state.inPage && lTo < to && pageHeadingToken.regex.test(view.state.doc.lineAt(lTo + 1).text)

      const decoration = token || state.inPage || isBeforePageStart
        ? Decoration.line({
          class: clsx(
            token && `cm-superscript-${token}`,
            token === 'page-heading' && 'cm-superscript-page-start',
            state.inPage && token !== 'page-heading' && 'cm-superscript-page-body',
            isPageEnd && 'cm-superscript-page-end',
            isBeforePageStart && 'cm-superscript-before-page-start',
          ),
        })
        : undefined

      decoration && decorations.push({ from: lFrom, to: lFrom, decoration })

      if (!token) {
        pos = lTo + 1
        continue
      }

      // Mark Decorations
      const firstChar = lText[0]
      const lastChar = lText[line.length - 1]

      switch (token) {
        case tokenNames.action:{
          if (firstChar === '!' && lText.substring(0, 3) !== '![[') {
            decorations.push({ from: lFrom, to: lFrom + 1, decoration: Decoration.mark({ class: composeClass(token) }) })
          }

          break
        }
        case tokenNames.character: {
          state = create(state, (draft) => {
            draft.characters.push({ from: lFrom, to: lTo, wordCount: 0 })
          })

          if (firstChar === '@') {
            decorations.push({ from: lFrom, to: lFrom + 1, decoration: Decoration.mark({ class: composeClass(token) }) })
          }

          if (lastChar === ')') {
            const charExt = lText.match(/(\(.*\))?$/g)

            if (charExt === null) {
              console.error('Character regex broken; char ext segment should exist')
              continue
            }

            const charExtLength = charExt[0].length
            const charExtStart = lTo - charExtLength

            decorations.push({ from: charExtStart, to: lTo, decoration: Decoration.mark({ class: 'cm-superscript-character-extension' }) })
          }
          break
        }
        case tokenNames.pageHeading: {
          state = create(state, (draft) => {
            draft.pageHeadings.push({ from: lFrom, to: lTo, wordCount: 0 })
          })

          if (!matches) break
          if (!settings.displayPageIcons) break

          const pageNumber = parseInt(matches[2])
          const additionalPageCount = matches[3] ? parseInt(matches[3]) - parseInt(matches[2]) : 0
          const oddPageSide = getOddPageSide(view.state.field(editorInfoField))
          const direction = getDirection(view.state.field(editorInfoField))
          const decoration = Decoration.widget({
            widget: new PageHeadingParityWidget({
              additionalPageCount,
              direction,
              oddPageSide,
              pageNumber,
            }),
          })

          decorations.push({ from: lTo, to: lTo, decoration })

          break
        }
        case tokenNames.panelHeading:
          state = create(state, (draft) => {
            draft.panelHeadings.push({ from: lFrom, to: lTo, wordCount: 0 })
          })

          break
      }

      pos = lTo + 1
    }
  }

  // TODO: continue word counting for each orphaned heading

  if (settings.displayWordCount) {
    for (const pageHeading of state.pageHeadings) {
      const decoration = Decoration.widget({ widget: new WordCountWidget(pageHeading.wordCount) })

      decorations.push({ from: pageHeading.to, to: pageHeading.to, decoration })
    }

    for (const panelHeading of state.panelHeadings) {
      const decoration = Decoration.widget({ widget: new WordCountWidget(panelHeading.wordCount) })

      decorations.push({ from: panelHeading.to, to: panelHeading.to, decoration })
    }

    for (const character of state.characters) {
      const decoration = Decoration.widget({ widget: new WordCountWidget(character.wordCount) })

      decorations.push({ from: character.to, to: character.to, decoration })
    }
  }

  return F.toMutable(A.sortBy(decorations, D.get('from')))
}
