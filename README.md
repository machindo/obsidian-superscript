# Obsidian Superscript Plugin

[Superscript](https://superscript.app/) comic book script syntax plugin for [Obsidian](https://obsidian.md/).

## Features

- Superscript syntax styling
- Auto-numbering of page and panel headings
- Shortcuts for headings
- Reading view support

## Installation

This plugin is not yet available in the Obsidian community plugin store. To install it manually, follow these steps:

1. Install and activate the [BRAT](https://obsidian.md/plugins?id=obsidian42-brat) plugin from the Community Plugins in Obsidian.
2. Open the command palette and run the command "BRAT: Add a beta plugin with frozen version based on a release tag".
3. In the repository field, enter "machindo/obsidian-superscript".
4. In the tag field enter the beta release you want to try, e.g. "1.0.0-beta.4".
5. Click the "Add Plugin" button.

## Setup

In the frontmatter of a note, add the following to enable Superscript features for that note:

```yaml
---
lang: superscript
---
```

