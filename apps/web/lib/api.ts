/**
 * API client for MetaHunt backend (FastAPI).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ApiError = {
  detail: string | Record<string, unknown> | Record<string, unknown>[];
};

export class ApiClientError extends Error {
  status: number;
  url: string;
  detail: ApiError["detail"];

  constructor(
    message: string,
    status: number,
    url: string,
    detail: ApiError["detail"],
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.url = url;
    this.detail = detail;
  }
}

function detailToMessage(detail: ApiError["detail"]): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) =>
        typeof item === "object" &&
        item !== null &&
        "msg" in item &&
        typeof item.msg === "string"
          ? item.msg
          : null,
      )
      .filter((item): item is string => Boolean(item));
    if (messages.length) return messages.join("; ");
  }
  try {
    return JSON.stringify(detail);
  } catch {
    return "Ошибка API";
  }
}

function parseBodyByContentType(contentType: string, bodyText: string): unknown {
  if (!bodyText) return undefined;
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(bodyText);
    } catch {
      return bodyText;
    }
  }
  return bodyText;
}

async function request<T>(
  path: string,
  options?: RequestInit & {
    params?: Record<string, string | number | boolean | null | undefined>;
    timeoutMs?: number;
  },
): Promise<T> {
  const { params, timeoutMs = 15_000, ...init } = options ?? {};
  const url = new URL(path, API_BASE);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v == null) return;
      url.searchParams.set(k, String(v));
    });
  }

  const headers = new Headers(init.headers);
  if (typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  init.signal?.addEventListener("abort", onAbort, { once: true });
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(url.toString(), {
      ...init,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Сервер не ответил вовремя");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    init.signal?.removeEventListener("abort", onAbort);
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";
  const bodyText = await res.text();
  const payload = parseBodyByContentType(contentType, bodyText);

  if (!res.ok) {
    const detail =
      typeof payload === "object" &&
      payload !== null &&
      "detail" in payload &&
      (typeof payload.detail === "string" ||
        (typeof payload.detail === "object" && payload.detail !== null))
        ? (payload.detail as ApiError["detail"])
        : typeof payload === "string" && payload.trim().length > 0
          ? payload
          : res.statusText || "Request failed";
    throw new ApiClientError(
      detailToMessage(detail),
      res.status,
      url.toString(),
      detail,
    );
  }

  return payload as T;
}

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export type Archetype = "FOXY" | "OXY" | "BEAR" | "OWL";

export async function health(): Promise<{ status: string }> {
  return request("/health");
}

export interface UserResponse {
  id: string;
  email: string;
  nickname: string;
  avatar: string | null;
  bio: string | null;
  privacy: string;
  verified: boolean;
  role: string;
  created_at: string;
}

export interface GameProfileResponse {
  id: string;
  archetype: Archetype | null;
  level: number;
  xp: number;
  xp_to_next: number;
  reputation: number;
  season_points: number;
  shards: number;
  energy: number;
  stats: {
    charisma: number;
    influence: number;
    activity: number;
    strategy: number;
    reliability: number;
    organization: number;
  };
}

export interface ShardLedgerEntry {
  id: string;
  delta: number;
  reason: string;
  meta: Record<string, unknown> | null;
  balance_after: number;
  created_at: string;
}

export interface ShardRewardResponse {
  msg: string;
  delta: number;
  balance: number;
  ledger: ShardLedgerEntry | null;
}

export interface FactionPulseItem {
  archetype: Archetype;
  count: number;
  share: number;
  role: string;
  pressure_to: Archetype | null;
  threat_from: Archetype | null;
}

export interface FactionPulseEdge {
  source: Archetype;
  target: Archetype;
  relation: "counter" | "trade";
  active_pairs: number;
  opportunity: string;
}

export interface FactionPulseResponse {
  total_players: number;
  factions: FactionPulseItem[];
  edges: FactionPulseEdge[];
  user_recommendation: string;
}

export interface AdminUser extends UserResponse {
  game_profile?: GameProfileResponse | null;
}

export async function login(
  email: string,
  password: string,
): Promise<{ access_token: string; token_type: string }> {
  return request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
}

export async function register(data: {
  email: string;
  password: string;
  nickname: string;
}): Promise<UserResponse> {
  return request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logout(): Promise<void> {
  return request("/api/v1/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export async function getMe(token: string): Promise<UserResponse> {
  return request("/api/v1/users/me", {
    headers: authHeaders(token),
  });
}

export async function updateProfile(
  token: string,
  data: { nickname?: string; avatar?: string; bio?: string; privacy?: string },
): Promise<UserResponse> {
  return request("/api/v1/users/profile", {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function changePassword(
  token: string,
  data: { current_password: string; new_password: string },
): Promise<void> {
  return request("/api/v1/users/password", {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function getGameProfile(token: string): Promise<GameProfileResponse> {
  return request("/api/v1/game/profile", {
    headers: authHeaders(token),
  });
}

export async function chooseArchetype(
  token: string,
  archetype: Archetype,
): Promise<GameProfileResponse> {
  return request("/api/v1/game/archetype", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ archetype }),
  });
}

export async function getShardLedger(
  token: string,
): Promise<ShardLedgerEntry[]> {
  return request("/api/v1/game/shards/ledger", {
    headers: authHeaders(token),
  });
}

export async function getFactionPulse(
  token: string,
): Promise<FactionPulseResponse> {
  return request("/api/v1/game/factions/pulse", {
    headers: authHeaders(token),
  });
}

export async function claimDailyLogin(
  token: string,
): Promise<ShardRewardResponse> {
  return request("/api/v1/game/rewards/daily-login", {
    method: "POST",
    headers: authHeaders(token),
  });
}

export async function claimQuestReward(
  token: string,
  quest_key: string,
): Promise<ShardRewardResponse> {
  return request("/api/v1/game/rewards/quest", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ quest_key }),
  });
}

export async function interact(
  token: string,
  target_id: string,
): Promise<{ msg: string; shards_lost?: number }> {
  return request("/api/v1/game/interact", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ target_id }),
  });
}

export async function glitchScreen(
  token: string,
  target_id: string,
): Promise<{ msg: string; shards_spent: number; shards_rewarded?: number; shards_balance?: number }> {
  return request("/api/v1/game/skills/glitch", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ target_id }),
  });
}

export async function directStrike(
  token: string,
  target_id: string,
): Promise<{ msg: string; shards_spent: number; shards_rewarded?: number; shards_balance?: number }> {
  return request("/api/v1/game/skills/direct_strike", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ target_id }),
  });
}

export async function goldenShield(
  token: string,
): Promise<{ msg: string; shards_spent: number; shards_balance?: number }> {
  return request("/api/v1/game/skills/golden_shield", {
    method: "POST",
    headers: authHeaders(token),
  });
}

export async function banPort(
  token: string,
  target_id: string,
): Promise<{ msg: string; shards_spent: number; shards_rewarded?: number; shards_balance?: number }> {
  return request("/api/v1/game/skills/ban", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ target_id }),
  });
}

export async function whisper(
  token: string,
  target_id: string,
  message: string,
  room = "general",
): Promise<{ msg: string; shards_spent: number; shards_balance?: number; payload?: unknown }> {
  return request("/api/v1/game/skills/whisper", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ target_id, message, room }),
  });
}

export async function owlDeal(
  token: string,
  target_id: string,
): Promise<{ msg: string; shards_rewarded: number; shards_balance?: number }> {
  return request("/api/v1/game/skills/owl_deal", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ target_id }),
  });
}

export interface MessageResponse {
  id: string;
  sender_id: string | null;
  sender_nickname: string | null;
  sender_archetype?: Archetype | null;
  room: string;
  text: string;
  is_anonymous: boolean;
  effect?: string | null;
  effect_payload?: string | null;
  created_at: string;
}

export type ChatEffect = {
  effect: string;
  expires_at: string;
};

export async function getChatMessages(
  token: string,
  params?: { room?: string; limit?: number; offset?: number },
): Promise<MessageResponse[]> {
  const p = new URLSearchParams();
  if (params?.room) p.set("room", params.room);
  if (params?.limit != null) p.set("limit", String(params.limit));
  if (params?.offset != null) p.set("offset", String(params.offset));
  const q = p.toString();
  return request(`/api/v1/chat/messages${q ? "?" + q : ""}`, {
    headers: authHeaders(token),
  });
}

export async function getChatEffects(
  token: string,
): Promise<{ effects: ChatEffect[] }> {
  return request("/api/v1/chat/effects", {
    headers: authHeaders(token),
  });
}

export async function sendChatMessage(
  token: string,
  data: { text: string; room?: string },
): Promise<MessageResponse> {
  return request("/api/v1/chat/messages", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ text: data.text, room: data.room ?? "general" }),
  });
}

export async function adminListUsers(
  token: string,
  params?: { limit?: number; offset?: number },
): Promise<AdminUser[]> {
  const search = new URLSearchParams();
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.offset != null) search.set("offset", String(params.offset));
  const q = search.toString();
  return request(`/api/v1/admin/users${q ? "?" + q : ""}`, {
    headers: authHeaders(token),
  });
}

export async function adminUpdateUserRole(
  token: string,
  userId: string,
  role: "USER" | "ADMIN",
): Promise<AdminUser> {
  return request(`/api/v1/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ role }),
  });
}
export interface InviteCreator {
  id: string;
  nickname: string;
  archetype: Archetype | null;
}

export interface Invite {
  id: string;
  code: string;
  status: string;
  expires_at: string;
  created_at: string;
  creator: InviteCreator;
}

export interface InviteLimits {
  daily_total: number;
  daily_used: number;
  storage_cap: number;
  mode: string;
}

export interface InviteListResponse {
  items: Invite[];
  limits: InviteLimits;
}

export interface CreateInvitePayload {
  delivery?: string;
  note?: string;
}

export interface CreateInviteResponse {
  invite: Invite;
  balances: {
    invite_balance: number;
    shards_balance: number;
    energy: number;
  };
}

export interface RedeemInvitePayload {
  code: string;
  device_fingerprint?: string;
}

export interface RedeemInviteResponse {
  status: string;
  inviter: {
    id: string;
    archetype: Archetype | null;
  };
  reward: {
    inviter_shards_delta: number;
    tax_to_bear: number;
    tax_to_fox: number;
  };
}

export async function getInvites(token: string): Promise<InviteListResponse> {
  return request("/api/v1/invites", {
    headers: authHeaders(token),
  });
}

export async function createInvite(
  token: string,
  payload: CreateInvitePayload,
): Promise<CreateInviteResponse> {
  return request("/api/v1/invites", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function redeemInvite(
  payload: RedeemInvitePayload,
): Promise<RedeemInviteResponse> {
  return request("/api/v1/invites/redeem", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface GeoTile {
  tile_id: string;
  intensity: number;
  dominant_archetype: Archetype | null;
  last_activity_at: string;
}

export interface MapTilesResponse {
  items: GeoTile[];
  mode: string;
}

export interface MapCluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  intensity: number;
  dominant_archetype: Archetype | null;
  tile_ids: string[];
}

export interface MapClustersResponse {
  items: MapCluster[];
  mode: string;
}

export interface MapSearchResponse {
  query: string;
  label: string;
  center: { lat: number; lng: number };
  bbox: string;
  zoom: number;
  clusters: MapCluster[];
  tiles: GeoTile[];
}

export interface MapCheckinPayload {
  geo: { lat: number; lng: number };
  visibility: "exact" | "approx" | "hidden";
}

export interface MapCheckinResponse {
  tile_id: string;
  visibility: string;
  next_allowed_at: string;
  energy_after: number;
}

export interface MapPingPayload {
  ping_type: string;
  tile_id: string;
}

export interface MapPingResponse {
  ping_id: string;
  ping_type: string;
  tile_id: string;
  effect_until: string;
  shards_spent: number;
  shards_balance: number;
}

export async function getMapTiles(
  token: string,
  params?: { bbox?: string; zoom?: number },
): Promise<MapTilesResponse> {
  const search = new URLSearchParams();
  if (params?.bbox) search.set("bbox", params.bbox);
  if (params?.zoom != null) search.set("zoom", String(params.zoom));
  const q = search.toString();
  return request(`/api/v1/map/tiles${q ? "?" + q : ""}`, {
    headers: authHeaders(token),
  });
}

export async function getMapClusters(
  token: string,
  params?: { bbox?: string; zoom?: number },
): Promise<MapClustersResponse> {
  const search = new URLSearchParams();
  if (params?.bbox) search.set("bbox", params.bbox);
  if (params?.zoom != null) search.set("zoom", String(params.zoom));
  const q = search.toString();
  return request(`/api/v1/map/clusters${q ? "?" + q : ""}`, {
    headers: authHeaders(token),
  });
}

export async function searchMapLocation(
  token: string,
  params: { q: string; zoom?: number },
): Promise<MapSearchResponse> {
  const search = new URLSearchParams();
  search.set("q", params.q);
  if (params.zoom != null) search.set("zoom", String(params.zoom));
  return request(`/api/v1/map/search?${search.toString()}`, {
    headers: authHeaders(token),
  });
}

export async function mapCheckin(
  token: string,
  payload: MapCheckinPayload,
): Promise<MapCheckinResponse> {
  return request("/api/v1/map/checkin", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function mapPing(
  token: string,
  payload: MapPingPayload,
): Promise<MapPingResponse> {
  return request("/api/v1/map/ping", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export interface PostMedia {
  url: string;
  type: string;
}

export interface PostAuthor {
  id: string | null;
  nickname: string | null;
  archetype: Archetype | null;
}

export interface PostStats {
  views: number;
  replies: number;
}

export interface PostResponse {
  id: string;
  author: PostAuthor;
  post_type: string;
  text: string | null;
  media: PostMedia[];
  is_anonymous: boolean;
  geo_tile: string | null;
  created_at: string;
  stats: PostStats;
}

export interface PostsFeedResponse {
  items: PostResponse[];
  next_cursor: string | null;
  mode: string;
}

export interface CreatePostPayload {
  post_type: string;
  text?: string;
  media?: PostMedia[];
  is_anonymous?: boolean;
  geo_tile?: string;
  boost?: boolean;
}

export interface CreatePostResponse {
  post: PostResponse;
  shards_spent: number;
  shards_balance: number;
  energy_after: number;
}

export async function getPostsFeed(
  token: string,
  params?: { cursor?: string; limit?: number },
): Promise<PostsFeedResponse> {
  const search = new URLSearchParams();
  if (params?.cursor) search.set("cursor", params.cursor);
  if (params?.limit != null) search.set("limit", String(params.limit));
  const q = search.toString();
  return request(`/api/v1/posts/feed${q ? "?" + q : ""}`, {
    headers: authHeaders(token),
  });
}

export async function createPost(
  token: string,
  payload: CreatePostPayload,
): Promise<CreatePostResponse> {
  return request("/api/v1/posts", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function getPostById(
  token: string,
  postId: string,
): Promise<PostResponse> {
  return request(`/api/v1/posts/${postId}`, {
    headers: authHeaders(token),
  });
}
