import { App, TFile } from "obsidian";

export const isSuperscriptEnabled = ({ app, file }: { app: App, file: TFile | null }) => {
  if (file?.extension == "sup") return true;

  if (file) {
    const fileCache = app.metadataCache.getFileCache(file);
    const cssClasses = fileCache?.frontmatter?.cssclasses ?? [];

    return cssClasses.includes("superscript");
  }
}
