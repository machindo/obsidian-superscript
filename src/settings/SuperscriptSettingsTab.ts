import { PluginSettingTab, App, Setting } from 'obsidian'
import SuperscriptPlugin from '../main'

export class SuperscriptSettingsTab extends PluginSettingTab {
  constructor(app: App, readonly plugin: SuperscriptPlugin) {
    super(app, plugin)
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    new Setting(containerEl)
      .setName('Display word count')
      .setDesc('Displays the word count of each page, panel, and character')
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.displayWordCount)
          .onChange(async (value) => {
            this.plugin.settings.displayWordCount = value

            await this.plugin.saveSettings()
          })
      })

    new Setting(containerEl)
      .setName('Display page icons')
      .setDesc('Displays icons on page headings to indicate the left/right page side')
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.displayPageIcons)
          .onChange(async (value) => {
            this.plugin.settings.displayPageIcons = value

            await this.plugin.saveSettings()
          })
      })
  }
}
