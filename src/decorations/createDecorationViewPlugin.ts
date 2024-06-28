import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, DecorationSet, EditorView, PluginSpec, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view'
import SuperscriptPlugin from '../main'
import { SuperscriptPluginSettings } from '../settings/SuperscriptPluginSettings'
import { computeDecorations } from './computeDecorations'

type DecorationPluginValue = PluginValue & {
  decorations: DecorationSet
}

const buildDecorations = (view: EditorView, settings: SuperscriptPluginSettings) => {
  const builder = new RangeSetBuilder<Decoration>()
  const decorations = computeDecorations(view, settings)

  for (const { from, to, decoration } of decorations) {
    builder.add(from, to, decoration)
  }

  return builder.finish()
}

const createDecorationPluginValue = (plugin: SuperscriptPlugin) =>
  (view: EditorView) => {
    const pluginValue: DecorationPluginValue = {
      decorations: buildDecorations(view, plugin.settings),
      update: (update: ViewUpdate) => {
        if (update.docChanged || update.viewportChanged || update.selectionSet) {
          pluginValue.decorations = buildDecorations(update.view, plugin.settings)
        }
      },
    }

    return pluginValue
  }

const pluginSpec: PluginSpec<DecorationPluginValue> = {
  decorations: (value: DecorationPluginValue) => value.decorations,
}

export const createDecorationViewPlugin = (plugin: SuperscriptPlugin) =>
  ViewPlugin.define(createDecorationPluginValue(plugin), pluginSpec)
