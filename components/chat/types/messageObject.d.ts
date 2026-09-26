export type MessageObject = {
    id: string,
    content: string,
    dateTime: string,
    sender: Sender,
    type: string, // TODO: make this into type
}