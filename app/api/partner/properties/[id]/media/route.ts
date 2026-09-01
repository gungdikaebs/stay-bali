import { addOwnedPropertyMedia } from "@/lib/media/property-media";
import { MAX_IMAGE_BYTES } from "@/lib/media/rules";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = MAX_IMAGE_BYTES * 10 + 1_000_000;

function safeUploadMessage(error: unknown) {
  if (!(error instanceof Error)) return "Images could not be uploaded.";
  const safePrefixes = [
    "Image ",
    "The image ",
    "The uploaded ",
    "Upload ",
    "A property ",
    "Property media ",
  ];
  return safePrefixes.some((prefix) => error.message.startsWith(prefix))
    ? error.message
    : "Images could not be uploaded. Please try again.";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Invalid upload origin." }, { status: 403 });
  }
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return Response.json({ error: "The upload request is too large." }, { status: 413 });
  }

  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const files = formData.getAll("images").filter((value): value is File => value instanceof File);
    const altTextValue = formData.get("altText");
    const altText = typeof altTextValue === "string" ? altTextValue.slice(0, 255) : undefined;
    await addOwnedPropertyMedia(id, files, altText);
    return Response.json({ uploaded: files.length }, { status: 201 });
  } catch (error) {
    return Response.json({ error: safeUploadMessage(error) }, { status: 400 });
  }
}
