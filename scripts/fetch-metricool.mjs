// Fetches the last ~6 months of Instagram Reels and TikTok posts for the
// RIP Wallet account from the Metricool API, and writes
// src/data/video-insights.json for the /rendimiento-videos page.
//
// Endpoints confirmed against Metricool's official OpenAPI spec
// (https://app.metricool.com/api/swagger.json) as of 2026-09:
//   GET /v2/analytics/reels/instagram
//   GET /v2/analytics/posts/tiktok
// Auth: header `X-Mc-Auth: <user token>`, plus `userId` and `blogId` query
// params on every call (per Metricool's "Basic Guide for API Integration").
//
// Required env vars:
//   METRICOOL_USER_TOKEN  - from Metricool > Configuración > Perfil > API
//   METRICOOL_USER_ID     - same page as the token
//   METRICOOL_BLOG_ID     - defaults to 6866306 (ripwallet.cr) if unset
//
// On any failure, this script exits non-zero WITHOUT touching
// src/data/video-insights.json, so the site keeps serving the last good
// snapshot (the "última actualización" date on the page will simply lag).

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildDashboard } from "./lib/build-dashboard.mjs";

const API_BASE = "https://app.metricool.com/api";
const MONTHS_BACK = 6;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "video-insights.json");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function toIsoNoMillis(date) {
  return date.toISOString().slice(0, 19);
}

async function fetchMetricool(endpointPath, { userToken, userId, blogId, from, to }) {
  const url = new URL(API_BASE + endpointPath);
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);
  url.searchParams.set("timezone", "America/Costa_Rica");
  url.searchParams.set("userId", userId);
  url.searchParams.set("blogId", blogId);

  const response = await fetch(url, {
    headers: { "X-Mc-Auth": userToken },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Metricool request failed (${response.status}) for ${endpointPath}: ${body}`);
  }

  const json = await response.json();
  return json.data ?? [];
}

function normalizeInstagramReel(reel) {
  return {
    network: "instagram",
    id: reel.reelId,
    url: reel.url,
    caption: reel.content ?? "",
    publishedAt: reel.publishedAt?.dateTime ?? null,
    views: reel.views ?? 0,
    likes: reel.likes ?? 0,
    comments: reel.comments ?? 0,
    shares: reel.shares ?? 0,
    reach: reel.reach ?? 0,
    saved: reel.saved ?? 0,
    engagementRate: reel.engagement ?? 0,
  };
}

function normalizeTiktokPost(post) {
  return {
    network: "tiktok",
    id: post.videoId,
    url: post.shareUrl,
    caption: post.videoDescription ?? post.title ?? "",
    publishedAt: post.createTime ?? null,
    views: post.viewCount ?? 0,
    likes: post.likeCount ?? 0,
    comments: post.commentCount ?? 0,
    shares: post.shareCount ?? 0,
    reach: post.reach ?? 0,
    saved: null,
    engagementRate: post.engagement ?? 0,
  };
}

async function main() {
  const userToken = requireEnv("METRICOOL_USER_TOKEN");
  const userId = requireEnv("METRICOOL_USER_ID");
  const blogId = process.env.METRICOOL_BLOG_ID || "6866306";

  const to = new Date();
  const from = new Date(to);
  from.setMonth(from.getMonth() - MONTHS_BACK);

  const params = {
    userToken,
    userId,
    blogId,
    from: toIsoNoMillis(from),
    to: toIsoNoMillis(to),
  };

  console.log(`Fetching Metricool data from ${params.from} to ${params.to}...`);

  const [reels, tiktokPosts] = await Promise.all([
    fetchMetricool("/v2/analytics/reels/instagram", params),
    fetchMetricool("/v2/analytics/posts/tiktok", params),
  ]);

  const videos = [
    ...reels.map(normalizeInstagramReel),
    ...tiktokPosts.map(normalizeTiktokPost),
  ].filter((v) => v.publishedAt);

  if (videos.length === 0) {
    throw new Error("Metricool returned 0 videos across both networks — refusing to overwrite existing data.");
  }

  const dashboard = buildDashboard(videos, {
    generatedAt: new Date().toISOString(),
    source: "metricool",
  });

  await writeFile(OUTPUT_PATH, JSON.stringify(dashboard, null, 2) + "\n", "utf-8");
  console.log(`Wrote ${videos.length} videos (${reels.length} reels, ${tiktokPosts.length} tiktok) to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error("fetch-metricool failed:", error.message);
  process.exit(1);
});
