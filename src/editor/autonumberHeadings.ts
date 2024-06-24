import { Editor } from "obsidian";
import { pageHeadingToken, panelHeadingToken } from "./tokens";

export const autonumberHeadings = (editor: Editor) => {
    let pageNumber = 0;
    let panelNumber = 0;

    for (let line = 0; line < editor.lastLine(); line++) {
        const text = editor.getLine(line);

        if (pageHeadingToken.regex.test(text)) {
            pageNumber++;
            panelNumber = 0;

            const expectedText = `PAGE ${pageNumber}`;

            if (text !== expectedText) {
                editor.replaceRange(expectedText, { line, ch: 0 }, { line, ch: text.length })
                console.log('replaced', text, 'with', expectedText)
            }
        } else if (panelHeadingToken.regex.test(text)) {
            panelNumber++;

            const expectedText = `Panel ${panelNumber}`;

            if (text !== expectedText) {
                editor.replaceRange(expectedText, { line, ch: 0 }, { line, ch: text.length })
                console.log('replaced', text, 'with', expectedText)
            }
        }
    }
}
