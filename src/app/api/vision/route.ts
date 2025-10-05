import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Available categories as per project plan
const AVAILABLE_CATEGORIES = [
  "renta",
  "internet",
  "celular",
  "comida",
  "transporte",
  "entretenimiento",
  "weed",
  "membresias",
  "otros",
];

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Check file size (max 4MB)
    if (imageFile.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 4MB" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = imageFile.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    console.log("Processing image with OpenAI Vision API...");

    // Call 1: Get item name description
    const descriptionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe brevemente el objeto/servicio principal visible en la foto en 10 palabras o menos para usarlo como nombre de ítem. Solo el nombre, sin precio. Si es un ticket o recibo, describe el producto o servicio comprado.",
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
                detail: "low",
              },
            },
          ],
        },
      ],
      max_tokens: 50,
      temperature: 0.3,
    });

    const itemName = descriptionResponse.choices[0]?.message?.content?.trim() || "";

    console.log("Item name extracted:", itemName);

    // Call 2: Get structured JSON data
    const structuredResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Devuelve solo JSON válido con el siguiente schema. Si no sabes un campo, usa null. No inventes precios. Las categorías disponibles son: ${AVAILABLE_CATEGORIES.join(", ")}.

{
  "item_name": "string",
  "category_suggestion": "one of: [${AVAILABLE_CATEGORIES.join(", ")}]",
  "notes": "string | null"
}`,
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
                detail: "low",
              },
            },
          ],
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const structuredContent = structuredResponse.choices[0]?.message?.content || "{}";

    console.log("Structured response:", structuredContent);

    let parsedData: {
      item_name?: string;
      category_suggestion?: string;
      notes?: string;
    };

    try {
      parsedData = JSON.parse(structuredContent);
    } catch (err) {
      console.error("Failed to parse OpenAI JSON response:", err);
      parsedData = {};
    }

    // Validate category suggestion
    const categorySuggestion =
      parsedData.category_suggestion &&
      AVAILABLE_CATEGORIES.includes(parsedData.category_suggestion)
        ? parsedData.category_suggestion
        : AVAILABLE_CATEGORIES[AVAILABLE_CATEGORIES.length - 1]; // Default to "otros"

    // Combine results
    const result = {
      item_name: itemName || parsedData.item_name || "Item sin nombre",
      category_suggestion: categorySuggestion,
      notes: parsedData.notes || null,
    };

    console.log("Final result:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing image:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to process image: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
