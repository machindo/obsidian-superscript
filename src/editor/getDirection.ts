import { App, TFile } from 'obsidian'

export const getDirection = ({ app, file }: { app: App, file: TFile | null }) => {
  const fileCache = file && app.metadataCache.getFileCache(file)

  return fileCache?.frontmatter?.direction === 'rtl' ? 'rtl' : 'ltr'
}
