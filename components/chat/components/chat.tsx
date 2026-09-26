"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { prisma } from "@/lib/prisma"
import { useChatStore } from "../store/chatStore"
import { Copy, CopyIcon, CornerLeftUp, ThumbsDownIcon, CornerRightUp, Paperclip, ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble"
import { Message, MessageContent, MessageFooter } from "@/components/ui/message"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupTextarea } from "@/components/ui/input-group"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { v4 as uuidv4 } from 'uuid';

export function Chat({ id = null }: { id: string | null }) {
    const DEFAULT_MESSAGE_LOAD_COUNT = 16

    const chatId = useChatStore((s) => s.chatId)
    const isNewChat = useChatStore((s) => s.isNewChat)
    const setMessages = useChatStore((s) => s.setMessages)
    const setChatId = useChatStore((s) => s.setChatId)

    const [messageHistory, updateMessageHistory] = useState<MessageObject[]>([]);
    const inputRef = useRef<HTMLTextAreaElement>(null);


    const sendMessage = useCallback(() => {
        if (inputRef === null) return;
        console.log("Hello")
        const inputString = inputRef.current?.value.trim();

        if (inputString === "" || inputString == null) return;

        const message : MessageObject = {
            id: uuidv4(),
            content: inputString,
            sender: "user",
            dateTime: Date.now.toString()
        }
        updateMessageHistory([...messageHistory, message])
    },[messageHistory])





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
                    {messageHistory.map((m) => {
                        return <MessageBubble key={m.id} text={m.content} type={m.sender}/>
                    })}
                </div>
                {/* Input */}
                <div className="w-full border-t">
                    <InputGroup>
                        <InputGroupTextarea placeholder="Ask Me Anything..." ref={inputRef}/>
                        <InputGroupAddon align={"block-end"} className="flex flex-row gap-1 justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <InputGroupButton disabled variant={"ghost"}>
                                    GPT 5.2 <ChevronDownIcon className="size-3" />
                                    </InputGroupButton>
                                </DropdownMenuTrigger>
                            </DropdownMenu>
                            <InputGroupButton variant={"ghost"} aria-label="Attatch">
                                <Paperclip />
                            </InputGroupButton>
                            <InputGroupButton variant="default" aria-label="Send" onClick={sendMessage}>
                                Send <CornerRightUp size={24} />
                            </InputGroupButton>
                        </InputGroupAddon>

                    </InputGroup>
                </div>
            </div>
        </div>
    </div>
}

type MessageObject = {
    id: string,
    content: string,
    dateTime: string,
    sender: "user" | ""
}
type Sender = "USER" | "ASSISTANT"; // TODO: replace client 

function MessageBubble({ type, text }: { type: string, text: string }) {

    return <div className="flex flex-row gap-2 py-3 mx-3">
        <Message align={type === "user" ? "end" : "start"}>
            <MessageContent>
                <Bubble>
                    <BubbleContent>
                        {text}
                    </BubbleContent>

                </Bubble>
            </MessageContent>
        </Message>
    </div>

}


function UserMessageBubble({ text, error = false }: { text: string, error?: boolean }) {
    const messageBubbleClassName = `ml-auto mr-3 px-3 py-2 rounded-lg w-max wrap-break-words max-w-[80%] ${error ? "bg-red-300 border border-red-400" : "bg-gray-200"}`

    return <Bubble align="end">
        <BubbleContent>
            {text}
        </BubbleContent>

    </Bubble>
}


function AssistantMessageBubble() {
    return <div className="border-t border-b border-gray-200 bg-gray-50 py-6 px-6">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sodales et nibh eu gravida. In gravida dapibus leo. Curabitur accumsan ex congue porttitor cursus. Aenean pharetra vulputate velit, et fermentum enim dapibus sit amet. Etiam gravida efficitur purus et lobortis. Ut vulputate tincidunt est, in pretium leo convallis quis. Nullam faucibus suscipit nunc bibendum lobortis. Curabitur lobortis metus vitae eros fermentum condimentum. Ut nec magna malesuada, dictum leo in, dignissim nunc. Praesent semper nisi quis ante elementum, vitae sodales tellus bibendum. Proin vitae scelerisque velit. Etiam urna velit, sodales rutrum nunc eu, mollis interdum sapien. Cras viverra aliquam mi a tristique. Praesent tempor tortor eu dui efficitur, at convallis ipsum varius. Vivamus aliquet lacus porta elit malesuada faucibus. In porta lobortis turpis id ultrices.
    </div>
}
