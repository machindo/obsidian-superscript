type HeadingInfo = {
  from: number;
  to: number;
  wordCount: number;
}

export type SuperscriptState = {
  characters: HeadingInfo[];
  pageHeadings: HeadingInfo[];
  panelHeadings: HeadingInfo[];
  inDialogue: boolean;
}
