import https from "node:https";

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

function isTlsVerificationError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as NodeJS.ErrnoException).code;
  return (
    code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
    code === "SELF_SIGNED_CERT_IN_CHAIN" ||
    error.message.includes("unable to verify the first certificate")
  );
}

function shouldUseInsecureTls(): boolean {
  if (process.env.DEEPSEEK_INSECURE_TLS === "true") return true;
  if (process.env.DEEPSEEK_INSECURE_TLS === "false") return false;
  // Windows/corporate networks often fail cert verification in local dev.
  return process.env.NODE_ENV !== "production";
}

function postJson(
  url: string,
  apiKey: string,
  body: string,
  insecureTls = shouldUseInsecureTls()
): Promise<{ status: number; text: string }> {
  const parsed = new URL(url);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: `${parsed.pathname}${parsed.search}`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        },
        rejectUnauthorized: !insecureTls
      },
      (res) => {
        let text = "";
        res.on("data", (chunk: Buffer | string) => {
          text += chunk.toString();
        });
        res.on("end", () => {
          resolve({ status: res.statusCode ?? 0, text });
        });
      }
    );

    req.on("error", reject);

    req.write(body);
    req.end();
  });
}

async function postJsonWithTlsFallback(
  url: string,
  apiKey: string,
  body: string
): Promise<{ status: number; text: string }> {
  const useInsecure = shouldUseInsecureTls();
  try {
    return await postJson(url, apiKey, body, useInsecure);
  } catch (error) {
    if (!useInsecure && isTlsVerificationError(error)) {
      return postJson(url, apiKey, body, true);
    }
    if (isTlsVerificationError(error)) {
      throw new Error(
        "DeepSeek TLS certificate verification failed. Set DEEPSEEK_INSECURE_TLS=true in apps/api/.env (development only)."
      );
    }
    throw error;
  }
}

/**
 * Minimal DeepSeek chat-completions client (OpenAI-compatible).
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

  const { status, text } = await postJsonWithTlsFallback(
    DEEPSEEK_CHAT_COMPLETIONS_URL,
    apiKey,
    JSON.stringify(body)
  );

  if (status < 200 || status >= 300) {
    throw new Error(`DeepSeek API ${status}: ${text}`);
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
