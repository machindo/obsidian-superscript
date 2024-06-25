/* eslint-disable @typescript-eslint/no-unused-vars */
import { EditorView, Rect, WidgetType } from "@codemirror/view";

export class PageHeadingParityWidget extends WidgetType {
  constructor(readonly pageNumber: number) {
    super();
  }

  toDOM() {
    const div = document.createElement("div");
    div.className = `cm-superscript-page-heading-parity cm-superscript-page-heading-parity-${this.pageNumber % 2 === 0 ? "even" : "odd"}`;
    div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open">
      <path class="page-left" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path class="page-right" d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>`;

    return div;
  }
}