"use client"
import { ErrorInfo, useEffect, useMemo } from "react"

import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import ToolbarPlugin from "./toolbar"

import { TabIndentationExtension } from "@lexical/extension"
import { HistoryExtension } from "@lexical/history"
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer"
import { HeadingNode, QuoteNode, RichTextExtension } from "@lexical/rich-text"
import { defineExtension } from "lexical"
import { MarkdownShortcutExtension } from "../plugins/MarkdownTransformers"
import { ListNode, ListItemNode } from "@lexical/list"

import { CodeHighlightNode, CodeNode } from "@lexical/code"
import { HorizontalRuleNode } from "@lexical/extension"
import { HashtagNode } from "@lexical/hashtag"
import { AutoLinkNode, LinkNode } from "@lexical/link"
import { MarkNode } from "@lexical/mark"
import { OverflowNode } from "@lexical/overflow"
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table"
import RichEditorTheme from "../rich-editor-theme"

const theme = {
  heading: {
    h1: "mb-2 text-3xl font-bold",
    h2: "mb-2 text-2xl font-bold",
    h3: "mb-1 text-xl font-semibold",
  },
  list: {
    checklist: "list-none pl-0",
    listitem: "mx-6 my-0.5",
    listitemChecked:
      'relative list-none pl-6 line-through text-zinc-500 before:absolute before:top-0.5 before:left-0 before:flex before:h-4 before:w-4 before:items-center before:justify-center before:rounded-sm before:border before:border-solid before:border-zinc-400 before:bg-blue-500 before:text-[10px] before:leading-none before:text-white before:content-["✓"]',
    listitemUnchecked:
      'relative list-none pl-6 before:absolute before:top-0.5 before:left-0 before:h-4 before:w-4 before:rounded-sm before:border before:border-solid before:border-zinc-400 before:bg-transparent before:content-[""]',
    nested: {
      listitem: "list-none",
    },
    ol: "m-0 list-decimal pl-6",
    ul: "m-0 list-disc pl-6",
  },
  paragraph: "my-1",
  text: {
    bold: 'font-bold before:content-["*"] after:content-["*"]',
    code: "rounded bg-zinc-200/70 px-1 py-0.5 font-mono text-[0.9em] dark:bg-zinc-700/60",
    italic: "italic",
  },
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
  console.error(error)
}

function buildExtension() {
  return defineExtension({
    dependencies: [
      RichTextExtension,
      MarkdownShortcutExtension,
      RichTextExtension,
      HistoryExtension,
      TabIndentationExtension,
    ],
    name: "richEditor",
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      AutoLinkNode,
      LinkNode,
      TableCellNode,
      TableNode,
      TableRowNode,
      MarkNode,
      CodeHighlightNode,
      CodeNode,
      HorizontalRuleNode,
      HashtagNode,
    ],
    theme: RichEditorTheme,
  })
}

export function Editor() {
  const app = useMemo(() => buildExtension(), [])

  return (
    <div className="editor-container">
      <LexicalExtensionComposer extension={app} contentEditable={null}>
        <ToolbarPlugin />
        <div className="editor-inner">
          <ContentEditable
            className="overflow-y-auto p-4 text-base leading-relaxed text-wrap outline-none"
            aria-label="Rich text editor"
            aria-placeholder="Enter some text..."
            placeholder={<></>}
          />
          <LexicalErrorBoundary
            children={<></>}
            onError={(error: Error) => {
              console.error(error)
            }}
          />
        </div>
      </LexicalExtensionComposer>
    </div>
  )
}
