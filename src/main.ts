import { Prec } from '@codemirror/state'
import { Plugin } from 'obsidian'
import { autonumberHeadings } from './editor/autonumberHeadings'
import { createSuperscriptViewPlugin } from './editor/createSuperscriptViewPlugin'
import { SuperscriptPluginSettings } from './settings/SuperscriptPluginSettings'
import { SuperscriptSettingsTab } from './settings/SuperscriptSettingsTab'
import { applyShortcuts } from './shortcuts/applyShortcuts'

const DEFAULT_SETTINGS: SuperscriptPluginSettings = {
  displayPageIcons: true,
  displayWordCount: true,
} as const

export default class SuperscriptPlugin extends Plugin {
  settings: SuperscriptPluginSettings = DEFAULT_SETTINGS

  async onload() {
    this.loadSettings()

    // Formatting
    this.registerEditorExtension(Prec.lowest(createSuperscriptViewPlugin(this)))

    // Autonumbering
    this.registerEvent(this.app.workspace.on('editor-change', autonumberHeadings))

    // Settings
    this.addSettingTab(new SuperscriptSettingsTab(this.app, this))

    // Shortcuts
    this.registerDomEvent(document, 'keydown', applyShortcuts(this))
  }

  onunload() {

  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    this.loadData
    await this.saveData(this.settings)
  }
}
