import { Decoration, EditorView } from '@codemirror/view'
import { clsx } from 'clsx/lite'
import { create } from 'mutative'
import { editorInfoField } from 'obsidian'
import { prop, sortBy } from 'remeda'
import { pageHeadingToken, tokenNames } from '../config/tokens'
import { SuperscriptPluginSettings } from '../settings/SuperscriptPluginSettings'
import { SuperscriptState } from '../styling/SuperscriptState'
import { getLineFormat } from '../styling/getLineFormat'
import { isSuperscriptEnabled } from '../utils/isSuperscriptEnabled'
import { PageHeadingParityWidget } from './PageHeadingParityWidget'
import { WordCountWidget } from './WordCountWidget'
import { getDirection } from './getDirection'
import { getOddPageSide } from './getOddPageSide'

const pageHeadingLevelRegex = RegExp(`^#{1,2} |${pageHeadingToken.regex.source}`, 'i')

const composeClass = (token: string) => `cm-formatting cm-superscript-formatting-${token}`

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

  return sortBy(decorations, prop('from'))
}
