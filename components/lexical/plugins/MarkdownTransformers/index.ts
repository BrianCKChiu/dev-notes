import { PLAYGROUND_TRANSFORMERS } from "./transformers"
import { registerMarkdownShortcuts } from "@lexical/markdown"
import { defineExtension } from "lexical"

export const MarkdownShortcutExtension = defineExtension({
  name: "MarkdownShortcuts",
  register: (editor) =>
    registerMarkdownShortcuts(editor, PLAYGROUND_TRANSFORMERS),
})
