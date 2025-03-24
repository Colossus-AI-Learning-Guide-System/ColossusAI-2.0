import { NextResponse } from "next/server";

// Define the API base URL for the real backend
const API_BASE_URL = "http://127.0.0.1:5002";

export async function GET() {
  try {
    // Try to fetch documents from the real backend
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/document/documents-with-metadata`
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.log("Backend API not available in documents-with-metadata route");
    }

    // If backend unavailable, return empty array instead of mock data
    return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching documents with metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
