import { Prec } from '@codemirror/state'
import { Plugin } from 'obsidian'
import { renumberHeadings } from './autocorrect/renumberHeadings'
import { createDecorationViewPlugin } from './decorations/createDecorationViewPlugin'
import { SuperscriptPluginSettings } from './settings/SuperscriptPluginSettings'
import { SuperscriptSettingsTab } from './settings/SuperscriptSettingsTab'
import { SuperscriptSuggest } from './suggestions/SuperscriptSuggest'

const DEFAULT_SETTINGS: SuperscriptPluginSettings = {
  displayPageIcons: true,
  displayWordCount: true,
} as const

export default class SuperscriptPlugin extends Plugin {
  settings: SuperscriptPluginSettings = DEFAULT_SETTINGS

  async onload() {
    this.loadSettings()

    // Settings
    this.addSettingTab(new SuperscriptSettingsTab(this.app, this))

    // Formatting
    this.registerEditorExtension(Prec.lowest(createDecorationViewPlugin(this)))

    // Suggestions
    this.registerEditorSuggest(new SuperscriptSuggest(this.app))

    // Header renumbering
    this.addCommand({
      id: 'superscript-autonumber-headings',
      name: 'Fix heading numbers',
      editorCallback: renumberHeadings,
    })
    this.registerDomEvent(this.app.workspace.containerEl, 'keyup', (event) => {
      if (!this.app.workspace.activeEditor?.editor) return

      if (event.key.length > 1 && !['Backspace', 'Delete', 'Enter'].includes(event.key)) return

      renumberHeadings(this.app.workspace.activeEditor?.editor, this.app.workspace.activeEditor)
    })
  }

  onunload() {

  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  saveSettings() {
    this.loadData
    return this.saveData(this.settings)
  }
}
