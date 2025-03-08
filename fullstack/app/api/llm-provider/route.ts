import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get the current LLM provider from environment variable, default to "DeepSeek"
    const currentProvider = process.env.CURRENT_LLM_PROVIDER || "DeepSeek";

    // Return the provider name with proper capitalization
    const formattedProvider =
      currentProvider.toLowerCase() === "deepseek"
        ? "DeepSeek"
        : currentProvider.toLowerCase() === "anthropics"
        ? "Anthropics"
        : "Unknown";

    return NextResponse.json({
      success: true,
      provider: formattedProvider,
    });
  } catch (error) {
    console.error("Error getting LLM provider:", error);
    return NextResponse.json(
      {
        success: false,
        provider: "Unknown",
      },
      { status: 500 }
    );
  }
}
