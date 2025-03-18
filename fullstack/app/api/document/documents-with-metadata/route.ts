import { NextResponse } from "next/server";
import { mockDocuments } from "@/app/api/mockData";

export async function GET() {
  try {
    // In a real application, you would fetch this data from your backend
    // For demo purposes, we'll just return the mock data
    return NextResponse.json(mockDocuments);
  } catch (error) {
    console.error("Error fetching documents with metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
