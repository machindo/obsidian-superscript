import { RangeSetBuilder, Text } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { editorInfoField } from "obsidian";
import { SuperscriptContext } from "./SuperscriptContext";
import { SuperscriptState } from "./SuperscriptState";
import { lineTokens, tokenNames } from "./tokens";

const composeClass = (token: string) => `cm-formatting cm-superscript-formatting-${token}`;

const getLineFormat = (
    line: string,
    state: SuperscriptState,
    ctx: SuperscriptContext,
) => {
    if (!line.trim()) {
        // at least two spaces to be considered
        // https://fountain.io/syntax#line-breaks
        if (line.length < 2) state.inDialogue = false;
        return null;
    }

    for (const { id, regex: tRegex } of lineTokens) {
        if (tRegex.test(line)) {
            if (id === tokenNames.character) {
                if (ctx.afterEmptyLine && !ctx.beforeEmptyLine && !ctx.isLastLine) {
                    state.inDialogue = true;
                } else {
                    break;
                }
            }

            return id;
        }
    }

    if (state.inDialogue) {
        return tokenNames.dialogue;
    }

    return tokenNames.action;
}

function isSuperscriptEnabled(view: EditorView) {
    const info = view.state.field(editorInfoField);
    const { app, file } = info;

    if (file?.extension == "superscript") return true;

    if (file) {
        const fileCache = app.metadataCache.getFileCache(file);
        const cssClasses = fileCache?.frontmatter?.cssclasses ?? [];
        return cssClasses.includes("superscript");
    }
}

export const buildDecorations = (view: EditorView): DecorationSet => {
    const builder = new RangeSetBuilder<Decoration>();

    if (!isSuperscriptEnabled(view)) return builder.finish();

    const markDeco = (start: number, end: number, className: string) => {
        const deco = Decoration.mark({ class: className });

        builder.add(start, end, deco);
    };

    const state: SuperscriptState = {
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
            const token = getLineFormat(lText, state, ctx);


            if (!token) {
                pos = lTo + 1;
                continue;
            }

            const deco = Decoration.line({ class: "cm-superscript-" + token });
            builder.add(lFrom, lFrom, deco);

            // Mark Decorations
            const firstChar = lText[0];
            const lastChar = lText[line.length - 1];
            if (
                token === tokenNames.action &&
                firstChar === "!" &&
                lText.substring(0, 3) !== "![["
            ) {
                markDeco(lFrom, lFrom + 1, composeClass(token));
            } else if (token === tokenNames.character) {
                if (firstChar === "@") {
                    markDeco(lFrom, lFrom + 1, composeClass(token));
                }
                if (lastChar === ")") {
                    const charExt = lText.match(/(\(.*\))?$/g);
                    if (charExt === null) {
                        console.error(
                            "Character regex broken; char ext segment should exist",
                        );
                        continue;
                    }
                    const charExtLength = charExt[0].length;
                    const charExtStart = lTo - charExtLength;
                    markDeco(charExtStart, lTo, "cm-fountain-character-extension");
                }
            }

            pos = lTo + 1;
        }
    }

    return builder.finish();
}
