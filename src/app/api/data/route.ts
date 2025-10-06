import { NextRequest, NextResponse } from "next/server";
import { put, head, list } from "@vercel/blob";

export const runtime = "edge";

const BLOB_KEY = "luna-budget-data.json";

// GET - Fetch data from blob storage
export async function GET() {
  try {
    console.log("GET /api/data - Fetching blob...");

    // List all blobs to find our data file
    const { blobs } = await list({
      prefix: "luna-budget-data",
    });

    if (blobs.length === 0) {
      console.log("No blob found (first time), returning empty data");
      return NextResponse.json({
        settings: null,
        entries: [],
        fixedExpenses: [],
        categories: [],
      });
    }

    // Get the most recent blob (in case there are multiple)
    const latestBlob = blobs.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];

    console.log("Blob found, fetching data from:", latestBlob.url);

    // Fetch the blob data
    const response = await fetch(latestBlob.url);

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
    console.log("POST /api/data - Starting save...");
    const data = await request.json();

    console.log("POST /api/data - Data received:", {
      hasSettings: !!data.settings,
      entriesCount: data.entries?.length || 0,
      fixedExpensesCount: data.fixedExpenses?.length || 0,
      categoriesCount: data.categories?.length || 0,
    });

    // Validate data structure
    if (!data || typeof data !== "object") {
      console.error("POST /api/data - Invalid data format");
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    console.log("POST /api/data - Uploading to blob...");

    // Upload to Vercel Blob
    const blob = await put(BLOB_KEY, JSON.stringify(data), {
      access: "public",
      contentType: "application/json",
    });

    console.log("POST /api/data - Blob created successfully:", {
      url: blob.url,
      key: BLOB_KEY,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error) {
    console.error("POST /api/data - Error saving data:", error);
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    );
  }
}
