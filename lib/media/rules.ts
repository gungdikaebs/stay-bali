export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MIN_IMAGE_WIDTH = 800;
export const MIN_IMAGE_HEIGHT = 600;
export const MAX_IMAGE_DIMENSION = 6000;
export const MAX_PROPERTY_MEDIA = 20;

const supportedFormats = new Set(["jpeg", "png", "webp"]);

export type ImageMetadataInput = {
  format?: string;
  width?: number;
  height?: number;
};

export function getImageValidationIssues(
  sizeBytes: number,
  metadata: ImageMetadataInput,
) {
  const issues: string[] = [];
  if (sizeBytes < 1 || sizeBytes > MAX_IMAGE_BYTES) {
    issues.push("Image must be no larger than 5 MB.");
  }
  if (!metadata.format || !supportedFormats.has(metadata.format)) {
    issues.push("Image content must be JPEG, PNG, or WebP.");
  }
  if (
    !metadata.width ||
    !metadata.height ||
    metadata.width < MIN_IMAGE_WIDTH ||
    metadata.height < MIN_IMAGE_HEIGHT ||
    metadata.width > MAX_IMAGE_DIMENSION ||
    metadata.height > MAX_IMAGE_DIMENSION
  ) {
    issues.push("Image dimensions must be between 800×600 and 6000×6000 pixels.");
  }
  return issues;
}
