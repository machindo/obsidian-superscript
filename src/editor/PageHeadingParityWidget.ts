import { WidgetType } from "@codemirror/view";

export class PageHeadingParityWidget extends WidgetType {
  constructor(readonly pageNumber: number, readonly oddPageSide: 'left' | 'right') {
    super();
  }

  toDOM() {
    // TODO: take LTR/RTL into account
    const div = document.createElement("div");
    const side =
      this.oddPageSide === 'left' && this.pageNumber % 2 === 1
        ? 'left'
        : this.oddPageSide === 'right' && this.pageNumber % 2 === 1
          ? 'right'
          : this.oddPageSide === 'left'
            ? 'right'
            : 'left';

    div.className = `cm-superscript-page-heading-parity cm-superscript-page-heading-parity-${side}`;
    div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon">
      <path class="svg-icon-page-left" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path class="svg-icon-page-right" d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>`;

    return div;
  }
}
