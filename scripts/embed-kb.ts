/**
 * Fill knowledge_chunks.embedding using an embeddings API.
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
 * Optional: EMBED_MODEL (default text-embedding-3-small, 1536 dims)
 *   npm run kb:embed
 * Not run in the prototype (no keys); the app's demo mode uses local
 * character-trigram vectors with the same retrieval interface.
 */
const need = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing ${k}`);
  return v;
};
const SUPABASE_URL = need('SUPABASE_URL');
const SERVICE = need('SUPABASE_SERVICE_ROLE_KEY');
const OPENAI = need('OPENAI_API_KEY');
const MODEL = process.env.EMBED_MODEL ?? 'text-embedding-3-small';

const rest = (path: string, init: RequestInit = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SERVICE, authorization: `Bearer ${SERVICE}`, 'content-type': 'application/json', ...(init.headers ?? {}) } });

const chunks: { id: number; content: string }[] = await (await rest('knowledge_chunks?select=id,content&embedding=is.null')).json();
console.log(`${chunks.length} chunks to embed`);
for (let i = 0; i < chunks.length; i += 64) {
  const batch = chunks.slice(i, i + 64);
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { authorization: `Bearer ${OPENAI}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, input: batch.map((c) => c.content) }),
  });
  if (!r.ok) throw new Error(`embeddings ${r.status}`);
  const { data } = (await r.json()) as { data: { embedding: number[] }[] };
  await Promise.all(batch.map((c, n) => rest(`knowledge_chunks?id=eq.${c.id}`, { method: 'PATCH', body: JSON.stringify({ embedding: data[n].embedding }) })));
  console.log(`embedded ${Math.min(i + 64, chunks.length)}/${chunks.length}`);
}
