"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createPost,
  getPostsFeed,
  type PostMedia,
  type PostResponse,
} from "../../lib/api";
import { useSession } from "../../shared/model/session";
import LoadingScreen from "../../shared/ui/LoadingScreen";
import { SiteHeader } from "../../widgets/site/SiteHeader";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { Panel } from "../../shared/ui/Panel";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { TaskHints } from "../../features/game/ui/TaskHints";

const POST_TYPES = ["short", "signal", "story", "clue"] as const;
const MEDIA_TYPES = ["image", "video", "audio", "link"] as const;
const MAX_POST_TEXT = 2000;
const DRAFT_KEY = "metahunt-post-draft-v1";

type PostType = (typeof POST_TYPES)[number];
type MediaType = (typeof MEDIA_TYPES)[number];

type PostDraft = {
  postType: PostType;
  text: string;
  mediaUrl: string;
  mediaType: MediaType;
  isAnonymous: boolean;
  boost: boolean;
  geoTile: string;
};

const POST_TYPE_HINTS: Record<PostType, string> = {
  short: "Короткий импульс в ленту.",
  signal: "Сигнал команде или фракции.",
  story: "Развернутый пост с контекстом.",
  clue: "Подсказка или наводка по карте.",
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("ru-RU");
}

function parseHttpUrl(value: string): URL | null {
  if (!value.trim()) return null;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function PostsPage() {
  const router = useRouter();
  const { token, user, loading } = useSession();

  const [items, setItems] = useState<PostResponse[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [creating, setCreating] = useState(false);

  const [postType, setPostType] = useState<PostType>("short");
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [boost, setBoost] = useState(false);
  const [geoTile, setGeoTile] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);

  const parsedMediaUrl = useMemo(() => parseHttpUrl(mediaUrl), [mediaUrl]);
  const textLeft = MAX_POST_TEXT - text.length;

  useEffect(() => {
    if (!loading && !token) router.replace("/");
  }, [token, loading, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) {
        setDraftReady(true);
        return;
      }
      const draft = JSON.parse(raw) as Partial<PostDraft>;
      if (typeof draft.text === "string") setText(draft.text);
      if (typeof draft.mediaUrl === "string") setMediaUrl(draft.mediaUrl);
      if (typeof draft.geoTile === "string") setGeoTile(draft.geoTile);
      if (typeof draft.isAnonymous === "boolean") setIsAnonymous(draft.isAnonymous);
      if (typeof draft.boost === "boolean") setBoost(draft.boost);
      if (draft.postType && POST_TYPES.includes(draft.postType)) setPostType(draft.postType);
      if (draft.mediaType && MEDIA_TYPES.includes(draft.mediaType)) setMediaType(draft.mediaType);
    } catch {
      // ignore corrupted draft
    } finally {
      setDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !draftReady) return;
    const isEmptyDraft =
      !text.trim() &&
      !mediaUrl.trim() &&
      !geoTile.trim() &&
      !isAnonymous &&
      !boost &&
      postType === "short" &&
      mediaType === "image";

    if (isEmptyDraft) {
      window.localStorage.removeItem(DRAFT_KEY);
      return;
    }

    const payload: PostDraft = {
      postType,
      text,
      mediaUrl,
      mediaType,
      isAnonymous,
      boost,
      geoTile,
    };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  }, [draftReady, postType, text, mediaUrl, mediaType, isAnonymous, boost, geoTile]);

  const loadFeed = useCallback(
    async (cursor?: string, append = false) => {
      if (!token) return;
      if (append) setLoadingMore(true);
      else setLoadingFeed(true);

      setError(null);
      try {
        const response = await getPostsFeed(token, {
          cursor,
          limit: 15,
        });
        setItems((prev) => (append ? [...prev, ...response.items] : response.items));
        setNextCursor(response.next_cursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки ленты");
      } finally {
        setLoadingFeed(false);
        setLoadingMore(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const resetComposer = useCallback(() => {
    setText("");
    setMediaUrl("");
    setGeoTile("");
    setBoost(false);
    setIsAnonymous(false);
    setPostType("short");
    setMediaType("image");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  const handleCreate = useCallback(async () => {
    if (!token) return;

    const trimmedMediaUrl = mediaUrl.trim();
    const trimmedText = text.trim();
    const media: PostMedia[] = trimmedMediaUrl
      ? [{ url: trimmedMediaUrl, type: mediaType }]
      : [];

    if (!trimmedText && media.length === 0) {
      setError("Добавь текст или медиа.");
      return;
    }

    if (trimmedMediaUrl && !parsedMediaUrl) {
      setError("Укажи корректный URL для медиа (http/https).");
      return;
    }

    setCreating(true);
    setError(null);
    setInfo(null);
    try {
      const response = await createPost(token, {
        post_type: postType,
        text: trimmedText || undefined,
        media,
        is_anonymous: isAnonymous,
        geo_tile: geoTile.trim() || undefined,
        boost,
      });

      setItems((prev) => [response.post, ...prev]);
      setInfo(
        `Пост создан. Потрачено ${response.shards_spent} осколков${
          response.shards_rewarded ? `, получено +${response.shards_rewarded}` : ""
        }.`,
      );
      resetComposer();
      setTaskRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания поста");
    } finally {
      setCreating(false);
    }
  }, [
    token,
    text,
    mediaUrl,
    mediaType,
    postType,
    isAnonymous,
    geoTile,
    boost,
    parsedMediaUrl,
    resetComposer,
  ]);

  const canSubmit = Boolean(text.trim()) || Boolean(mediaUrl.trim());

  if (loading) {
    return <LoadingScreen />;
  }

  if (!token || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center text-text-muted">
        <p>Перенаправление...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-16">
      <SiteHeader />

      <div className="page-shell pt-8 space-y-6">
        <SectionHeading as="h1">Постинг</SectionHeading>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-start">
          <div className="space-y-6">
            <TaskHints token={token} screen="posts" refreshKey={taskRefreshKey} />

            <Panel variant="pink" className="space-y-4">
              <div className="text-xs uppercase tracking-[0.26em] text-text-dim">Новый пост</div>

            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                void handleCreate();
              }}
            >
              <label className="grid gap-1 text-xs text-text-dim">
                Тип поста
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value as PostType)}
                  className="aug-input w-full px-4 py-3 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/30"
                >
                  {POST_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-xs text-text-dim">{POST_TYPE_HINTS[postType]}</p>

              <textarea
                rows={5}
                maxLength={MAX_POST_TEXT}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    void handleCreate();
                  }
                }}
                className="aug-input w-full px-4 py-3 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/30"
                placeholder="Текст поста"
              />
              <div className="flex items-center justify-between text-xs text-text-dim">
                <span>Ctrl/Cmd + Enter для быстрой публикации</span>
                <span className={textLeft < 160 ? "text-brand-pink" : "text-text-dim"}>{text.length}/{MAX_POST_TEXT}</span>
              </div>

              <label className="grid gap-1 text-xs text-text-dim">
                Медиа URL
                <Input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://.../media.png"
                />
              </label>

              <label className="grid gap-1 text-xs text-text-dim">
                Тип медиа
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as MediaType)}
                  className="aug-input w-full px-4 py-3 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/30"
                >
                  {MEDIA_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              {mediaUrl.trim() && (
                <div
                  className={`rounded border px-3 py-2 text-xs ${parsedMediaUrl ? "border-brand-cyan/35 text-brand-cyan" : "border-brand-pink/45 text-brand-pink"}`}
                >
                  {parsedMediaUrl
                    ? `Превью: [${mediaType}] ${parsedMediaUrl.hostname}${parsedMediaUrl.pathname}`
                    : "URL некорректный: используйте http/https"}
                </div>
              )}

              <Input
                value={geoTile}
                onChange={(e) => setGeoTile(e.target.value)}
                placeholder="x421y778"
              />

              <label className="flex items-center justify-between gap-3 text-sm border border-meta-border rounded px-3 py-2">
                <span>Анонимно</span>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 accent-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between gap-3 text-sm border border-meta-border rounded px-3 py-2">
                <span>Boost</span>
                <input
                  type="checkbox"
                  checked={boost}
                  onChange={(e) => setBoost(e.target.checked)}
                  className="h-4 w-4 accent-cyan-400"
                />
              </label>

              <div className="flex gap-2">
                <Button type="submit" variant="cyan" size="md" disabled={creating || !canSubmit}>
                  {creating ? "..." : "Опубликовать"}
                </Button>
                <Button type="button" variant="neutral" size="md" onClick={resetComposer} disabled={creating}>
                  Очистить
                </Button>
              </div>
            </form>

            {error && (
              <div className="text-xs border border-brand-pink/45 bg-brand-pink/10 text-brand-pink rounded px-3 py-2">
                {error}
              </div>
            )}
            {info && (
              <div className="text-xs border border-brand-cyan/45 bg-brand-cyan/10 text-brand-cyan rounded px-3 py-2">
                {info}
              </div>
            )}
            </Panel>
          </div>

          <Panel className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.26em] text-text-dim">Лента</div>
              <Button variant="neutral" size="sm" onClick={() => loadFeed(undefined, false)} disabled={loadingFeed}>
                {loadingFeed ? "..." : "Обновить"}
              </Button>
            </div>

            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="text-sm text-text-muted">Постов пока нет.</div>
              ) : (
                items.map((post) => (
                  <article
                    key={post.id}
                    className="rounded-lg border border-meta-border bg-meta-surface/70 px-3 py-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="text-text-dim uppercase tracking-[0.16em]">
                        {post.is_anonymous
                          ? "ANON"
                          : `${post.author.nickname ?? "user"} ${post.author.archetype ? `(${post.author.archetype})` : ""}`}
                      </div>
                      <div className="text-text-dim">{formatDate(post.created_at)}</div>
                    </div>

                    <div className="text-sm text-text-primary whitespace-pre-wrap">{post.text ?? "—"}</div>

                    {post.media.length > 0 && (
                      <div className="space-y-1">
                        {post.media.map((m, idx) => (
                          <a
                            key={`${post.id}-${idx}`}
                            href={m.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-xs text-brand-cyan hover:underline"
                          >
                            [{m.type}] {m.url}
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-text-dim flex items-center gap-3">
                      <span>type: {post.post_type}</span>
                      <span>tile: {post.geo_tile ?? "—"}</span>
                      <span>views: {post.stats.views}</span>
                      <span>replies: {post.stats.replies}</span>
                    </div>
                  </article>
                ))
              )}
            </div>

            {nextCursor && (
              <Button
                variant="neutral"
                size="md"
                onClick={() => loadFeed(nextCursor, true)}
                disabled={loadingMore}
              >
                {loadingMore ? "..." : "Загрузить ещё"}
              </Button>
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}
