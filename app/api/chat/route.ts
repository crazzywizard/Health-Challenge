import { streamText, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: 'google/gemini-3-flash',
    system: `You are a helpful health and fitness assistant for the "Health Challenge" app. 
    Your goal is to help users stay motivated, provide advice on healthy habits, explain common fitness terms, and encourage them to complete their daily rules.
    Keep your answers concise, encouraging, and focused on health and wellness. 
    If a user asks about medical issues, always remind them to consult a healthcare professional.`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
