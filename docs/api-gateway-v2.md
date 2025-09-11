# API Gateway v2 (Edge)

- Base paths:
  - `/api/v2/fortune/*` → proxies to `/api/fortune/*`
  - `/api/v2/user/*` → proxies to `/api/user/*`
  - `/api/v2/astrology/*` → proxies to selected `/api/*` astrology endpoints

- Runtime: Edge (`export const runtime = 'edge'`)
- Features: IP rate limiting (Upstash), optional GET response cache for public requests (Upstash), dynamic config via Vercel Edge Config.

## Environment

- Required for Edge gateway:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- Optional (Edge Config keys):
  - `rate_limit_default_limit` (number)
  - `rate_limit_default_window` (number, seconds)
  - `cache_ttl_fortune` (seconds)
  - `cache_ttl_astrology` (seconds)
  - `enable_gateway_cache` (boolean)

- Required in production for Node handlers:
  - `REDIS_URL` (mandatory)

## Notes

- GET cache only applies to unauthenticated requests (no `Authorization` header) and skips streaming responses.
- Rate limit is per IP and namespace (fortune/astrology/user).
- Existing routes remain unchanged; the gateway aggregates and centralizes limits and caching.

