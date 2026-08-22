import OpenAI from "openai"
import { ResponsesModel } from "openai/resources/shared.mjs"

const DEFAULT_MODEL: ResponsesModel = "gpt-5.6-sol"

type MessagePayload = {
  message: string
  model: ResponsesModel | null
}

// TO DO: load the user's open api key from database or cookie
const OPEN_AI_KEY = process.env.OPEN_API_KEY

const client = new OpenAI()

export async function sendMessage(payload: MessagePayload) {
  const response = await client.responses.create({
    model: payload.model ?? DEFAULT_MODEL,
    input: payload.message,
  })
  return response.output_text
}
