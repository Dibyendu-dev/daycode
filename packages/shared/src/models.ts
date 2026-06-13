export type ModelPricing = {
    inputUSDPerMillionTokens: number;
    outputUSDPerMillionTokens: number;

}

export type SupportedProvider = "anthropic" | "openai" | "google" | "deepseek";

type SupportedChatModelDefination = {
    id : string;
    provider: SupportedProvider;
    pricing: ModelPricing;
}

export const SUPPORTED_CHAT_MODELS = [
    {
         id: "gemini-3.5-flash",
         provider: "google",
         pricing: {
             inputUSDPerMillionTokens: 3,
             outputUSDPerMillionTokens: 15,
         },
         

    },
    {
         id: "gemini-2.0-flash",
         provider: "google",
         pricing: {
             inputUSDPerMillionTokens: 3,
             outputUSDPerMillionTokens: 15,
         },
         

    },
     {
         id: "gemini-3.1-pro-preview",
         provider: "google",
         pricing: {
             inputUSDPerMillionTokens: 3,
             outputUSDPerMillionTokens: 15,
         },
         

    },
    {
         id: "claude-sonnet-4-6",
         provider: "anthropic",
         pricing: {
             inputUSDPerMillionTokens: 3,
             outputUSDPerMillionTokens: 15,
         },

    },
    {
         id: "claude-haiku-4-5",
         provider: "anthropic",
         pricing: {
             inputUSDPerMillionTokens: 1,
             outputUSDPerMillionTokens: 5,
         },

    },
    {
         id: "claude-opus-4-6",
         provider: "anthropic",
         pricing: {
             inputUSDPerMillionTokens: 5,
             outputUSDPerMillionTokens: 25,
         },
    },
    {
         id: "gpt-5.4",
         provider: "openai",
         pricing: {
             inputUSDPerMillionTokens: 2.5,
             outputUSDPerMillionTokens: 15,
         },
    },
    {
         id: "gpt-5.4-mini",
         provider: "openai",
         pricing: {
             inputUSDPerMillionTokens: 0.75,
             outputUSDPerMillionTokens: 4.5,
         },
    },
    {
         id: "gpt-5.4-nano",
         provider: "openai",
         pricing: {
             inputUSDPerMillionTokens: 0.2,
             outputUSDPerMillionTokens: 1.25,
         },
    },
    {
         id: "deepseek-chat",
         provider: "deepseek",
         pricing: {
             inputUSDPerMillionTokens: 0.27,
             outputUSDPerMillionTokens: 1.10,
         },
    },
] as const satisfies readonly SupportedChatModelDefination[];

export type SupportedChatModel = (typeof SUPPORTED_CHAT_MODELS) [number];

export type SupportedChatModelId = SupportedChatModel["id"];

export function findSupportedChatModel(modelId: string) {
    return SUPPORTED_CHAT_MODELS.find((model)=>model.id === modelId)
}

export const DEFAULT_CHAT_MODEL_ID:SupportedChatModelId = "gemini-3.5-flash";