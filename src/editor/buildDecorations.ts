import { RangeSetBuilder } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { editorInfoField } from "obsidian";
import { PageHeadingParityWidget } from "./PageHeadingParityWidget";
import { SuperscriptContext } from "./SuperscriptContext";
import { SuperscriptState } from "./SuperscriptState";
import { isSuperscriptEnabled } from "./isSuperscriptEnabled";
import { TokenName, lineTokens, tokenNames } from "./tokens";

const composeClass = (token: string) => `cm-formatting cm-superscript-formatting-${token}`;

const getLineFormat = (
  line: string,
  state: SuperscriptState,
  ctx: SuperscriptContext,
): {
  token?: TokenName;
  matches?: RegExpExecArray;
  state: SuperscriptState
} => {
  if (line.trim() === '') {
    // at least two spaces to be considered
    // https://fountain.io/syntax#line-breaks
    if (line.length < 2) state.inDialogue = false;

    return line.length < 2 ? { state: { inDialogue: false } } : { state };
  }

  for (const { id: token, regex: tRegex } of lineTokens) {
    const matches = tRegex.exec(line);

    if (matches) {
      if (token === tokenNames.character) {
        if (ctx.afterEmptyLine && !ctx.beforeEmptyLine && !ctx.isLastLine) {
          return { matches, token, state: { inDialogue: true } };
        } else {
          break;
        }
      }

      return { matches, token, state };
    }
  }

  if (state.inDialogue) {
    return { token: tokenNames.dialogue, state };
  }

  return { token: tokenNames.action, state };
}

export const buildDecorations = (view: EditorView): DecorationSet => {
  const builder = new RangeSetBuilder<Decoration>();
  const info = view.state.field(editorInfoField);

  if (!isSuperscriptEnabled(info)) return builder.finish();

  const markDeco = (start: number, end: number, className: string) => {
    const deco = Decoration.mark({ class: className });

    builder.add(start, end, deco);
  };

  let state: SuperscriptState = {
    inDialogue: false,
  };

  for (const { from, to } of view.visibleRanges) {
    const visibleText = view.state.sliceDoc(from, to);
    const maxLines = view.state.doc.lines;

    for (let pos = from; pos <= to;) {
      const line = view.state.doc.lineAt(pos);
      const { from: lFrom, to: lTo, text: lText } = line;
      const relFrom = lFrom - from;
      const relTo = lTo - from;
      const ctx = {
        afterEmptyLine: visibleText[relFrom - 2] === "\n",
        beforeEmptyLine: visibleText[relTo + 1] === "\n",
        isLastLine: line.number === maxLines,
      };
      const { matches, token, state: nextState } = getLineFormat(lText, state, ctx);

      state = nextState;

      if (!token) {
        pos = lTo + 1;
        continue;
      }

      const deco = Decoration.line({ class: "cm-superscript-" + token });
      builder.add(lFrom, lFrom, deco);

      // Mark Decorations
      const firstChar = lText[0];
      const lastChar = lText[line.length - 1];

      switch (token) {
        case tokenNames.action:
          if (firstChar === "!" && lText.substring(0, 3) !== "![[") {
            markDeco(lFrom, lFrom + 1, composeClass(token));
          }
          break;
        case tokenNames.character: {
          if (firstChar === "@") {
            markDeco(lFrom, lFrom + 1, composeClass(token));
          }
          if (lastChar === ")") {
            const charExt = lText.match(/(\(.*\))?$/g);

            if (charExt === null) {
              console.error("Character regex broken; char ext segment should exist",);
              continue;
            }

            const charExtLength = charExt[0].length;
            const charExtStart = lTo - charExtLength;

            markDeco(charExtStart, lTo, "cm-superscript-character-extension");
          }
          break;
        }
        case tokenNames.pageHeading: {
          if (!matches) break;

          const pageNumber = parseInt(matches[2]);
          const deco = Decoration.widget({ widget: new PageHeadingParityWidget(pageNumber) });

          builder.add(lTo, lTo, deco);

          break;
        }
      }

      pos = lTo + 1;
    }
  }

  return builder.finish();
}
