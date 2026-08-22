/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $findMatchingParent, mergeRegister } from "@lexical/utils"
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  $isRootOrShadowRoot,
  $createParagraphNode,
  type LexicalEditor,
  ElementFormatType,
  $isElementNode,
} from "lexical"
import { useCallback, useEffect, useRef, useState } from "react"

import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text"
import { $setBlocksType } from "@lexical/selection"
import { $createCodeNode } from "@lexical/code"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function Divider() {
  return <div className="divider" />
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const toolbarRef = useRef(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [blockType, setBlockType] = useState("paragraph")
  const [textAlignment, setTextAlignment] = useState<ElementFormatType>("left")

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()

      // Update text format
      setIsBold(selection.hasFormat("bold"))
      setIsItalic(selection.hasFormat("italic"))
      setIsUnderline(selection.hasFormat("underline"))
      setIsStrikethrough(selection.hasFormat("strikethrough"))

      let topLevelElement = $findMatchingParent(anchorNode, (e) => {
        const parent = e.getParent()
        return parent !== null && $isRootOrShadowRoot(parent)
      })
      if (topLevelElement === null) {
        topLevelElement = anchorNode.getTopLevelElementOrThrow()
      }

      if ($isElementNode(topLevelElement)) {
        const alignment = topLevelElement.getFormatType()
        setTextAlignment(alignment)
      }

      if ($isHeadingNode(topLevelElement)) {
        setBlockType(topLevelElement.getTag())
      } else {
        setBlockType(topLevelElement.getType())
      }
    }
  }, [])

  const BLOCK_TYPES = [
    { label: "Normal", value: "paragraph" },
    { label: "Heading 1", value: "h1" },
    { label: "Heading 2", value: "h2" },
    { label: "Heading 3", value: "h3" },
    { label: "Quote", value: "quote" },
    { label: "Code", value: "code" },
  ]

  const FORMAT_TYPES: ElementFormatType[] = [
    "left",
    "center",
    "right",
    "justify",
  ]

  function formatParagraph(editor: LexicalEditor) {
    editor.update(() => {
      const selection = $getSelection()
      $setBlocksType(selection, () => $createParagraphNode())
    })
  }

  function formatHeading(
    editor: LexicalEditor,
    headingTag: "h1" | "h2" | "h3"
  ) {
    editor.update(() => {
      const selection = $getSelection()
      $setBlocksType(selection, () => $createHeadingNode(headingTag))
    })
  }

  function formatQuote(editor: LexicalEditor) {
    editor.update(() => {
      const selection = $getSelection()
      $setBlocksType(selection, () => $createQuoteNode())
    })
  }

  function formatCode(editor: LexicalEditor) {
    editor.update(() => {
      const selection = $getSelection()
      $setBlocksType(selection, () => $createCodeNode())
    })
  }

  function applyBlockType(editor: LexicalEditor, type: string) {
    if (type === "paragraph") {
      formatParagraph(editor)
    } else if (type === "quote") {
      formatQuote(editor)
    } else if (type === "code") {
      formatCode(editor)
    } else {
      formatHeading(editor, type as "h1" | "h2" | "h3")
    }
  }

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar()
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor, $updateToolbar])

  return (
    <div className="border-b px-3" ref={toolbarRef}>
      <div className="toolbar @container">
        <Select
          value={blockType}
          onValueChange={(value) => applyBlockType(editor, value)}
          aria-label="Block type"
        >
          <SelectTrigger className="w-[150px] cursor-pointer appearance-none rounded-md border border-solid border-transparent bg-transparent px-2 py-1 text-sm font-medium text-zinc-700 transition-colors duration-150 outline-none hover:bg-zinc-200 focus-visible:outline-blue-500 dark:text-zinc-200 dark:hover:bg-zinc-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {BLOCK_TYPES.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          disabled={!canUndo}
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined)
          }}
          className="toolbar-item spaced"
          aria-label="Undo"
        >
          <i className="format undo" />
        </button>
        <button
          disabled={!canRedo}
          onClick={() => {
            editor.dispatchCommand(REDO_COMMAND, undefined)
          }}
          className="toolbar-item"
          aria-label="Redo"
        >
          <i className="format redo" />
        </button>
        <Divider />
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
          }}
          className={"toolbar-item spaced " + (isBold ? "active" : "")}
          aria-label="Format Bold"
        >
          <i className="format bold" />
        </button>
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
          }}
          className={"toolbar-item spaced " + (isItalic ? "active" : "")}
          aria-label="Format Italics"
        >
          <i className="format italic" />
        </button>
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
          }}
          className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
          aria-label="Format Underline"
        >
          <i className="format underline" />
        </button>
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
          }}
          className={"toolbar-item spaced " + (isStrikethrough ? "active" : "")}
          aria-label="Format Strikethrough"
        >
          <i className="format strikethrough" />
        </button>
        <Divider />
        <Select>
          <SelectTrigger className="@min-[500px]:hidden">
            <SelectValue />
          </SelectTrigger>
          <SelectContent></SelectContent>
        </Select>

        {FORMAT_TYPES.map((value: ElementFormatType) => (
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value)
            }}
            className={
              "toolbar-item spaced @max-[500px]:!hidden @min-[500px]:flex " +
              (textAlignment === value ? "active" : "")
            }
            aria-label="Left Align"
            key={value}
          >
            <i className={`format ${value}-align`} />
          </button>
        ))}
      </div>
    </div>
  )
}
