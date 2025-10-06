import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
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

    console.log("Processing image with Groq Llama 4 Maverick...");

    // Single call with JSON mode to get all data
    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analiza esta imagen de un recibo, ticket o producto y extrae la información en formato JSON.

INSTRUCCIONES CRÍTICAS PARA EL MONTO:
1. Lee TODO el texto del recibo de ARRIBA A ABAJO
2. Busca el MONTO FINAL que pagó el cliente (el último monto, después de todos los impuestos)
3. IGNORA subtotales, ignora montos antes de taxes
4. El monto correcto es el que aparece DESPUÉS de HST/GST/Sales Tax
5. Busca etiquetas como: "Net total", "Total", "Amount due", "Final amount", "Payment"
6. Si hay HST 13% $2.42, el monto correcto es el MAYOR (después del impuesto)

Devuelve un objeto JSON con esta estructura exacta:
{
  "item_name": "nombre corto del establecimiento o servicio (máximo 10 palabras)",
  "amount": número decimal o null si no lo encuentras (ejemplo: 21.00, NO strings),
  "category_suggestion": "una de estas categorías: ${AVAILABLE_CATEGORIES.join(", ")}",
  "notes": "observaciones adicionales o null"
}

REGLAS IMPORTANTES:
- "amount" debe ser un NÚMERO, no string
- SIEMPRE usa el monto DESPUÉS de impuestos (el más grande)
- Si ves "Period 0d6h38' $21.00" Y "H.S.T 13% $2.42" Y "Net total $18.58", usa 21.00 (es el Gross total)
- Si ves "Gross total $21.00", usa 21.00
- Si ves "Net total $18.58" y NO hay Gross total, usa 18.58
- El "Net total" puede ser ANTES de impuestos, busca el monto más grande al final
- Para estacionamiento/parking, usa categoría "transporte"
- Para restaurantes/comida, usa "comida"`,
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      temperature: 0.3,
      max_completion_tokens: 300,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "{}";
    console.log("Groq response:", content);

    let parsedData: {
      item_name?: string;
      amount?: number | null;
      category_suggestion?: string;
      notes?: string;
    };

    try {
      parsedData = JSON.parse(content);
    } catch (err) {
      console.error("Failed to parse Groq JSON response:", err);
      parsedData = {};
    }

    // Validate category suggestion
    const categorySuggestion =
      parsedData.category_suggestion &&
      AVAILABLE_CATEGORIES.includes(parsedData.category_suggestion)
        ? parsedData.category_suggestion
        : AVAILABLE_CATEGORIES[AVAILABLE_CATEGORIES.length - 1]; // Default to "otros"

    // Build result
    const result = {
      item_name: parsedData.item_name || "Item sin nombre",
      amount: typeof parsedData.amount === 'number' ? parsedData.amount : null,
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
