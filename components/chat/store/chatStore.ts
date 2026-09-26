import { create } from "zustand";
import { MessageObject } from "../types/messageObject";

type ChatState = {
    messages: MessageObject[]
    chatId: string| null
    isNewChat: boolean
}

type ChatAction = {
    setChatId: (chatId: ChatState['chatId']) => void
    setMessages: (messages: ChatState['messages']) => void
    sendMessage: (text: string) => void
}

const defaultChatState: ChatState = {
    messages: [],
    chatId: null,
    isNewChat: true
}

export const useChatStore = create<ChatState & ChatAction>()((set) => ({
    ...defaultChatState,
    setChatId: (chatId) => set(() => ({chatId})),
    setMessages: (messages) => set(() => ({
        messages
    })),
    sendMessage: (message: string) => {
        const newMessage : MessageObject = {
            id: "",
            content: message,
            dateTime: "",
            sender: "USER",
            type:""
        };
        
        set((state) => ({
            messages: [...state.messages, newMessage]
        }));
        
        return;
    }
}))