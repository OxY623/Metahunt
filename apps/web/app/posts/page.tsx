"use client";

import { useCallback, useEffect, useState } from "react";
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

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString("ru-RU");
  } catch {
    return value;
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

  const [postType, setPostType] = useState("short");
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [boost, setBoost] = useState(false);
  const [geoTile, setGeoTile] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !token) router.replace("/");
  }, [token, loading, router]);

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

  const handleCreate = useCallback(async () => {
    if (!token) return;

    const trimmedText = text.trim();
    const media: PostMedia[] = mediaUrl.trim()
      ? [{ url: mediaUrl.trim(), type: mediaType.trim() || "image" }]
      : [];

    if (!trimmedText && media.length === 0) {
      setError("Добавь текст или media.");
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
      setInfo(`Пост создан. Потрачено ${response.shards_spent} shards.`);

      setText("");
      setMediaUrl("");
      setGeoTile("");
      setBoost(false);
      setIsAnonymous(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания поста");
    } finally {
      setCreating(false);
    }
  }, [token, text, mediaUrl, mediaType, postType, isAnonymous, geoTile, boost]);

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
          <Panel variant="pink" className="space-y-4">
            <div className="text-xs uppercase tracking-[0.26em] text-text-dim">Новый пост</div>

            <div className="grid gap-3">
              <Input value={postType} onChange={(e) => setPostType(e.target.value)} placeholder="short" />

              <textarea
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="aug-input w-full px-4 py-3 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/30"
                placeholder="Текст поста"
              />

              <Input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://.../media.png"
              />

              <Input
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                placeholder="image"
              />

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

              <Button variant="cyan" size="md" onClick={handleCreate} disabled={creating}>
                {creating ? "..." : "Опубликовать"}
              </Button>
            </div>

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

                    <div className="text-sm text-text-primary whitespace-pre-wrap">
                      {post.text ?? "—"}
                    </div>

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
