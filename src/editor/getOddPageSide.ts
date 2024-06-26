import { App, TFile } from 'obsidian'

export const getOddPageSide = ({ app, file }: { app: App, file: TFile | null }) => {
  const fileCache = file && app.metadataCache.getFileCache(file)

  return fileCache?.frontmatter?.oddPageSide === 'left' ? 'left' : 'right'
}
