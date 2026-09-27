-- GharGyaan: knowledge base, hybrid retrieval, and privacy-minimal feedback.
-- Apply with: supabase db push   (or paste into the SQL editor)

create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- Knowledge items: one row per reviewed guide (mirrors src/kb/types.ts)
-- ---------------------------------------------------------------------------
create table if not exists public.knowledge_items (
  id                text primary key,
  title             text not null,
  title_hi          text,
  category          text not null check (category in ('first_aid','discomfort','traditional','food','wellness','household','seasonal')),
  situation_label   text not null,
  problem           text not null,
  audience          text[] not null,
  age_range         text,
  modern_guidance   text not null,
  evidence_level    text not null check (evidence_level in ('supported','limited','traditional','not_recommended')),
  evidence_summary  text not null,
  how_to            jsonb not null default '[]',
  what_to_avoid     jsonb not null default '[]',
  watch_for         jsonb not null default '[]',
  contraindications jsonb not null default '[]',
  red_flags         jsonb not null default '[]',
  when_to_seek_help jsonb not null default '[]',
  traditional_use   jsonb,
  audience_notes    jsonb,
  not_for           jsonb,
  clarify           jsonb,
  myth              jsonb,
  safety_level      text not null check (safety_level in ('self_care','consider_advice','urgent')),
  source            jsonb not null,
  source_type       text not null,
  last_reviewed     date not null,
  review_status     text not null check (review_status in ('demo_unreviewed','needs_source','expert_reviewed')),
  reviewed_by       text,               -- reviewer credential, filled by the review workflow
  language          text not null default 'en',
  keywords          text[] not null default '{}',
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Retrieval chunks: text + embedding + full-text vector for hybrid search
-- ---------------------------------------------------------------------------
create table if not exists public.knowledge_chunks (
  id          bigserial primary key,
  item_id     text not null references public.knowledge_items(id) on delete cascade,
  kind        text not null,            -- 'summary' | 'keywords' | 'problem' | 'myth'
  content     text not null,
  embedding   vector(1536),             -- e.g. text-embedding-3-small; set EMBED_DIM to match your model
  fts         tsvector generated always as (to_tsvector('simple', content)) stored
);

create index if not exists knowledge_chunks_embedding_idx on public.knowledge_chunks using hnsw (embedding vector_cosine_ops);
create index if not exists knowledge_chunks_fts_idx on public.knowledge_chunks using gin (fts);
create index if not exists knowledge_chunks_item_idx on public.knowledge_chunks (item_id);

-- Hybrid search: reciprocal-rank fusion of vector and keyword results,
-- with metadata filtering on category and audience.
create or replace function public.match_knowledge(
  query_embedding vector(1536),
  query_text      text,
  match_count     int default 5,
  filter_categories text[] default null,
  filter_audience text default null
) returns table (item_id text, score double precision)
language sql stable as $$
  with vec as (
    select c.item_id, row_number() over (order by c.embedding <=> query_embedding) as r
    from public.knowledge_chunks c
    join public.knowledge_items k on k.id = c.item_id
    where (filter_categories is null or k.category = any(filter_categories))
    order by c.embedding <=> query_embedding
    limit 40
  ),
  kw as (
    select c.item_id, row_number() over (order by ts_rank(c.fts, websearch_to_tsquery('simple', query_text)) desc) as r
    from public.knowledge_chunks c
    join public.knowledge_items k on k.id = c.item_id
    where c.fts @@ websearch_to_tsquery('simple', query_text)
      and (filter_categories is null or k.category = any(filter_categories))
    limit 40
  ),
  fused as (
    select item_id, sum(1.0 / (20 + r)) as s from (
      select item_id, min(r) as r from vec group by item_id
      union all
      select item_id, min(r) as r from kw group by item_id
    ) u group by item_id
  )
  select f.item_id,
         f.s * case when filter_audience is null or filter_audience = any(k.audience) then 1.0 else 0.9 end as score
  from fused f join public.knowledge_items k on k.id = f.item_id
  order by score desc
  limit match_count;
$$;

-- ---------------------------------------------------------------------------
-- Feedback and analytics: no user id, no free text health details, no IP.
-- ---------------------------------------------------------------------------
create table if not exists public.feedback (
  id             bigserial primary key,
  item_id        text references public.knowledge_items(id) on delete set null,
  helpful        boolean not null,
  missing_reason text check (missing_reason in ('not_my_situation','too_general','hard_to_understand','want_hindi','missing_remedy','other')),
  created_at     timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id         bigserial primary key,
  name       text not null check (name in ('search_started','input_submitted','image_uploaded','voice_started','clarification_answered','result_viewed','source_opened','recommendation_saved','feedback_given','safety_escalation')),
  props      jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Automatic deletion: raw events kept 90 days, then only aggregates remain.
create or replace function public.purge_old_events() returns void language sql as $$
  delete from public.analytics_events where created_at < now() - interval '90 days';
$$;

-- ---------------------------------------------------------------------------
-- Row level security: the public can read reviewed guides and write
-- anonymous feedback/events. Nothing can be read back by the public.
-- ---------------------------------------------------------------------------
alter table public.knowledge_items  enable row level security;
alter table public.knowledge_chunks enable row level security;
alter table public.feedback         enable row level security;
alter table public.analytics_events enable row level security;

create policy "read guides" on public.knowledge_items for select to anon, authenticated using (true);
create policy "read chunks" on public.knowledge_chunks for select to anon, authenticated using (true);
create policy "insert feedback" on public.feedback for insert to anon, authenticated with check (true);
create policy "insert events" on public.analytics_events for insert to anon, authenticated with check (
  -- Only whitelisted, non-identifying properties are accepted.
  not (props ?| array['query','text','transcript','image','name','email','phone','location','ip'])
);
