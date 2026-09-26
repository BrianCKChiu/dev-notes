"use client"
import { useCallback, useEffect, useState } from "react"
import { prisma } from "@/lib/prisma"
import { useChatStore } from "../store/chatStore"

export function Chat({ id = null }: { id: string | null }) {
    const DEFAULT_MESSAGE_LOAD_COUNT = 16

    const chatId = useChatStore((s) => s.chatId)
    const isNewChat = useChatStore((s) => s.isNewChat)
    const setMessages = useChatStore((s) => s.setMessages)
    const setChatId = useChatStore((s) => s.setChatId)


    // const loadMessages = useCallback(async () => {
    //     if (chatId === null) return;
    //     if (isNewChat === true) return;

    //     const m1 = await prisma.message.findMany({ where: { id: chatId }, take: DEFAULT_MESSAGE_LOAD_COUNT })

    //     setMessages(m1.map((m): MessageObject => {
    //         return {
    //             id: m.id,
    //             content: m.content,
    //             dateTime: m.create_at.toISOString(),
    //             sender: m.role,
    //             type: ""
    //         }
    //     }))
    // }, [chatId, isNewChat, setMessages])

    // // loads an existing chat when the component loads 
    // useEffect(() => {
    //     if (id === null) return;
    //     setChatId(id)
    // }, [id, setChatId])

    // // Load messages from chat history when opening and a previous chat
    // useEffect(() => {
    //     loadMessages();

    //     if (chatId === null) {
    //         // generate a new chat ID
    //         // have this ID stored locally
    //         // once the first message is sent then create an new entry on the chat TABLE


    //     }
    // }, [chatId, loadMessages]);


    return <div className="mx-30 my-10 w-200 h-150 border rounded-lg">
        <div className="flex h-full w-full">
            {/* Chats */}
            <div className="h-full w-60 border-r"></div>
            {/* Chat Content */}
            <div className="w-full h-full flex flex-col">
                {/* Chat Header */}
                <div className="w-full h-17 border-b"></div>
                {/* Chat Messages */}
                <div className="w-full h-full overflow-scroll">
                    <UserMessageBubble  text="Hello World"/>
                    <UserMessageBubble  text="A very very long message, where it'll wrap to a new line. Message is fun"/>
                    <UserMessageBubble  text="A very very long message, where it'll wrap to a new line. Message is fun"/>


                </div>
                {/* Input */}
                <div className="w-full h-15 border-t"></div>
            </div>
        </div>
    </div>
}

type MessageObject = {
    id: string,
    content: string,
    dateTime: string,
    sender: Sender,
    type: string, // TODO: make this into type
}

type Sender = "USER" | "ASSISTANT"; // TODO: replace client 


function UserMessageBubble({text, error = false}: {text: string, error?: boolean}){
    return <div className="ml-auto mr-3 my-3 px-3 py-2 bg-gray-200 rounded-lg w-max wrap-break-words max-w-[80%]">{text}</div>

}