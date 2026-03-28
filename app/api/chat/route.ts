import {
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, context }: { messages: UIMessage[]; context: string } =
    await req.json()

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: `You are a personal finance assistant for the user of 3comma, a liquidity dashboard app.
You have access to the user's real financial data summarized below. Treat it as their actual finances.
Be concise, direct, and helpful. Never make up numbers — only reference the data provided.
If asked something outside the scope of this data, say you don't have enough information.
Respond in plain text only — no markdown, no bullet points, no headers.

--- FINANCIAL CONTEXT ---
${context}
--- END CONTEXT ---`,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse()
}
