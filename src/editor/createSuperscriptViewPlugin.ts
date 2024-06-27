import { DecorationSet, EditorView, PluginSpec, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view'
import SuperscriptPlugin from '../main'
import { buildDecorations } from './buildDecorations'

type SuperscriptPluginValue = PluginValue & {
  decorations: DecorationSet
}

const createSuperscriptPluginValue = (plugin: SuperscriptPlugin) =>
  (view: EditorView) => {
    const pluginValue: SuperscriptPluginValue = {
      decorations: buildDecorations(view, plugin.settings),
      update: (update: ViewUpdate) => {
        if (update.docChanged || update.viewportChanged) {
          pluginValue.decorations = buildDecorations(update.view, plugin.settings)
        }
      },
    }

    return pluginValue
  }

const pluginSpec: PluginSpec<SuperscriptPluginValue> = {
  decorations: (value: SuperscriptPluginValue) => value.decorations,
}

export const createSuperscriptViewPlugin = (plugin: SuperscriptPlugin) =>
  ViewPlugin.define(createSuperscriptPluginValue(plugin), pluginSpec)
