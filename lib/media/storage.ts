import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import path from "node:path";
import sharp, { type Metadata } from "sharp";
import { getImageValidationIssues, MAX_IMAGE_BYTES } from "@/lib/media/rules";

export type StagedImage = {
  stagingDirectory: string;
  files: Array<{ sourcePath: string; storageKey: string }>;
  keys: { original: string; display: string; thumbnail: string };
  sizeBytes: number;
  width: number;
  height: number;
};

function storageRoot() {
  return path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    process.env.MEDIA_STORAGE_ROOT?.trim() || "storage/media",
  );
}

function datedKey(folder: string, id: string) {
  const date = new Date();
  return path.posix.join(
    folder,
    String(date.getUTCFullYear()),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    `${id}.webp`,
  );
}

export function resolveStorageKey(storageKey: string) {
  const root = storageRoot();
  const resolved = path.resolve(/* turbopackIgnore: true */ root, storageKey);
  if (!resolved.startsWith(`${root}${path.sep}`)) throw new Error("Invalid media storage key.");
  return resolved;
}

export async function stageImage(file: File): Promise<StagedImage> {
  if (file.size < 1 || file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be no larger than 5 MB.");
  }

  const input = Buffer.from(await file.arrayBuffer());
  let metadata: Metadata;
  try {
    metadata = await sharp(input, { failOn: "error", limitInputPixels: 36_000_000 }).metadata();
  } catch {
    throw new Error("The uploaded file is not a valid image.");
  }

  const issues = getImageValidationIssues(file.size, metadata);
  if (issues.length) throw new Error(issues.join(" "));

  const root = storageRoot();
  const stagingRoot = path.join(root, ".staging");
  await mkdir(stagingRoot, { recursive: true });
  const stagingDirectory = await mkdtemp(path.join(stagingRoot, "upload-"));
  const id = randomUUID();
  const keys = {
    original: datedKey("originals", `${id}-original`),
    display: datedKey("display", `${id}-display`),
    thumbnail: datedKey("thumbnails", `${id}-thumbnail`),
  };
  const files = [
    { sourcePath: path.join(stagingDirectory, "original.webp"), storageKey: keys.original },
    { sourcePath: path.join(stagingDirectory, "display.webp"), storageKey: keys.display },
    { sourcePath: path.join(stagingDirectory, "thumbnail.webp"), storageKey: keys.thumbnail },
  ];

  try {
    await Promise.all([
      sharp(input).rotate().webp({ quality: 90 }).toFile(files[0].sourcePath),
      sharp(input).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toFile(files[1].sourcePath),
      sharp(input).rotate().resize({ width: 480, height: 360, fit: "cover" }).webp({ quality: 76 }).toFile(files[2].sourcePath),
    ]);
  } catch {
    await rm(stagingDirectory, { recursive: true, force: true });
    throw new Error("The image could not be processed.");
  }

  return {
    stagingDirectory,
    files,
    keys,
    sizeBytes: file.size,
    width: metadata.width!,
    height: metadata.height!,
  };
}

export async function commitStagedImage(staged: StagedImage) {
  const committedPaths: string[] = [];
  try {
    for (const file of staged.files) {
      const destination = resolveStorageKey(file.storageKey);
      await mkdir(path.dirname(destination), { recursive: true });
      await rename(file.sourcePath, destination);
      committedPaths.push(destination);
    }
    await rm(staged.stagingDirectory, { recursive: true, force: true });
    return committedPaths;
  } catch (error) {
    await Promise.all(committedPaths.map((filePath) => rm(filePath, { force: true })));
    await rm(staged.stagingDirectory, { recursive: true, force: true });
    throw error;
  }
}

export async function discardStagedImage(staged: StagedImage) {
  await rm(staged.stagingDirectory, { recursive: true, force: true });
}

export async function removeCommittedFiles(filePaths: string[]) {
  await Promise.all(filePaths.map((filePath) => rm(filePath, { force: true })));
}
