"use client"
import { SyntheticEvent, useCallback, useEffect, useRef, useState } from "react"
import { CopyIcon, CornerRightUp, Paperclip, ChevronDownIcon, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageContent } from "@/components/ui/message"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@/components/ui/input-group"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { v4 as uuidv4 } from 'uuid';
import OpenAI from "openai";
import { Resizable, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';

type MessagePayload = { content: string, role: "user" | "assistant" | "developer" }

enum UploadState {
    UPLOADING,
    SCCUESSFUL,
    FAILED
}

enum UploadError {
    INVALID_TYPE,
    TOO_LARGE
}

type FileAttatchment = {
    id: string,
    name: string,
    size: string,
    status: UploadState,
    error?: UploadError,
    bucketUrl?: string
}

type MessageObject = {
    id: string,
    content: string,
    dateTime: string,
    role: "user" | "assistant" | "developer"
}


export function Chat({ id = null }: { id: string | null }) {

    // GUI features, currently disabled but will be enabled and refactored after the bastic features are working and refactored
    const [chatHistoryWidth, setChatHistoryWidth] = useState<number>(250);
    const [windowMiddle, setWindowMiddle] = useState<number>(200);

    // File upload 
    const fileDropOffRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
    const ALLOWED_FILE_TYPES: string[] = []; //TODO

    // Messaging states
    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
    });
    const [conversationId, setCnversationId] = useState<string | null>(null)
    const [messageHistory, updateMessageHistory] = useState<MessageObject[]>([]);
    const [isSending, setIsSending] = useState<boolean>(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const initializeConversation = useCallback(async () => {
        if (conversationId !== null) return;
        const conversation = await openai.conversations.create();

        setCnversationId(conversation.id)

    }, [conversationId, openai.conversations])

    useEffect(() => {
        initializeConversation();
    }, [initializeConversation])

    // const updateWindowMiddle = useCallback(() => {
    //     const middle = window.innerWidth / 2;
    //     setWindowMiddle(middle);
    //     console.log("WIndowMiddle", windowMiddle)
    //     console.log("chathistorywidth", chatHistoryWidth)
    //     if (middle < chatHistoryWidth && chatHistoryWidth > MIN_CHAT_HISTORY_WIDTH) {
    //         setChatHistoryWidth(middle)
    //     }
    // }, [chatHistoryWidth, windowMiddle])

    // useEffect(() => {
    //     updateWindowMiddle();
    // }, [updateWindowMiddle])

    // useLayoutEffect(() => {

    //     window.addEventListener('resize', updateWindowMiddle);

    // })



    function onResize(event: SyntheticEvent<Element, Event>, { size }: ResizeCallbackData) {
        setChatHistoryWidth(size.width);
    };


    const sendMessage = useCallback(async () => {
        if (inputRef.current === null) return;
        const inputElement = inputRef.current;
        const inputString = inputElement.value.trim();

        if (inputString === "" || inputString == null) return;

        setIsSending(true)

        const message: MessageObject = {
            id: uuidv4(),
            content: inputString,
            role: "user",
            dateTime: Date.now.toString()
        };

        inputElement.value = "";

        setIsSending(false)
        let responseMessage: MessageObject = {
            id: uuidv4(),
            content: "",
            role: "assistant",
            dateTime: Date.now.toString()
        };

        const history = [...messageHistory, message, responseMessage];
        updateMessageHistory(history);
        console.log(history)


        const stream = await openai.responses.create({
            model: "gpt-5.5",
            conversation: conversationId,
            input: history.map(({ content, role }) => ({ content, role })),
            text: {
                "format": {
                    "type": "text"
                },
                "verbosity": "medium"
            },
            stream: true,
            store: true,

        });

        for await (const event of stream) {
            if (event.type === "response.output_text.delta" || event.type === "response.refusal.delta") {
                const content = responseMessage.content + event.delta
                responseMessage = {
                    ...responseMessage,
                    content
                }

                updateMessageHistory((t) => {
                    const n = t.map((m) => {
                        if (m.id === responseMessage.id) {
                            m.content = content;
                        }
                        return m;
                    })
                    return n
                });
                console.log(content)
            } else if (event.type === "response.failed") {
                throw new Error(event.response.error?.message ?? "Response generation failed");
            }
        }

    }, [conversationId, messageHistory, openai.responses]);



    useEffect(() => {
        if (fileDropOffRef.current === null) return;

        const fileDropZone = fileDropOffRef.current;

        const handleWindowDragOver = (e: DragEvent) => {
            e.preventDefault();

            setIsDragging(true);
            if (!e.dataTransfer || !e.dataTransfer.files) return;

            const droppedFiles = e.dataTransfer.files;

            const uploadStates: FileAttatchment[] = []

            for (const file of droppedFiles) {

                let fileState: FileAttatchment = {
                    id: uuidv4(),
                    name: file.name,
                    size: file.size + " FIX THIS",
                    status: UploadState.UPLOADING,
                }
                if (!ALLOWED_FILE_TYPES.includes(file.type)) {

                    // TODO: updating the state into a separate function ie. updateFileStatus(fileId, newStatus, bucketUrl?, errorType?)
                    fileState = {
                        ...fileState,
                        status: UploadState.FAILED,
                        error: UploadError.INVALID_TYPE
                    }
                    continue;
                }

                if (file.size > MAX_FILE_SIZE) {
                    fileState = {
                        ...fileState,
                        status: UploadState.FAILED,
                        error: UploadError.TOO_LARGE
                    }
                }
            }
        };

        const handleFileDrop = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
        };

        document.addEventListener('dragover', handleWindowDragOver)
        document.addEventListener('drop', handleFileDrop)
        fileDropZone.addEventListener('drop', handleFileDrop)

        return () => {
            document.removeEventListener('dragover', handleWindowDragOver);
            document.removeEventListener('drop', handleFileDrop);
            if (fileDropZone) {
                fileDropZone.removeEventListener('drop', handleFileDrop);
            }
        }
    }, [ALLOWED_FILE_TYPES, MAX_FILE_SIZE, fileDropOffRef])

    return <div className="w-full h-full border rounded-lg">
        <div className="flex h-full w-full">
            {/* Chats */}
            <Resizable
                width={chatHistoryWidth}
                height={200}
                onResize={onResize}
                minConstraints={[150, 150]}
                maxConstraints={[windowMiddle, windowMiddle]}
            >
                <div className="h-full w-60 border-r"
                    style={{ width: chatHistoryWidth + 'px' }}
                ></div>

            </Resizable>
            {/* Chat Content */}
            <div className="w-full h-full flex flex-col">
                {/* Chat Header */}
                <div className="w-full h-17 border-b"></div>
                {/* Chat Messages */}
                <div className="w-full h-full overflow-scroll">
                    {messageHistory.map((m) => {
                        return <MessageBubble key={m.id} text={m.content} type={m.role} />
                    })}
                </div>
                {/* Input */}
                <div className="relative w-full border-t" ref={fileDropOffRef}>
                    <div className={`${isDragging ? "block" : "hidden"} absolute inset-0 z-20 bg-gray-100 border-4 border-dashed border-gray-300 w-full h-full`}>
                        <div className="flex flex-col justify-center text-center h-full w-full">
                            <h3 className="text-lg text-gray-500">Upload File</h3>
                            <p className="text-sm text-gray-400">Max: 3MB </p>
                        </div>
                    </div>
                    <InputGroup>
                        <InputGroupTextarea placeholder="Ask Me Anything..." ref={inputRef} />
                        <InputGroupAddon align={"block-end"} className="flex flex-row gap-1 justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <InputGroupButton disabled variant={"ghost"}>
                                        GPT 5.2 <ChevronDownIcon className="size-3" />
                                    </InputGroupButton>
                                </DropdownMenuTrigger>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <InputGroupButton variant={"ghost"} aria-label="Attatch">
                                        <Paperclip />
                                    </InputGroupButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                        Test
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <InputGroupButton variant="default" aria-label="Send" onClick={sendMessage} disabled={isSending}>
                                Send <CornerRightUp size={24} />
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </div>
        </div>
    </div>
}

function MessageBubble({ type, text }: { type: string, text: string }) {

    return <div className="flex flex-row gap-2 py-3">
        <Message align={type === "user" ? "end" : "start"}>
            <MessageContent>
                {type === "user" ? <UserMessageBubble text={text} /> : <AssistantMessageBubble text={text} />}
            </MessageContent>

        </Message>
    </div>

}

function UserMessageBubble({ text, error = false }: { text: string, error?: boolean }) {
    return <Bubble>
        <BubbleContent>
            {text}
        </BubbleContent>
    </Bubble>
}

function AssistantMessageBubble({ text }: { text: string }) {
    return <div className="border-t border-b border-gray-200 bg-gray-50 pt-10 px-6 group">
        <div>{text}</div>
        <div className="flex flex-row-reverse gap-1 mt-2 h-8 text-gray-400">
            <Button variant="ghost" size="icon-sm" className="hidden group-hover:flex">
                <CopyIcon />
            </Button>
            <Button variant="ghost" size="icon-sm" className="hidden group-hover:flex">
                <RotateCcw />
            </Button>
        </div>
    </div>
}
