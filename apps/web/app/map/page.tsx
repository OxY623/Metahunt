"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getMapClusters,
  getMapTiles,
  mapCheckin,
  mapPing,
  searchMapLocation,
  type Archetype,
  type GeoTile,
  type MapCluster,
  type MapCheckinPayload,
} from "../../lib/api";
import { useSession } from "../../shared/model/session";
import { useGameProfile } from "../../shared/model/game-profile";
import LoadingScreen from "../../shared/ui/LoadingScreen";
import { SiteHeader } from "../../widgets/site/SiteHeader";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { Panel } from "../../shared/ui/Panel";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Badge } from "../../shared/ui/Badge";
import type { GeoMapViewport } from "../../widgets/map/GeoMap";

const GeoMap = dynamic(
  () => import("../../widgets/map/GeoMap").then((m) => m.GeoMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[460px] w-full rounded-xl border border-meta-border bg-meta-surface/70 flex items-center justify-center text-text-muted text-sm">
        Загрузка карты...
      </div>
    ),
  },
);

const TILE_FETCH_INTERVAL_MS = 8000;
const ACTION_INTERVAL_MS = 5000;

const VISIBILITY_OPTIONS: Array<MapCheckinPayload["visibility"]> = ["approx", "hidden", "exact"];
const ARCHETYPE_FILTERS: Array<"ALL" | Archetype> = ["ALL", "FOXY", "OXY", "BEAR", "OWL"];
const PING_PRESETS = ["hunt", "defense", "market", "danger"] as const;

function waitSeconds(ms: number): number {
  return Math.max(1, Math.ceil(ms / 1000));
}

function now(): number {
  return Date.now();
}

export default function MapPage() {
  const router = useRouter();
  const { token, user, loading } = useSession();
  const { profile, refresh: refreshProfile } = useGameProfile(token, Boolean(token));

  const [tiles, setTiles] = useState<GeoTile[]>([]);
  const [clusters, setClusters] = useState<MapCluster[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<GeoMapViewport | null>(null);
  const [lastCenter, setLastCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [mapFocus, setMapFocus] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [visibility, setVisibility] = useState<MapCheckinPayload["visibility"]>("approx");
  const [pingType, setPingType] = useState("hunt");

  const [archetypeFilter, setArchetypeFilter] = useState<"ALL" | Archetype>("ALL");
  const [minIntensity, setMinIntensity] = useState(0);

  const [loadingTiles, setLoadingTiles] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const lastTilesRequestAt = useRef(0);
  const lastActionAt = useRef(0);
  const [, setTicker] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTicker((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!loading && !token) router.replace("/");
  }, [token, loading, router]);

  const filteredTiles = useMemo(() => {
    return tiles.filter((tile) => {
      const passArchetype =
        archetypeFilter === "ALL" || tile.dominant_archetype === archetypeFilter;
      const passIntensity = tile.intensity >= minIntensity;
      return passArchetype && passIntensity;
    });
  }, [tiles, archetypeFilter, minIntensity]);

  const filteredClusters = useMemo(() => {
    return clusters.filter((cluster) => {
      const passArchetype =
        archetypeFilter === "ALL" || cluster.dominant_archetype === archetypeFilter;
      const passIntensity = cluster.intensity >= minIntensity;
      return passArchetype && passIntensity;
    });
  }, [clusters, archetypeFilter, minIntensity]);

  const selectedTile = useMemo(
    () => filteredTiles.find((tile) => tile.tile_id === selectedTileId) ?? null,
    [filteredTiles, selectedTileId],
  );

  const fetchTiles = useCallback(
    async (nextViewport: GeoMapViewport, force = false) => {
      if (!token) return;

      const delta = now() - lastTilesRequestAt.current;
      if (!force && delta < TILE_FETCH_INTERVAL_MS) {
        setInfo(`Обновление карты доступно через ${waitSeconds(TILE_FETCH_INTERVAL_MS - delta)} сек.`);
        return;
      }

      setLoadingTiles(true);
      setError(null);
      try {
        const data = await getMapTiles(token, {
          bbox: nextViewport.bbox,
          zoom: nextViewport.zoom,
        });
        const clusterData = await getMapClusters(token, {
          bbox: nextViewport.bbox,
          zoom: nextViewport.zoom,
        });
        setTiles(data.items);
        setClusters(clusterData.items);
        lastTilesRequestAt.current = now();
        setInfo(`Тайлы обновлены (${data.items.length}), кластеров: ${clusterData.items.length}.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки карты");
      } finally {
        setLoadingTiles(false);
      }
    },
    [token],
  );

  const onViewportChange = useCallback(
    (state: GeoMapViewport) => {
      setViewport(state);
      setLastCenter(state.center);
      fetchTiles(state, false);
    },
    [fetchTiles],
  );

  const runActionGuard = useCallback(() => {
    const delta = now() - lastActionAt.current;
    if (delta < ACTION_INTERVAL_MS) {
      throw new Error(`Подожди ${waitSeconds(ACTION_INTERVAL_MS - delta)} сек. перед следующим действием.`);
    }
    lastActionAt.current = now();
  }, []);

  const resolveCheckinPoint = useCallback(async (): Promise<{ lat: number; lng: number }> => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      try {
        const point = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            reject,
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 },
          );
        });
        return point;
      } catch {
        // ignore geolocation failures and fallback to map center
      }
    }

    if (lastCenter) return lastCenter;
    throw new Error("Не удалось определить координаты для check-in.");
  }, [lastCenter]);

  const handleCheckin = useCallback(async () => {
    if (!token) return;
    setActionLoading(true);
    setError(null);
    setInfo(null);
    try {
      runActionGuard();
      const point = await resolveCheckinPoint();
      const result = await mapCheckin(token, {
        geo: point,
        visibility,
      });

      setSelectedTileId(result.tile_id);
      setInfo(`Check-in выполнен. Tile ${result.tile_id}, энергия: ${result.energy_after}.`);

      if (viewport) {
        await fetchTiles(viewport, true);
      }
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка check-in");
    } finally {
      setActionLoading(false);
    }
  }, [token, runActionGuard, resolveCheckinPoint, visibility, viewport, fetchTiles, refreshProfile]);

  const handleSearch = useCallback(async () => {
    if (!token || !searchQuery.trim()) return;
    setLoadingTiles(true);
    setError(null);
    setInfo(null);
    try {
      const result = await searchMapLocation(token, {
        q: searchQuery.trim(),
        zoom: viewport?.zoom ?? 12,
      });
      setTiles(result.tiles);
      setClusters(result.clusters);
      setLastCenter(result.center);
      setMapFocus({ ...result.center, zoom: result.zoom });
      lastTilesRequestAt.current = now();
      setInfo(`Найдено: ${result.label}. Тайлов: ${result.tiles.length}, кластеров: ${result.clusters.length}.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Не удалось найти место. Используй координаты вида 53.9023, 27.5619.",
      );
    } finally {
      setLoadingTiles(false);
    }
  }, [token, searchQuery, viewport?.zoom]);

  const handlePing = useCallback(async () => {
    if (!token || !selectedTileId) return;

    setActionLoading(true);
    setError(null);
    setInfo(null);
    try {
      runActionGuard();
      const response = await mapPing(token, {
        ping_type: pingType.trim() || "hunt",
        tile_id: selectedTileId,
      });

      setInfo(
        `Ping ${response.ping_type} отправлен в ${response.tile_id}. Потрачено: ${response.shards_spent} shards.`,
      );

      if (viewport) {
        await fetchTiles(viewport, true);
      }
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка ping");
    } finally {
      setActionLoading(false);
    }
  }, [token, selectedTileId, runActionGuard, pingType, viewport, fetchTiles, refreshProfile]);

  const refreshWaitMs = Math.max(0, TILE_FETCH_INTERVAL_MS - (now() - lastTilesRequestAt.current));

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

      <div className="page-shell page-shell--wide pt-8 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <SectionHeading as="h1">Карта охоты</SectionHeading>
          <div className="flex gap-2">
            <Button variant="neutral" size="sm" onClick={() => router.push("/dashboard")}>Dashboard</Button>
            <Button variant="neutral" size="sm" onClick={() => router.push("/settings")}>Настройки</Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge tone="muted">Tiles: {filteredTiles.length}</Badge>
          <Badge tone="muted">Clusters: {filteredClusters.length}</Badge>
          <Badge tone="muted">Выбран: {selectedTileId ?? "—"}</Badge>
          <Badge tone="cyan">Shards: {profile?.shards ?? "—"}</Badge>
          <Badge tone="warning">Energy: {profile?.energy ?? "—"}</Badge>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr] items-start">
          <div className="space-y-6">
            <Panel className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs uppercase tracking-[0.26em] text-text-dim">Тайлы и heat-слой</div>
                <Button
                  variant="neutral"
                  size="sm"
                  disabled={!viewport || loadingTiles || refreshWaitMs > 0}
                  onClick={() => viewport && fetchTiles(viewport, true)}
                >
                  {loadingTiles ? "..." : refreshWaitMs > 0 ? `${waitSeconds(refreshWaitMs)}с` : "Обновить"}
                </Button>
              </div>

              <form
                className="grid gap-2 sm:grid-cols-[1fr_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSearch();
                }}
              >
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Поиск: Минск или 53.9023, 27.5619"
                />
                <Button
                  type="submit"
                  variant="cyan"
                  size="md"
                  disabled={loadingTiles || !searchQuery.trim()}
                >
                  Найти
                </Button>
              </form>

              <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-text-dim mb-1">Фильтр архетипа</div>
                  <div className="flex flex-wrap gap-2">
                    {ARCHETYPE_FILTERS.map((option) => (
                      <Button
                        key={option}
                        size="sm"
                        variant={archetypeFilter === option ? "cyan" : "neutral"}
                        onClick={() => setArchetypeFilter(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-text-dim mb-1">
                    Intensity ≥ {minIntensity.toFixed(1)}
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={minIntensity}
                    onChange={(e) => setMinIntensity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <GeoMap
                tiles={filteredTiles}
                clusters={filteredClusters}
                selectedTileId={selectedTileId}
                onSelectTile={setSelectedTileId}
                onViewportChange={onViewportChange}
                focus={mapFocus}
              />

              <div className="text-xs text-text-muted flex items-center justify-between gap-2 flex-wrap">
                <span>
                  Показано тайлов: <span className="text-text-primary">{filteredTiles.length}</span> из {tiles.length}
                </span>
                <span>
                  Центр: <span className="text-text-primary">{lastCenter ? `${lastCenter.lat.toFixed(3)}, ${lastCenter.lng.toFixed(3)}` : "—"}</span>
                </span>
              </div>
            </Panel>

            <Panel className="space-y-4">
              <div className="text-xs uppercase tracking-[0.22em] text-text-dim">Легенда маркеров</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="preview-card">
                  <div className="preview-card__title">FOXY / OWL</div>
                  <div className="preview-card__line">Маневренные и тактические точки.</div>
                </div>
                <div className="preview-card">
                  <div className="preview-card__title">OXY / BEAR</div>
                  <div className="preview-card__line">Давление, контроль и защита.</div>
                </div>
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel variant="cyan" className="space-y-5">
              <div className="text-xs uppercase tracking-[0.26em] text-text-dim">Действия</div>

              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.2em] text-text-dim">Visibility</div>
                <div className="flex flex-wrap gap-2">
                  {VISIBILITY_OPTIONS.map((option) => (
                    <Button
                      key={option}
                      size="sm"
                      variant={visibility === option ? "cyan" : "neutral"}
                      onClick={() => setVisibility(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                variant="cyan"
                size="md"
                onClick={handleCheckin}
                disabled={actionLoading}
              >
                {actionLoading ? "..." : "Check-in"}
              </Button>

              <div className="space-y-2 pt-2 border-t border-meta-border">
                <div className="text-xs uppercase tracking-[0.2em] text-text-dim">Ping Type</div>
                <Input
                  value={pingType}
                  onChange={(e) => setPingType(e.target.value)}
                  placeholder="hunt"
                />
                <div className="flex flex-wrap gap-2">
                  {PING_PRESETS.map((preset) => (
                    <Button
                      key={preset}
                      variant={pingType === preset ? "pink" : "neutral"}
                      size="sm"
                      onClick={() => setPingType(preset)}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="pink"
                  size="md"
                  onClick={handlePing}
                  disabled={actionLoading || !selectedTileId}
                >
                  {actionLoading ? "..." : "Отправить Ping"}
                </Button>
              </div>

              {selectedTile ? (
                <div className="preview-card">
                  <div className="preview-card__title">Выбранный tile</div>
                  <div className="preview-card__line">ID: {selectedTile.tile_id}</div>
                  <div className="preview-card__line">Intensity: {selectedTile.intensity.toFixed(2)}</div>
                  <div className="preview-card__line">Archetype: {selectedTile.dominant_archetype ?? "none"}</div>
                </div>
              ) : (
                <div className="text-xs text-text-dim">Выбери tile на карте для ping-действия.</div>
              )}
            </Panel>

            <Panel className="space-y-4">
              <div className="text-xs uppercase tracking-[0.22em] text-text-dim">Операции</div>
              <div className="grid gap-3">
                <Button variant="neutral" size="md" onClick={() => router.push("/posts")}>Постинг</Button>
                <Button variant="neutral" size="md" onClick={() => router.push("/chat")}>Чат</Button>
                <Button variant="neutral" size="md" onClick={() => router.push("/invites")}>Инвайты</Button>
              </div>
            </Panel>
          </div>
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
      </div>
    </main>
  );
}
