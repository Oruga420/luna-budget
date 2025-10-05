import { NextRequest, NextResponse } from "next/server";
import { put, head } from "@vercel/blob";

export const runtime = "edge";

const BLOB_KEY = "luna-budget-data.json";

// GET - Fetch data from blob storage
export async function GET() {
  try {
    // Check if blob exists
    const blobInfo = await head(BLOB_KEY);

    if (!blobInfo) {
      // Return empty data structure if no blob exists yet
      return NextResponse.json({
        settings: null,
        entries: [],
        fixedExpenses: [],
        categories: [],
      });
    }

    // Fetch the blob data
    const response = await fetch(blobInfo.url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);

    // Return empty data structure on error
    return NextResponse.json({
      settings: null,
      entries: [],
      fixedExpenses: [],
      categories: [],
    });
  }
}

// POST - Save data to blob storage
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate data structure
    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(BLOB_KEY, JSON.stringify(data), {
      access: "public",
      contentType: "application/json",
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    );
  }
}
