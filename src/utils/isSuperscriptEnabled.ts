import { App, TFile } from 'obsidian'

export const isSuperscriptEnabled = ({ app, file }: { app: App, file: TFile | null }) => {
  if (file?.extension == 'sup') return true

  if (file) {
    const fileCache = app.metadataCache.getFileCache(file)
    const lang = fileCache?.frontmatter?.lang ?? ''
    const langs = fileCache?.frontmatter?.langs ?? []

    return lang === 'superscript'
      || (Array.isArray(langs) && langs.includes('superscript'))
  }
}
