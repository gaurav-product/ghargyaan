// GharGyaan AI edge function (Supabase / Deno).
//
// The model has three narrow jobs and never writes medical steps:
//   summarize      – one or two warm sentences framing an already-selected guide
//   map            – pick ONE guide id from a fixed list (or null)
//   describe_image – describe visible, non-diagnostic context in a photo
//
// Keys live only here (never in the browser). Requests and responses are not
// logged. Every model output passes the same validator as the client.
//
// Deploy:  supabase functions deploy ghargyaan-ai
// Secrets: supabase secrets set ANTHROPIC_API_KEY=... [AI_MODEL=claude-haiku-4-5-20251001]
//          or OPENAI_API_KEY=... [AI_PROVIDER=openai AI_MODEL=gpt-4o-mini]

const CORS = {
  'access-control-allow-origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'access-control-allow-headers': 'authorization, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

const PROVIDER = Deno.env.get('AI_PROVIDER') ?? (Deno.env.get('ANTHROPIC_API_KEY') ? 'anthropic' : 'openai');
const MODEL = Deno.env.get('AI_MODEL') ?? (PROVIDER === 'anthropic' ? 'claude-haiku-4-5-20251001' : 'gpt-4o-mini');
const TIMEOUT_MS = 10_000;

const SYSTEM_BASE = `You support GharGyaan, an Indian everyday self-care information app. You are NOT a doctor.
Hard rules:
- Never diagnose. Never say "you have" a condition. Never name a disease as the cause.
- Never mention medicine names, doses, milligrams, tablets or prescriptions.
- Never say a remedy cures anything. Never tell someone they do not need a doctor.
- Never contradict or add to the guide you are given. Do not invent steps.
- Plain, warm, respectful language. Respect traditional practices without mocking them.`;

type Json = Record<string, unknown>;

async function callModel(system: string, content: unknown[], maxTokens = 160): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    if (PROVIDER === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          'content-type': 'application/json',
          'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content }] }),
      });
      if (!res.ok) throw new Error(`provider ${res.status}`);
      const j = await res.json();
      return (j.content ?? []).filter((b: Json) => b.type === 'text').map((b: Json) => b.text).join('').trim();
    }
    // OpenAI-compatible chat completions
    const oaContent = content.map((c) => {
      const b = c as Json;
      if (b.type === 'image') {
        const src = b.source as Json;
        return { type: 'image_url', image_url: { url: `data:${src.media_type};base64,${src.data}` } };
      }
      return b;
    });
    const res = await fetch(Deno.env.get('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY') ?? ''}` },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages: [{ role: 'system', content: system }, { role: 'user', content: oaContent }] }),
    });
    if (!res.ok) throw new Error(`provider ${res.status}`);
    const j = await res.json();
    return String(j.choices?.[0]?.message?.content ?? '').trim();
  } finally {
    clearTimeout(t);
  }
}

// Mirror of src/engine/outputSafety.ts (kept in sync by tests on the client copy).
const BANNED: RegExp[] = [
  /\b(you|he|she|they|your (child|baby|son|daughter)) (have|has|are suffering from|definitely have|likely have|probably have)\b.{0,40}\b(infection|disease|eczema|psoriasis|dermatitis|dengue|malaria|typhoid|covid|pneumonia|cancer|diabetes|fracture|allergy|asthma|migraine|ulcer|condition|disorder|syndrome|meningitis|appendicitis)\b/i,
  /\bthis (is|looks like|appears to be) (a |an )?(case of )?(infection|eczema|psoriasis|fungal|ringworm|cellulitis|melanoma|cancer|dengue|chickenpox|measles|scabies)\b/i,
  /\bi (can )?(diagnose|confirm)\b/i,
  /\b\d+(\.\d+)?\s?(mg|mcg|µg|milligrams?|ml|millilit(re|er)s?|tablets?|pills?|capsules?|drops|goli|goliyan)\b/i,
  /\b(take|give|use)\b.{0,20}\b(antibiotic|amoxicillin|azithromycin|steroid|prednisolone|codeine|tramadol|aspirin)\b/i,
  /\b(stop|quit|skip)\b.{0,20}\b(your|the|prescribed)\b.{0,20}\b(medicine|medication|tablets|insulin)\b/i,
  /\b(cures?|cured|guaranteed?|miracle|100% (safe|effective)|permanent(ly)? (fix|cure))\b/i,
  /\b(no need (to|for) (see|a) (a )?doctor|don'?t (need to )?(see|go to) (a )?doctor|avoid (the )?(doctor|hospital)|instead of (seeing )?(a )?doctor)\b/i,
];
const safe = (t: string) => t.length > 0 && t.length < 700 && !BANNED.some((r) => r.test(t));

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'content-type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  let body: { task?: string; input?: Json };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
  const input = body.input ?? {};
  try {
    switch (body.task) {
      case 'summarize': {
        const guide = input.guide as Json;
        const lang = input.language === 'hi' || input.language === 'hinglish' ? 'Use simple English that an Indian reader would find natural.' : '';
        const text = await callModel(
          `${SYSTEM_BASE}\nWrite 1–2 short sentences (max 45 words) that introduce the guide below to the person. Mention who it is for if given. ${lang}\nIf the guide is a myth check, start with its verdict. Output only the sentences.`,
          [{ type: 'text', text: JSON.stringify({ person_said: String(input.query ?? '').slice(0, 500), for: input.audience ?? 'unspecified', safety: input.safety, guide }) }],
        );
        return safe(text) ? json({ text }) : json({ error: 'unsafe_output' }, 422);
      }
      case 'map': {
        const candidates = (input.candidates as { id: string; title: string }[]).slice(0, 80);
        const text = await callModel(
          `${SYSTEM_BASE}\nChoose the ONE guide id that best matches what the person describes, or "none" if nothing fits or it could be an emergency. Output only the id.`,
          [{ type: 'text', text: `Person: ${String(input.query ?? '').slice(0, 500)}\nGuides:\n${candidates.map((c) => `${c.id}: ${c.title}`).join('\n')}` }],
          20,
        );
        const id = text.split(/\s/)[0].replace(/[^a-z0-9-]/gi, '');
        return json({ id: candidates.some((c) => c.id === id) ? id : null });
      }
      case 'describe_image': {
        const dataUrl = String(input.image ?? '');
        const m = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
        if (!m || m[2].length > 4_000_000) return json({ error: 'bad_image' }, 400);
        const text = await callModel(
          `${SYSTEM_BASE}\nDescribe only what is visibly present in plain words (e.g. "a small red area on the back of a hand", "a yellow stain on white cloth"). Do not guess causes or conditions. Max 20 words. If unclear, say "unclear photo".`,
          [
            { type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } },
            { type: 'text', text: 'Describe the visible context.' },
          ],
          60,
        );
        return safe(text) ? json({ text }) : json({ text: '' });
      }
      default:
        return json({ error: 'unknown_task' }, 400);
    }
  } catch (e) {
    // Client falls back to reviewed templates on any error.
    return json({ error: 'ai_unavailable', detail: (e as Error).message }, 503);
  }
});
