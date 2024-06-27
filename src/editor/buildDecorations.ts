import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, DecorationSet, EditorView } from '@codemirror/view'
import { A, D } from '@mobily/ts-belt'
import { clsx } from 'clsx/lite'
import { create } from 'mutative'
import { editorInfoField } from 'obsidian'
import { PageHeadingParityWidget } from './PageHeadingParityWidget'
import { SuperscriptContext } from './SuperscriptContext'
import { SuperscriptState } from './SuperscriptState'
import { WordCountWidget } from './WordCountWidget'
import { getDirection } from './getDirection'
import { getOddPageSide } from './getOddPageSide'
import { isSuperscriptEnabled } from './isSuperscriptEnabled'
import { TokenName, lineTokens, pageHeadingToken, tokenNames } from './tokens'

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
        else {
          break
        }
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

export const buildDecorations = (view: EditorView): DecorationSet => {
  const builder = new RangeSetBuilder<Decoration>()
  const info = view.state.field(editorInfoField)
  const decorations: { from: number, to: number, decoration: Decoration }[] = []

  if (!isSuperscriptEnabled(info)) return builder.finish()

  const markDeco = (start: number, end: number, className: string) => {
    const decoration = Decoration.mark({ class: className })

    decorations.push({ from: start, to: end, decoration })
  }

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

      const decoration = Decoration.line({
        class: clsx(
          token && `cm-superscript-${token}`,
          token === 'page-heading' && 'cm-superscript-page-start',
          state.inPage && token !== 'page-heading' && 'cm-superscript-page-body',
          isPageEnd && 'cm-superscript-page-end',
          isBeforePageStart && 'cm-superscript-before-page-start',
        ),
      })

      decorations.push({ from: lFrom, to: lFrom, decoration })

      if (!token) {
        pos = lTo + 1
        continue
      }

      // Mark Decorations
      const firstChar = lText[0]
      const lastChar = lText[line.length - 1]

      switch (token) {
        case tokenNames.action:
          if (firstChar === '!' && lText.substring(0, 3) !== '![[') {
            markDeco(lFrom, lFrom + 1, composeClass(token))
          }
          break
        case tokenNames.character: {
          state = create(state, (draft) => {
            draft.characters.push({ from: lFrom, to: lTo, wordCount: 0 })
          })

          if (firstChar === '@') {
            markDeco(lFrom, lFrom + 1, composeClass(token))
          }

          if (lastChar === ')') {
            const charExt = lText.match(/(\(.*\))?$/g)

            if (charExt === null) {
              console.error('Character regex broken; char ext segment should exist')
              continue
            }

            const charExtLength = charExt[0].length
            const charExtStart = lTo - charExtLength

            markDeco(charExtStart, lTo, 'cm-superscript-character-extension')
          }
          break
        }
        case tokenNames.pageHeading: {
          state = create(state, (draft) => {
            draft.pageHeadings.push({ from: lFrom, to: lTo, wordCount: 0 })
            draft.inPage = true
          })

          if (!matches) break

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

  const sortedDecorations = A.sortBy(decorations, D.get('from'))

  for (const { from, to, decoration } of sortedDecorations) {
    builder.add(from, to, decoration)
  }

  return builder.finish()
}
