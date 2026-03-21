const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");
const productService = require("./product.service");

const DEFAULT_BASE_URL = "https://oopshop-recommendation.onrender.com";
const TOP_K = 5;

function recommendationBaseUrl() {
  const raw = process.env.RECOMMENDATION_API_URL || DEFAULT_BASE_URL;
  return String(raw).replace(/\/+$/, "");
}

function recommendationTimeoutMs() {
  const n = parseInt(process.env.RECOMMENDATION_API_TIMEOUT_MS || "120000", 10);
  return Number.isFinite(n) && n > 0 ? n : 120000;
}

function recommendationSyncTimeoutMs() {
  const n = parseInt(process.env.RECOMMENDATION_SYNC_TIMEOUT_MS || "600000", 10);
  return Number.isFinite(n) && n > 0 ? n : 600000;
}

function isEmbeddingsSyncEnabled() {
  const v = process.env.RECOMMENDATION_SYNC_ENABLED;
  if (v === undefined || v === "") return true;
  return !["0", "false", "no", "off"].includes(String(v).toLowerCase());
}

function formatApiErrorMessage(status, body) {
  if (!body || typeof body !== "object") {
    return `Recommendation service returned ${status}`;
  }
  const d = body.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d) && d.length && typeof d[0]?.msg === "string") return d[0].msg;
  if (body.message && typeof body.message === "string") return body.message;
  return `Recommendation service returned ${status}`;
}

/**
 * Calls external FastAPI recommendation service (top K similar products by description).
 */
async function fetchRecommendationPayload(productId) {
  const base = recommendationBaseUrl();
  const url = `${base}/recommendations/${encodeURIComponent(productId)}?k=${TOP_K}`;

  const controller = new AbortController();
  const timeoutMs = recommendationTimeoutMs();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    const text = await res.text();
    let body = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = { raw: text };
      }
    }

    if (!res.ok) {
      const msg = formatApiErrorMessage(res.status, body);
      if (res.status === 404) throw new AppError(msg, 404);
      if (res.status === 400) throw new AppError(msg, 400);
      if (res.status === 503) throw new AppError(msg, 503);
      if (res.status >= 400 && res.status < 500) throw new AppError(msg, res.status);
      throw new AppError(msg, 502);
    }

    return body;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new AppError("Recommendation service request timed out", 504);
    }
    if (err instanceof AppError) throw err;
    logger.error("Recommendation API request failed", {
      productId,
      message: err.message,
    });
    throw new AppError("Failed to reach recommendation service", 502);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Top-K recommendations from ML service, each row enriched with full catalog product from MySQL.
 */
async function getRecommendedProductsWithDetails(productId) {
  const payload = await fetchRecommendationPayload(productId);
  const list = Array.isArray(payload?.recommendations) ? payload.recommendations : [];

  const recommendations = [];
  for (const item of list) {
    const pid = item.product_id;
    if (pid == null) continue;
    try {
      const product = await productService.getProductById(pid);
      recommendations.push({
        similarity: item.similarity,
        product,
      });
    } catch (err) {
      if (err.statusCode === 404) {
        logger.warn("Recommended product id missing from catalog", { productId: pid });
        recommendations.push({
          similarity: item.similarity,
          product: null,
        });
      } else {
        throw err;
      }
    }
  }

  return {
    product_id: payload?.product_id ?? productId,
    k: TOP_K,
    recommendations,
  };
}

/**
 * Fire-and-forget POST /embeddings/sync on the recommendation service (full re-embed from MySQL).
 * Does not block the HTTP response; logs on failure. Used after product create/delete.
 */
function triggerEmbeddingsSyncBackground() {
  if (!isEmbeddingsSyncEnabled()) {
    logger.debug("Recommendation embeddings sync skipped (RECOMMENDATION_SYNC_ENABLED=false)");
    return;
  }

  const base = recommendationBaseUrl();
  const url = `${base}/embeddings/sync`;
  const controller = new AbortController();
  const timeoutMs = recommendationSyncTimeoutMs();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  fetch(url, {
    method: "POST",
    signal: controller.signal,
    headers: { Accept: "application/json" },
  })
    .then(async (res) => {
      clearTimeout(timer);
      const text = await res.text();
      if (!res.ok) {
        logger.warn("Recommendation embeddings sync failed", {
          status: res.status,
          snippet: text?.slice(0, 400),
        });
        return;
      }
      try {
        const j = JSON.parse(text);
        logger.info("Recommendation embeddings sync finished", {
          embedded: j.embedded,
          skipped_no_text: j.skipped_no_text,
          products_in_mysql: j.products_in_mysql,
          pruned: j.pruned,
        });
      } catch {
        logger.info("Recommendation embeddings sync finished");
      }
    })
    .catch((err) => {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        logger.warn("Recommendation embeddings sync timed out", { timeoutMs });
      } else {
        logger.error("Recommendation embeddings sync error", { message: err.message });
      }
    });
}

module.exports = {
  getRecommendedProductsWithDetails,
  triggerEmbeddingsSyncBackground,
  TOP_K,
  recommendationBaseUrl,
};
