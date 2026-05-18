import { NextResponse, type NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { z } from "zod";
import { buildGhlPayload, postLeadToGhl } from "@/lib/ghl";
import { FEELINGS, SERVICES, type Feeling, type ServiceId } from "@/lib/constants";

const serviceIds = SERVICES.map((s) => s.id) as [ServiceId, ...ServiceId[]];

const LeadInputSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(6).max(40),
  email: z.string().email().optional().or(z.literal("")),
  service: z.enum(serviceIds),
  feeling: z.enum(FEELINGS as readonly Feeling[] as [Feeling, ...Feeling[]]),
  quizAnswers: z.record(z.string(), z.string()).default({}),
  /** dataURL base64 de la foto (image/*) — opcional para personalización. */
  photoDataUrl: z.string().optional(),
  /** O bien una URL pública ya subida. */
  photoUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.GHL_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { ok: false, error: "GHL_WEBHOOK_URL no configurado" },
      { status: 500 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = LeadInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const input = parsed.data;

  // 1) Subir foto a Vercel Blob si vino como dataURL.
  let photoUrl = input.photoUrl ?? "";
  if (!photoUrl && input.photoDataUrl) {
    photoUrl = await uploadDataUrlToBlob(input.photoDataUrl).catch((e) => {
      // No bloquear el lead por fallar el upload; logueamos y seguimos sin URL.
      console.error("Blob upload failed:", e);
      return "";
    });
  }

  // 2) Construir payload y enviar al webhook GHL con retry.
  const payload = buildGhlPayload({
    name: input.name,
    phone: input.phone,
    email: input.email ?? "",
    service: input.service,
    photoUrl: photoUrl || "",
    quizAnswers: input.quizAnswers,
    feeling: input.feeling,
  });

  const result = await postLeadToGhl(payload, webhookUrl);

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        retries: result.retries,
        status: result.status,
        error: result.error,
        // Devolvemos el payload para que el cliente lo guarde en sessionStorage y reintente.
        payload,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    retries: result.retries,
    photoUrl,
  });
}

async function uploadDataUrlToBlob(dataUrl: string): Promise<string> {
  // dataUrl: data:image/jpeg;base64,xxxxxxxx
  const match = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) throw new Error("invalid_data_url");
  const mime = match[1];
  const ext = mime.split("/")[1].replace("+xml", "");
  const buf = Buffer.from(match[2], "base64");
  const blob = new Blob([new Uint8Array(buf)], { type: mime });
  const filename = `leads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  // `addRandomSuffix: false` porque ya añadimos sufijo manualmente.
  const out = await put(filename, blob, {
    access: "public",
    addRandomSuffix: false,
  });
  return out.url;
}
