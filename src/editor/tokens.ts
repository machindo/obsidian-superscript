export const tokenNames = {
  pageHeading: 'page-heading',
  panelHeading: 'panel-heading',
  character: 'character',
  dialogue: 'dialogue',
  action: 'action',
} as const

export type TokenName = typeof tokenNames[keyof typeof tokenNames]

export const pageHeadingToken = {
  id: tokenNames.pageHeading,
  regex: /^(PAGE) (\d+)(?:-(\d+))?$/i,
} as const

export const panelHeadingToken = {
  id: tokenNames.panelHeading,
  regex: /^(Panel) (\d+)(?:-(\d+))?$/i,
} as const

export const lineTokens = [
  pageHeadingToken,
  panelHeadingToken,
  {
    id: tokenNames.character,
    regex: /^[^\S\r\n]*(?=.*[A-Z\u00C0-\u00DEF])[A-Z0-9\u00C0-\u00DEF \t'.-]+\s?(\(.*\))?$|@.*$/,
  },
  {
    id: tokenNames.dialogue,
    regex: /^[^\S\r\n]*(\^?)?(?:\n(?!\n+))([\s\S]+)/,
  },
  {
    id: tokenNames.action,
    regex: /^!.*$/,
  },
] as const
