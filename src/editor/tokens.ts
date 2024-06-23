export const tokenNames = {
    pageHeading: 'page-heading',
    panelHeading: 'panel-heading',
    character: 'character',
    dialogue: 'dialogue',
    action: 'action'
} as const;

export const lineTokens = [
    {
        id: tokenNames.pageHeading,
        regex: /^Page \d+$/i,
    },
    {
        id: tokenNames.panelHeading,
        regex: /^Panel \d+$/i,
    },
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
] as const;
