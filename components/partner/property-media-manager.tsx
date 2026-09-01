"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2 } from "lucide-react";
import {
  archivePropertyMediaAction,
  movePropertyMediaAction,
  setPropertyCoverAction,
} from "@/app/partner/properties/actions";

type PropertyMediaManagerProps = {
  propertyId: string;
  canEdit: boolean;
  media: Array<{
    mediaId: string;
    sortOrder: number;
    isCover: boolean;
    media: { altText: string | null };
  }>;
};

export function PropertyMediaManager({ propertyId, canEdit, media }: PropertyMediaManagerProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/partner/properties/${propertyId}/media`, {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const result = await response.json() as { error?: string; uploaded?: number };
      if (!response.ok) throw new Error(result.error || "Images could not be uploaded.");
      setMessage(`${result.uploaded ?? 0} image(s) uploaded successfully.`);
      formRef.current?.reset();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Images could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {media.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item, index) => (
            <article className="overflow-hidden rounded-2xl border border-border bg-white" key={item.mediaId}>
              <div className="relative aspect-[4/3] bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="size-full object-cover" alt={item.media.altText || `Property image ${index + 1}`} src={`/media/${item.mediaId}/thumbnail`} />
                {item.isCover ? <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary shadow"><Star className="size-3.5 fill-current" />Cover</span> : null}
              </div>
              <div className="p-3">
                <p className="truncate text-xs text-muted-foreground">{item.media.altText || "No alt text"}</p>
                {canEdit ? <div className="mt-3 flex flex-wrap gap-2">
                  {!item.isCover ? <form action={setPropertyCoverAction}><input name="propertyId" type="hidden" value={propertyId} /><input name="mediaId" type="hidden" value={item.mediaId} /><button className="rounded-lg border border-border p-2 text-primary hover:bg-secondary" title="Set as cover" type="submit"><Star className="size-4" /></button></form> : null}
                  <form action={movePropertyMediaAction}><input name="propertyId" type="hidden" value={propertyId} /><input name="mediaId" type="hidden" value={item.mediaId} /><input name="direction" type="hidden" value="up" /><button className="rounded-lg border border-border p-2 hover:bg-secondary disabled:opacity-30" disabled={index === 0} title="Move left" type="submit"><ArrowLeft className="size-4" /></button></form>
                  <form action={movePropertyMediaAction}><input name="propertyId" type="hidden" value={propertyId} /><input name="mediaId" type="hidden" value={item.mediaId} /><input name="direction" type="hidden" value="down" /><button className="rounded-lg border border-border p-2 hover:bg-secondary disabled:opacity-30" disabled={index === media.length - 1} title="Move right" type="submit"><ArrowRight className="size-4" /></button></form>
                  <form action={archivePropertyMediaAction} className="ml-auto"><input name="propertyId" type="hidden" value={propertyId} /><input name="mediaId" type="hidden" value={item.mediaId} /><button className="rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50" title="Archive image" type="submit"><Trash2 className="size-4" /></button></form>
                </div> : null}
              </div>
            </article>
          ))}
        </div>
      ) : <div className="rounded-2xl border border-dashed border-border bg-secondary/50 px-5 py-10 text-center text-sm text-muted-foreground">No property photos uploaded yet.</div>}

      {canEdit ? <form className="mt-6 grid gap-4 rounded-2xl border border-dashed border-primary/30 bg-brand-teal-subtle p-5 md:grid-cols-[1fr_1fr_auto] md:items-end" onSubmit={upload} ref={formRef}>
        <label className="text-sm font-bold">Property photos<input accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:font-bold file:text-primary" disabled={uploading} multiple name="images" required type="file" /></label>
        <label className="text-sm font-bold">Alt text <span className="font-normal text-muted-foreground">(applies to this batch)</span><input className="mt-2 h-10 w-full rounded-xl border border-border bg-white px-3 text-sm" disabled={uploading} maxLength={255} name="altText" placeholder="Pool and garden at sunset" /></label>
        <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white disabled:opacity-60" disabled={uploading || media.length >= 20} type="submit"><ImagePlus className="size-4" />{uploading ? "Processing…" : "Upload photos"}</button>
        <p className={`text-xs md:col-span-3 ${message.toLowerCase().includes("success") ? "text-success" : "text-red-700"}`} role="status">{message || "JPEG, PNG, or WebP · maximum 5 MB each · 800×600 to 6000×6000 · maximum 20 photos."}</p>
      </form> : null}
    </div>
  );
}
