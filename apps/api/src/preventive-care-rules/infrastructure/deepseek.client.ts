const DEEPSEEK_CHAT_COMPLETIONS_URL =
  "https://api.deepseek.com/v1/chat/completions";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type DeepseekChatCompletionOptions = {
  apiKey: string;
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  /** Ask API for a JSON object in the assistant message. */
  responseFormatJsonObject?: boolean;
};

export type DeepseekChatCompletionResult = {
  /** Raw assistant message content (JSON string if responseFormatJsonObject). */
  content: string;
  model: string;
};

/**
 * Minimal DeepSeek chat-completions client (OpenAI-compatible).
 * Uses global `fetch` (Node 18+).
 */
export async function deepseekChatCompletion(
  options: DeepseekChatCompletionOptions
): Promise<DeepseekChatCompletionResult> {
  const {
    apiKey,
    model = "deepseek-chat",
    messages,
    temperature = 0,
    responseFormatJsonObject = false
  } = options;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature
  };
  if (responseFormatJsonObject) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(DEEPSEEK_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`DeepSeek API ${res.status}: ${text}`);
  }

  interface DeepseekChatCompletionJson {
    model?: string;
    choices?: Array<{ message?: { content?: string | null } }>;
  }

  let data: DeepseekChatCompletionJson;
  try {
    data = JSON.parse(text) as DeepseekChatCompletionJson;
  } catch {
    throw new Error(`DeepSeek returned non-JSON: ${text.slice(0, 500)}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (content == null || content === "") {
    throw new Error("DeepSeek returned empty assistant content");
  }

  return {
    content,
    model: typeof data.model === "string" ? data.model : model
  };
}
