import { NextRequest, NextResponse } from "next/server";
import { put, head } from "@vercel/blob";

export const runtime = "edge";

const BLOB_KEY = "luna-budget-data.json";

// GET - Fetch data from blob storage
export async function GET() {
  try {
    console.log("GET /api/data - Fetching blob...");

    // Try to get blob info
    let blobInfo;
    try {
      blobInfo = await head(BLOB_KEY);
    } catch (headError) {
      // Blob doesn't exist yet
      console.log("No blob found (first time), returning empty data");
      return NextResponse.json({
        settings: null,
        entries: [],
        fixedExpenses: [],
        categories: [],
      });
    }

    if (!blobInfo || !blobInfo.url) {
      console.log("Blob info invalid, returning empty data");
      return NextResponse.json({
        settings: null,
        entries: [],
        fixedExpenses: [],
        categories: [],
      });
    }

    console.log("Blob found, fetching data from:", blobInfo.url);

    // Fetch the blob data
    const response = await fetch(blobInfo.url);

    if (!response.ok) {
      console.error("Failed to fetch blob content:", response.status);
      return NextResponse.json({
        settings: null,
        entries: [],
        fixedExpenses: [],
        categories: [],
      });
    }

    const data = await response.json();

    console.log("Data fetched successfully:", {
      hasSettings: !!data.settings,
      entriesCount: data.entries?.length || 0,
      fixedExpensesCount: data.fixedExpenses?.length || 0,
      categoriesCount: data.categories?.length || 0,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/data:", error);

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
