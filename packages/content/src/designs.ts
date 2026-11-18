import type { ComponentType, Design } from './types';

export const COMPONENT_TYPES: Record<ComponentType, { name: string; color: string }> = {
  "client": {
    "name": "Client",
    "color": "#8792A6"
  },
  "lb": {
    "name": "Load balancer / gateway",
    "color": "#4C72F0"
  },
  "service": {
    "name": "Service",
    "color": "#16A075"
  },
  "cache": {
    "name": "Cache",
    "color": "#D69214"
  },
  "db": {
    "name": "Database",
    "color": "#E0564B"
  },
  "queue": {
    "name": "Queue / stream",
    "color": "#8B5FE6"
  },
  "storage": {
    "name": "Object storage",
    "color": "#E5772C"
  },
  "cdn": {
    "name": "CDN",
    "color": "#1597AD"
  },
  "worker": {
    "name": "Async workers",
    "color": "#16A075"
  },
  "model": {
    "name": "ML model",
    "color": "#C2368F"
  }
};

export const DESIGNS: Design[] = [
  {
    "id": "url",
    "name": "URL Shortener",
    "track": "swe",
    "nodes": {
      "client": {
        "label": "Client",
        "type": "client",
        "x": 90,
        "y": 230,
        "info": "Browser or app. Sends POST to create a short link and GET on the short link to be redirected."
      },
      "lb": {
        "label": "Load Balancer",
        "type": "lb",
        "x": 265,
        "y": 230,
        "info": "Spreads traffic across stateless API servers (round robin or least connections) and removes unhealthy ones using health checks. TLS is usually terminated here."
      },
      "api": {
        "label": "URL Service",
        "type": "service",
        "x": 450,
        "y": 230,
        "info": "Stateless app servers. Create: take a key, store the mapping. Redirect: read through the cache and return 301/302. Scale out by adding instances behind the LB."
      },
      "kgs": {
        "label": "Key Generation Svc",
        "type": "service",
        "x": 450,
        "y": 70,
        "info": "Generates unique 7-character base62 keys in advance and hands them to API servers in batches, so there are no collision checks on the hot path. 62⁷ ≈ 3.5 trillion keys."
      },
      "cache": {
        "label": "Redis Cache",
        "type": "cache",
        "x": 680,
        "y": 130,
        "info": "Hot short→long mappings. A small share of links gets most of the traffic, so a modest cache absorbs most reads. LRU eviction plus a TTL."
      },
      "db": {
        "label": "KV Store",
        "type": "db",
        "x": 680,
        "y": 340,
        "info": "DynamoDB or Cassandra: key = shortCode, value = {longUrl, userId, createdAt, expiresAt}. Pure key lookups that partition horizontally by key, so no joins are needed."
      },
      "mq": {
        "label": "Kafka (clicks)",
        "type": "queue",
        "x": 450,
        "y": 395,
        "info": "Click events are published asynchronously so analytics never slows down a redirect."
      },
      "an": {
        "label": "Analytics Workers",
        "type": "worker",
        "x": 230,
        "y": 395,
        "info": "Consume click events and aggregate counts by link, country and referrer into an OLAP store."
      }
    },
    "edges": [
      [
        "client",
        "lb"
      ],
      [
        "lb",
        "api"
      ],
      [
        "api",
        "kgs"
      ],
      [
        "api",
        "cache"
      ],
      [
        "api",
        "db"
      ],
      [
        "api",
        "mq"
      ],
      [
        "mq",
        "an"
      ]
    ],
    "flows": [
      {
        "name": "Create short URL",
        "steps": [
          {
            "from": "client",
            "to": "lb",
            "text": "POST /api/urls {longUrl}"
          },
          {
            "from": "lb",
            "to": "api",
            "text": "Route to a healthy API instance"
          },
          {
            "from": "api",
            "to": "kgs",
            "text": "Take the next unused key from the local batch (refill from KGS when it runs low)"
          },
          {
            "from": "api",
            "to": "db",
            "text": "PUT aB3x9Kq → longUrl (conditional write: only if absent)"
          },
          {
            "from": "api",
            "to": "cache",
            "text": "Optionally warm the cache"
          },
          {
            "from": "api",
            "to": "client",
            "text": "201 Created → https://sho.rt/aB3x9Kq"
          }
        ]
      },
      {
        "name": "Redirect",
        "steps": [
          {
            "from": "client",
            "to": "lb",
            "text": "GET /aB3x9Kq"
          },
          {
            "from": "lb",
            "to": "api",
            "text": "Forward the request"
          },
          {
            "from": "api",
            "to": "cache",
            "text": "Look up the key. Most popular links are served from here"
          },
          {
            "from": "api",
            "to": "db",
            "text": "On a cache miss, read from the KV store and populate the cache"
          },
          {
            "from": "api",
            "to": "mq",
            "text": "Publish a click event (async, fire-and-forget)"
          },
          {
            "from": "mq",
            "to": "an",
            "text": "Workers aggregate clicks"
          },
          {
            "from": "api",
            "to": "client",
            "text": "302 Found, Location: <longUrl>"
          }
        ]
      }
    ],
    "requirements": {
      "functional": [
        "Shorten a long URL, optionally with a custom alias",
        "Redirect short → long",
        "Link expiry",
        "Click analytics"
      ],
      "nonFunctional": [
        "Redirect latency < 50 ms p99",
        "Very high availability for reads",
        "Read-heavy (~10:1 or more)",
        "Keys should not be guessable (optional)"
      ]
    },
    "estimates": [
      "100M new URLs/day ≈ **1.2K writes/s**",
      "10:1 reads ≈ **12K reads/s** on average (plan for 3–5× peaks)",
      "500 B/record × 100M × 365 × 5 yr ≈ **91 TB**",
      "7 base62 chars = 62⁷ ≈ 3.5T keys, enough for decades"
    ],
    "api": [
      "POST /api/urls {longUrl, alias?, expiresAt?} → {shortUrl}",
      "GET /{code} → 302 Location",
      "GET /api/urls/{code}/stats",
      "DELETE /api/urls/{code}"
    ],
    "deepDives": [
      {
        "title": "How do you generate keys?",
        "body": "(1) Hash the long URL (MD5/SHA) and take 7 chars, which needs collision handling. (2) A global counter encoded in base62 is simple, but keys are predictable and the counter is a bottleneck, so hand out ID ranges per server (e.g. via ZooKeeper). (3) An offline Key Generation Service is fast with no collisions, but it is one more service to run. Name the trade-offs, then pick one."
      },
      {
        "title": "301 or 302?",
        "body": "A 301 (permanent) is cached by browsers, which cuts load but means you stop seeing repeat clicks. A 302 (temporary) sends every click through you, so analytics stay accurate. Most shorteners that track clicks use 302."
      },
      {
        "title": "Caching",
        "body": "Cache-aside with LRU. Protect against a stampede on a viral key with request coalescing or a short lock. Use negative caching for invalid codes to stop scans from hitting the DB."
      },
      {
        "title": "Expiry and cleanup",
        "body": "Delete lazily when an expired key is read, plus a background sweeper. Optionally return expired keys to the key pool."
      },
      {
        "title": "Abuse",
        "body": "Rate limit link creation per user or IP, check URLs against malware lists, and require auth for custom aliases."
      }
    ]
  },
  {
    "id": "rate",
    "name": "Rate Limiter",
    "track": "swe",
    "nodes": {
      "client": {
        "label": "Client",
        "type": "client",
        "x": 100,
        "y": 230,
        "info": "A caller identified by API key, user ID or IP."
      },
      "gw": {
        "label": "API Gateway + Limiter",
        "type": "lb",
        "x": 340,
        "y": 230,
        "info": "Checks the limit before doing any expensive work. It is fast and fails open: if Redis is down, let traffic through and alert rather than blocking all traffic."
      },
      "rules": {
        "label": "Rules Config",
        "type": "db",
        "x": 340,
        "y": 70,
        "info": "e.g. free tier 100 req/min, paid 1,000 req/min, login endpoint 5/min per IP. Cached in gateway memory and refreshed periodically."
      },
      "redis": {
        "label": "Redis (counters)",
        "type": "cache",
        "x": 340,
        "y": 395,
        "info": "Shared counters so every gateway node sees the same count. Updated atomically with a Lua script (read, refill, decrement in one step). TTL on each key."
      },
      "svc": {
        "label": "Backend Services",
        "type": "service",
        "x": 640,
        "y": 230,
        "info": "Only receive traffic that is within limits."
      },
      "logs": {
        "label": "Metrics / Logs",
        "type": "queue",
        "x": 640,
        "y": 395,
        "info": "Throttle events feed dashboards and alerts, and help spot abusive clients."
      }
    },
    "edges": [
      [
        "client",
        "gw"
      ],
      [
        "gw",
        "rules"
      ],
      [
        "gw",
        "redis"
      ],
      [
        "gw",
        "svc"
      ],
      [
        "gw",
        "logs"
      ]
    ],
    "flows": [
      {
        "name": "Allowed request",
        "steps": [
          {
            "from": "client",
            "to": "gw",
            "text": "GET /api/orders (API key abc)"
          },
          {
            "from": "gw",
            "to": "rules",
            "text": "Rule from in-memory cache: 100 req/min for this key"
          },
          {
            "from": "gw",
            "to": "redis",
            "text": "Atomic Lua script: refill tokens, take 1 → 37 left"
          },
          {
            "from": "gw",
            "to": "svc",
            "text": "Forward the request"
          },
          {
            "from": "svc",
            "to": "gw",
            "text": "Response"
          },
          {
            "from": "gw",
            "to": "client",
            "text": "200 OK, X-RateLimit-Remaining: 37"
          }
        ]
      },
      {
        "name": "Throttled request",
        "steps": [
          {
            "from": "client",
            "to": "gw",
            "text": "GET /api/orders (101st call this minute)"
          },
          {
            "from": "gw",
            "to": "redis",
            "text": "Bucket is empty → reject"
          },
          {
            "from": "gw",
            "to": "logs",
            "text": "Record a throttle event"
          },
          {
            "from": "gw",
            "to": "client",
            "text": "429 Too Many Requests, Retry-After: 12"
          }
        ]
      }
    ],
    "requirements": {
      "functional": [
        "Limit by user, API key or IP, per endpoint",
        "Configurable rules",
        "Tell clients they were throttled"
      ],
      "nonFunctional": [
        "Adds < 1–2 ms per request",
        "Works across many gateway nodes",
        "Highly available (fail open)",
        "Memory efficient"
      ]
    },
    "estimates": [
      "1M req/s across the gateway fleet",
      "1 Redis round trip per request, so shard Redis by key",
      "10M active keys × ~100 B ≈ **1 GB** of counters",
      "Local in-memory pre-check can cut Redis load for obvious abusers"
    ],
    "api": [
      "Middleware, not a public API",
      "Response headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After",
      "Admin: PUT /rules/{id}"
    ],
    "deepDives": [
      {
        "title": "Which algorithm?",
        "body": "**Token bucket**: allows bursts, simple, widely used (try the demo below). **Leaky bucket**: smooth constant outflow. **Fixed window**: cheap, but allows 2× bursts at window edges. **Sliding log**: exact, but memory heavy. **Sliding window counter**: weighted mix of the current and previous window, accurate and cheap. A common interview answer is token bucket or sliding window counter."
      },
      {
        "title": "Race conditions",
        "body": "Two gateways read \"1 left\" at the same moment and both allow the request. Fix it with an atomic Lua script or INCR plus EXPIRE in one step."
      },
      {
        "title": "Where should it live?",
        "body": "Client side (can be bypassed), the API gateway (most common), or middleware in each service (finer control). Often a mix: coarse limits at the edge and fine ones in services."
      },
      {
        "title": "Multi-region",
        "body": "Global exact counts are expensive. Use per-region limits, or accept eventual consistency by syncing counters asynchronously."
      }
    ],
    "extra": "token-bucket"
  },
  {
    "id": "chat",
    "name": "Chat (WhatsApp)",
    "track": "swe",
    "nodes": {
      "a": {
        "label": "User A",
        "type": "client",
        "x": 90,
        "y": 110,
        "info": "Keeps a persistent WebSocket open while the app is in the foreground."
      },
      "b": {
        "label": "User B",
        "type": "client",
        "x": 90,
        "y": 370,
        "info": "Recipient. May be online (WebSocket) or offline (push notification)."
      },
      "lb": {
        "label": "LB (WebSocket)",
        "type": "lb",
        "x": 280,
        "y": 240,
        "info": "Layer-4 or WebSocket-aware load balancer. Connections are long-lived, so balance by connection count."
      },
      "chat": {
        "label": "Chat Servers",
        "type": "service",
        "x": 480,
        "y": 240,
        "info": "Each holds about 100K open connections. Stateful in the sense that they own sockets. They talk to each other through pub/sub or direct RPC."
      },
      "sess": {
        "label": "Session Store (Redis)",
        "type": "cache",
        "x": 480,
        "y": 70,
        "info": "userId → which chat server holds their connection. Kept up to date on connect and disconnect, with a heartbeat TTL."
      },
      "db": {
        "label": "Message Store",
        "type": "db",
        "x": 710,
        "y": 130,
        "info": "Partition key = conversationId, clustering key = messageId (time-ordered). Typically Cassandra or HBase: write-heavy, so a wide-column store fits well."
      },
      "pres": {
        "label": "Presence Service",
        "type": "service",
        "x": 710,
        "y": 370,
        "info": "Online and last-seen status from heartbeats with a TTL. Changes are fanned out only to contacts who are currently viewing."
      },
      "push": {
        "label": "Push (APNs / FCM)",
        "type": "worker",
        "x": 280,
        "y": 420,
        "info": "Wakes offline devices. The notification carries little or no message content."
      }
    },
    "edges": [
      [
        "a",
        "lb"
      ],
      [
        "b",
        "lb"
      ],
      [
        "lb",
        "chat"
      ],
      [
        "chat",
        "sess"
      ],
      [
        "chat",
        "db"
      ],
      [
        "chat",
        "pres"
      ],
      [
        "chat",
        "push"
      ],
      [
        "push",
        "b"
      ]
    ],
    "flows": [
      {
        "name": "Send (B online)",
        "steps": [
          {
            "from": "a",
            "to": "lb",
            "text": "Send over the WebSocket {to: B, text, clientMsgId}"
          },
          {
            "from": "lb",
            "to": "chat",
            "text": "Sticky to the server that holds A’s socket"
          },
          {
            "from": "chat",
            "to": "db",
            "text": "Persist first, since the store is the source of truth"
          },
          {
            "from": "chat",
            "to": "sess",
            "text": "Which server is B connected to?"
          },
          {
            "from": "chat",
            "to": "lb",
            "text": "Route to B’s chat server through internal pub/sub"
          },
          {
            "from": "lb",
            "to": "b",
            "text": "Deliver on B’s WebSocket"
          },
          {
            "from": "lb",
            "to": "a",
            "text": "ACK ✓ sent. B’s ACK later gives ✓✓ delivered"
          }
        ]
      },
      {
        "name": "Send (B offline)",
        "steps": [
          {
            "from": "a",
            "to": "lb",
            "text": "Send message"
          },
          {
            "from": "lb",
            "to": "chat",
            "text": "Route to A’s chat server"
          },
          {
            "from": "chat",
            "to": "db",
            "text": "Persist the message"
          },
          {
            "from": "chat",
            "to": "sess",
            "text": "B has no active connection"
          },
          {
            "from": "chat",
            "to": "push",
            "text": "Queue a push notification"
          },
          {
            "from": "push",
            "to": "b",
            "text": "Notification. On reconnect, B fetches everything after its last seen messageId"
          }
        ]
      }
    ],
    "requirements": {
      "functional": [
        "1:1 and group chat",
        "Sent / delivered / read receipts",
        "Online presence",
        "History synced across devices",
        "Push for offline users"
      ],
      "nonFunctional": [
        "Low latency (< 200 ms)",
        "No message loss",
        "Ordering within a conversation",
        "High availability"
      ]
    },
    "estimates": [
      "500M DAU × 40 msgs/day = 20B msgs/day ≈ **230K msgs/s**",
      "100 B/msg → **2 TB/day** of text",
      "~100M concurrent sockets ÷ 100K per server ≈ **1,000 chat servers**"
    ],
    "api": [
      "WS: send {to, text, clientMsgId}",
      "WS event: message, ack, typing, presence",
      "GET /conversations/{id}/messages?before=msgId"
    ],
    "deepDives": [
      {
        "title": "WebSocket vs long polling",
        "body": "WebSockets give full-duplex, low-overhead push. Long polling is a fallback. Mention heartbeats and reconnect with exponential backoff."
      },
      {
        "title": "Ordering and duplicates",
        "body": "Delivery is at-least-once with client-side de-duplication using clientMsgId. The server assigns a per-conversation sequence number (or Snowflake ID) so clients sort consistently."
      },
      {
        "title": "Group chat fan-out",
        "body": "Small groups: fan out on write to each member’s connection. Very large groups and channels: members pull. Cap group size."
      },
      {
        "title": "End-to-end encryption",
        "body": "With the Signal protocol, servers only store and forward ciphertext. Keys live on devices, and multi-device needs per-device sessions."
      },
      {
        "title": "Media",
        "body": "Upload to object storage with a pre-signed URL, then send only the URL and thumbnail through chat."
      }
    ]
  },
  {
    "id": "feed",
    "name": "News Feed",
    "track": "swe",
    "nodes": {
      "client": {
        "label": "Client",
        "type": "client",
        "x": 90,
        "y": 230,
        "info": "Mobile or web app. Scrolls the feed with cursor pagination."
      },
      "lb": {
        "label": "API Gateway",
        "type": "lb",
        "x": 260,
        "y": 230,
        "info": "Auth, routing and rate limiting."
      },
      "media": {
        "label": "Object Store + CDN",
        "type": "cdn",
        "x": 260,
        "y": 60,
        "info": "Images and videos are uploaded directly with pre-signed URLs and served from CDN edges."
      },
      "post": {
        "label": "Post Service",
        "type": "service",
        "x": 450,
        "y": 110,
        "info": "Creates posts and stores them. Triggers fan-out asynchronously."
      },
      "feed": {
        "label": "Feed Service",
        "type": "service",
        "x": 450,
        "y": 370,
        "info": "Builds a feed page: reads post IDs from the feed cache, hydrates them, merges in celebrity posts, ranks."
      },
      "pdb": {
        "label": "Post DB",
        "type": "db",
        "x": 690,
        "y": 60,
        "info": "Posts by postId (sharded). Hot posts are cached."
      },
      "mq": {
        "label": "Fan-out Queue",
        "type": "queue",
        "x": 690,
        "y": 190,
        "info": "Decouples publishing from the expensive fan-out work."
      },
      "fan": {
        "label": "Fan-out Workers",
        "type": "worker",
        "x": 690,
        "y": 310,
        "info": "For each follower, push the postId into their feed list. Celebrity authors are skipped, and their posts are pulled at read time instead."
      },
      "fc": {
        "label": "Feed Cache (Redis)",
        "type": "cache",
        "x": 690,
        "y": 420,
        "info": "Per-user list of recent postIds, capped at ~500–1,000 entries."
      }
    },
    "edges": [
      [
        "client",
        "lb"
      ],
      [
        "client",
        "media"
      ],
      [
        "lb",
        "post"
      ],
      [
        "lb",
        "feed"
      ],
      [
        "post",
        "pdb"
      ],
      [
        "post",
        "mq"
      ],
      [
        "mq",
        "fan"
      ],
      [
        "fan",
        "fc"
      ],
      [
        "feed",
        "fc"
      ],
      [
        "feed",
        "pdb"
      ]
    ],
    "flows": [
      {
        "name": "Publish post",
        "steps": [
          {
            "from": "client",
            "to": "media",
            "text": "Upload the image directly using a pre-signed URL"
          },
          {
            "from": "client",
            "to": "lb",
            "text": "POST /posts {text, mediaUrl}"
          },
          {
            "from": "lb",
            "to": "post",
            "text": "Validate and create"
          },
          {
            "from": "post",
            "to": "pdb",
            "text": "Persist the post"
          },
          {
            "from": "post",
            "to": "mq",
            "text": "Enqueue a fan-out job, then return 201 to the user immediately"
          },
          {
            "from": "mq",
            "to": "fan",
            "text": "A worker picks up the job and loads the author’s followers"
          },
          {
            "from": "fan",
            "to": "fc",
            "text": "LPUSH postId into each follower’s feed and trim the list"
          }
        ]
      },
      {
        "name": "Read feed",
        "steps": [
          {
            "from": "client",
            "to": "lb",
            "text": "GET /feed?cursor=…"
          },
          {
            "from": "lb",
            "to": "feed",
            "text": "Route the request"
          },
          {
            "from": "feed",
            "to": "fc",
            "text": "Read precomputed postIds for this user"
          },
          {
            "from": "feed",
            "to": "pdb",
            "text": "Batch-hydrate posts and pull recent celebrity posts"
          },
          {
            "from": "feed",
            "to": "client",
            "text": "Ranked page plus next cursor"
          },
          {
            "from": "client",
            "to": "media",
            "text": "Images load from the CDN edge"
          }
        ]
      }
    ],
    "requirements": {
      "functional": [
        "Publish posts (text, media)",
        "Home timeline from people you follow",
        "Follow / unfollow",
        "Likes and comments"
      ],
      "nonFunctional": [
        "Feed loads in < 200 ms",
        "Eventual consistency is fine (a few seconds)",
        "Very read-heavy",
        "Highly available"
      ]
    },
    "estimates": [
      "300M DAU × 10 feed loads = 3B/day ≈ **35K reads/s**",
      "50M posts/day ≈ **600 writes/s**",
      "× 200 avg followers = 10B feed inserts/day ≈ **115K/s**"
    ],
    "api": [
      "POST /posts",
      "GET /feed?cursor=&limit=20",
      "POST /users/{id}/follow",
      "POST /posts/{id}/like"
    ],
    "deepDives": [
      {
        "title": "Push vs pull vs hybrid",
        "body": "**Push** (fan-out on write): fast reads, but expensive for celebrities with millions of followers. **Pull** (fan-out on read): cheap writes, slow reads. **Hybrid**: push for normal users, pull for celebrities at read time. This is the expected answer."
      },
      {
        "title": "Ranking",
        "body": "Start chronologically. Then rank candidates by features such as affinity, recency and engagement, scored by a model. Precompute the candidates and rank them at request time."
      },
      {
        "title": "Pagination",
        "body": "Use cursors (last postId or timestamp), not offsets, because new posts shift offsets and cause duplicates."
      },
      {
        "title": "Inactive users",
        "body": "Skip fan-out for users who haven’t logged in for 30+ days and build their feed when they return."
      }
    ]
  },
  {
    "id": "video",
    "name": "Video Streaming",
    "track": "swe",
    "nodes": {
      "creator": {
        "label": "Creator",
        "type": "client",
        "x": 90,
        "y": 90,
        "info": "Uploads large files with resumable uploads."
      },
      "viewer": {
        "label": "Viewer",
        "type": "client",
        "x": 90,
        "y": 390,
        "info": "The player fetches a manifest, then small segments, and adapts quality to bandwidth."
      },
      "api": {
        "label": "API / Upload Svc",
        "type": "service",
        "x": 300,
        "y": 90,
        "info": "Issues pre-signed multipart upload URLs and serves video metadata."
      },
      "raw": {
        "label": "Raw Store (S3)",
        "type": "storage",
        "x": 520,
        "y": 90,
        "info": "Original uploads. Moved to cold storage after transcoding."
      },
      "meta": {
        "label": "Metadata DB",
        "type": "db",
        "x": 300,
        "y": 240,
        "info": "Title, owner, status, renditions and view counts (with counters batched)."
      },
      "mq": {
        "label": "Transcode Queue",
        "type": "queue",
        "x": 520,
        "y": 240,
        "info": "Upload-complete events become transcoding jobs."
      },
      "tw": {
        "label": "Transcoding Workers",
        "type": "worker",
        "x": 740,
        "y": 240,
        "info": "Split into chunks and transcode them in parallel into several resolutions and codecs (H.264, VP9, AV1). Also produce thumbnails."
      },
      "enc": {
        "label": "Encoded Segments",
        "type": "storage",
        "x": 740,
        "y": 400,
        "info": "HLS/DASH segments (2–6 s each) plus manifests for each rendition."
      },
      "cdn": {
        "label": "CDN",
        "type": "cdn",
        "x": 300,
        "y": 400,
        "info": "Serves most bytes from edge caches near viewers. Popular videos are pushed to edges in advance, and the long tail is pulled from origin."
      }
    },
    "edges": [
      [
        "creator",
        "api"
      ],
      [
        "creator",
        "raw"
      ],
      [
        "api",
        "meta"
      ],
      [
        "raw",
        "mq"
      ],
      [
        "mq",
        "tw"
      ],
      [
        "tw",
        "enc"
      ],
      [
        "tw",
        "meta"
      ],
      [
        "enc",
        "cdn"
      ],
      [
        "cdn",
        "viewer"
      ],
      [
        "viewer",
        "api"
      ]
    ],
    "flows": [
      {
        "name": "Upload",
        "steps": [
          {
            "from": "creator",
            "to": "api",
            "text": "Request upload → pre-signed, resumable multipart URLs"
          },
          {
            "from": "creator",
            "to": "raw",
            "text": "Upload chunks directly to object storage, bypassing app servers"
          },
          {
            "from": "raw",
            "to": "mq",
            "text": "An upload-complete event creates a job"
          },
          {
            "from": "mq",
            "to": "tw",
            "text": "Split and transcode in parallel to 240p…4K"
          },
          {
            "from": "tw",
            "to": "enc",
            "text": "Write segments and manifests"
          },
          {
            "from": "tw",
            "to": "meta",
            "text": "Mark the video READY and store its renditions"
          }
        ]
      },
      {
        "name": "Watch",
        "steps": [
          {
            "from": "viewer",
            "to": "api",
            "text": "GET /videos/{id} → metadata + manifest URL"
          },
          {
            "from": "api",
            "to": "meta",
            "text": "Read metadata (cached)"
          },
          {
            "from": "viewer",
            "to": "cdn",
            "text": "Fetch the manifest, then segments"
          },
          {
            "from": "cdn",
            "to": "enc",
            "text": "On a cache miss, fetch from origin"
          },
          {
            "from": "cdn",
            "to": "viewer",
            "text": "Adaptive bitrate: the player switches quality as bandwidth changes"
          }
        ]
      }
    ],
    "requirements": {
      "functional": [
        "Upload videos",
        "Stream worldwide on any device",
        "Search and metadata",
        "View counts"
      ],
      "nonFunctional": [
        "Playback starts in < 2 s",
        "Smooth playback (adaptive bitrate)",
        "Highly available",
        "Cost-efficient storage and egress"
      ]
    },
    "estimates": [
      "Assume 500 hours uploaded per minute = 720K hours/day",
      "× ~3 GB/hour across all renditions ≈ **2 PB/day** of new storage",
      "Egress dominates cost, which is why CDN hit rate matters most"
    ],
    "api": [
      "POST /videos → upload URLs",
      "GET /videos/{id}",
      "GET /videos/{id}/manifest.m3u8",
      "POST /videos/{id}/views (batched)"
    ],
    "deepDives": [
      {
        "title": "Adaptive bitrate streaming",
        "body": "HLS or DASH: each rendition is cut into short segments, and the player picks the next segment’s quality based on measured throughput and buffer level."
      },
      {
        "title": "Why chunk the transcoding?",
        "body": "Hours of video become many small parallel jobs organised as a DAG (split → transcode → merge → thumbnails). Failed chunks can be retried on their own."
      },
      {
        "title": "CDN strategy",
        "body": "Pre-position the most popular content at edges and fetch the long tail from regional origins. Many large platforms also place cache servers inside ISP networks."
      },
      {
        "title": "Storage cost tiers",
        "body": "Hot (recent and popular), warm and cold (rarely watched). Keep fewer renditions for the long tail."
      }
    ]
  },
  {
    "id": "rag",
    "name": "RAG assistant",
    "track": "ai",
    "nodes": {
      "docs": {
        "label": "Doc sources",
        "type": "storage",
        "x": 85,
        "y": 60,
        "info": "Wikis, drives, tickets and PDFs. Connectors pull new and changed documents on a schedule or via webhooks."
      },
      "ingest": {
        "label": "Ingestion pipeline",
        "type": "worker",
        "x": 290,
        "y": 60,
        "info": "Cleans text, splits it into chunks, embeds each chunk and writes it to the index with metadata and permissions."
      },
      "emb": {
        "label": "Embedding model",
        "type": "model",
        "x": 500,
        "y": 60,
        "info": "Turns text into vectors. The same model must embed documents at ingestion time and questions at query time."
      },
      "cache": {
        "label": "Semantic cache",
        "type": "cache",
        "x": 710,
        "y": 60,
        "info": "Returns a stored answer when a new question is nearly identical in meaning to a recent one. Must still respect permissions."
      },
      "user": {
        "label": "User",
        "type": "client",
        "x": 85,
        "y": 230,
        "info": "Asks questions in a chat UI. Answers stream back with citations."
      },
      "api": {
        "label": "Chat orchestrator",
        "type": "service",
        "x": 290,
        "y": 230,
        "info": "Runs the pipeline: rewrite the question, retrieve, rerank, build the prompt, call the LLM, check the output, stream the answer."
      },
      "vdb": {
        "label": "Search index",
        "type": "db",
        "x": 500,
        "y": 230,
        "info": "Chunk embeddings with metadata and access lists. Hybrid search combines approximate nearest neighbor search with BM25 keyword search."
      },
      "rerank": {
        "label": "Reranker",
        "type": "model",
        "x": 710,
        "y": 150,
        "info": "A cross-encoder that scores each (question, chunk) pair. Slower but much more precise than vector similarity, so it only sees the top ~50 candidates."
      },
      "guard": {
        "label": "Guardrails",
        "type": "service",
        "x": 290,
        "y": 400,
        "info": "Input checks (prompt injection, PII) and output checks (policy, and whether every claim is supported by a retrieved chunk)."
      },
      "llm": {
        "label": "LLM",
        "type": "model",
        "x": 500,
        "y": 400,
        "info": "Generates the answer from instructions + top chunks + question. Told to cite sources and to say when the context does not contain the answer."
      },
      "evals": {
        "label": "Tracing & evals",
        "type": "queue",
        "x": 710,
        "y": 400,
        "info": "Logs each step (chunks, prompt, answer, latency, cost, user feedback) and feeds offline evaluation sets."
      }
    },
    "edges": [
      [
        "docs",
        "ingest"
      ],
      [
        "ingest",
        "emb"
      ],
      [
        "ingest",
        "vdb"
      ],
      [
        "user",
        "api"
      ],
      [
        "api",
        "cache"
      ],
      [
        "api",
        "emb"
      ],
      [
        "api",
        "vdb"
      ],
      [
        "api",
        "rerank"
      ],
      [
        "api",
        "guard"
      ],
      [
        "api",
        "llm"
      ],
      [
        "api",
        "evals"
      ]
    ],
    "flows": [
      {
        "name": "Ingest documents",
        "steps": [
          {
            "from": "docs",
            "to": "ingest",
            "text": "New or changed documents arrive"
          },
          {
            "from": "ingest",
            "to": "emb",
            "text": "Split into ~300–800 token chunks with overlap and embed each one"
          },
          {
            "from": "ingest",
            "to": "vdb",
            "text": "Upsert vectors with metadata: source, section, permissions, updated_at"
          }
        ]
      },
      {
        "name": "Answer a question",
        "steps": [
          {
            "from": "user",
            "to": "api",
            "text": "\"What is our parental leave policy?\""
          },
          {
            "from": "api",
            "to": "guard",
            "text": "Check the input for prompt injection and personal data"
          },
          {
            "from": "api",
            "to": "cache",
            "text": "Semantic cache lookup: miss"
          },
          {
            "from": "api",
            "to": "emb",
            "text": "Embed the (rewritten) question"
          },
          {
            "from": "api",
            "to": "vdb",
            "text": "Hybrid search: top 50 chunks this user may see"
          },
          {
            "from": "api",
            "to": "rerank",
            "text": "Rerank and keep the best 5"
          },
          {
            "from": "api",
            "to": "llm",
            "text": "Prompt = instructions + 5 chunks + question. Stream the answer"
          },
          {
            "from": "api",
            "to": "guard",
            "text": "Check the answer is grounded in the chunks"
          },
          {
            "from": "api",
            "to": "evals",
            "text": "Log the full trace with latency and cost"
          },
          {
            "from": "api",
            "to": "user",
            "text": "Answer with citations to the source documents"
          }
        ]
      }
    ],
    "requirements": {
      "functional": [
        "Answer questions from internal documents",
        "Cite sources for every answer",
        "Respect document permissions",
        "Stay current as documents change"
      ],
      "nonFunctional": [
        "First token in under 1–2 s",
        "Low hallucination rate",
        "Cost per question within budget",
        "No data leaking between users"
      ]
    },
    "estimates": [
      "10K employees × 10 questions/day = 100K/day ≈ **1–2 QPS** average, ~10 QPS peak",
      "1M chunks × 1,024-dim float32 vectors ≈ **4 GB**, which fits in memory",
      "~4K prompt tokens + ~300 output tokens per answer, so **prompt size drives cost**",
      "Retrieval ~50–150 ms and reranking ~100 ms; generation dominates latency"
    ],
    "api": [
      "POST /chat {conversationId, message} → streamed answer + citations",
      "POST /feedback {messageId, rating, comment}",
      "upsert(chunkId, vector, metadata)",
      "search(queryVector, filters, k)"
    ],
    "deepDives": [
      {
        "title": "Chunking strategy",
        "body": "Too small loses context; too large dilutes relevance and wastes tokens. Split on structure (headings, paragraphs), about 300–800 tokens with 10–20% overlap, and keep a link to the parent section so you can expand context after retrieval."
      },
      {
        "title": "Why hybrid search and reranking?",
        "body": "Vector search finds paraphrases but misses exact strings such as error codes and product names, which keyword search catches. Merge both (e.g. reciprocal rank fusion), then rerank the top candidates with a cross-encoder. This is often the single biggest quality win."
      },
      {
        "title": "How do you evaluate it?",
        "body": "Build a golden set of questions with the documents that answer them. Measure retrieval (recall@k, MRR) separately from generation (faithfulness to the context, correctness), using human labels plus an LLM judge that you have checked against those labels. Track user feedback in production."
      },
      {
        "title": "RAG or fine-tuning?",
        "body": "RAG for knowledge that changes, must be cited, or has permissions. Fine-tuning for style, format or a narrow skill. They combine well: a model tuned to use retrieved context faithfully."
      },
      {
        "title": "Security",
        "body": "Filter by permissions at retrieval time, never after generation. Treat retrieved text as untrusted, because documents can contain injected instructions."
      }
    ]
  },
  {
    "id": "agent",
    "name": "Support agent with tools",
    "track": "ai",
    "nodes": {
      "user": {
        "label": "Customer",
        "type": "client",
        "x": 85,
        "y": 230,
        "info": "Chats with the support agent on the web or in the app."
      },
      "agent": {
        "label": "Agent loop",
        "type": "service",
        "x": 300,
        "y": 230,
        "info": "Plan → act → observe: asks the LLM for the next step, runs the chosen tool, feeds back the result, and stops when the task is done or a step limit is reached."
      },
      "llm": {
        "label": "LLM (tool calling)",
        "type": "model",
        "x": 300,
        "y": 60,
        "info": "Returns either a final answer or a structured tool call (a name plus JSON arguments matching a declared schema)."
      },
      "mem": {
        "label": "Conversation state",
        "type": "cache",
        "x": 85,
        "y": 400,
        "info": "Messages, tool results, and a running summary when the context gets long. Long-term facts are stored separately and retrieved when relevant."
      },
      "policy": {
        "label": "Policy checks",
        "type": "service",
        "x": 520,
        "y": 60,
        "info": "Plain code, not the model, decides whether an action is allowed: refund limits, identity checks, rate limits. Risky actions need a human to approve."
      },
      "tools": {
        "label": "Tool router",
        "type": "service",
        "x": 520,
        "y": 230,
        "info": "Validates arguments against the schema, calls the right API with timeouts and retries, and returns a compact result."
      },
      "orders": {
        "label": "Orders & refunds API",
        "type": "db",
        "x": 740,
        "y": 150,
        "info": "Existing internal systems, wrapped in narrow tools such as get_order(id) and issue_refund(order_id, amount)."
      },
      "kb": {
        "label": "Help center (RAG)",
        "type": "db",
        "x": 740,
        "y": 310,
        "info": "Retrieval over policies and FAQs, so answers follow the current rules."
      },
      "human": {
        "label": "Human agent queue",
        "type": "worker",
        "x": 520,
        "y": 400,
        "info": "Takes over when the agent is unsure, the customer asks for a person, or an action is over its limits. The full context is handed over."
      },
      "trace": {
        "label": "Tracing & evals",
        "type": "queue",
        "x": 740,
        "y": 430,
        "info": "Every step, tool call, cost and outcome, for debugging and for building regression tests."
      }
    },
    "edges": [
      [
        "user",
        "agent"
      ],
      [
        "agent",
        "llm"
      ],
      [
        "agent",
        "mem"
      ],
      [
        "agent",
        "policy"
      ],
      [
        "agent",
        "tools"
      ],
      [
        "tools",
        "orders"
      ],
      [
        "tools",
        "kb"
      ],
      [
        "agent",
        "human"
      ],
      [
        "agent",
        "trace"
      ]
    ],
    "flows": [
      {
        "name": "Handle a refund",
        "steps": [
          {
            "from": "user",
            "to": "agent",
            "text": "\"My blender arrived broken, order #4821\""
          },
          {
            "from": "agent",
            "to": "mem",
            "text": "Load the conversation and customer profile"
          },
          {
            "from": "agent",
            "to": "llm",
            "text": "The LLM chooses a tool: get_order(4821)"
          },
          {
            "from": "agent",
            "to": "tools",
            "text": "Validate the arguments and call the orders API"
          },
          {
            "from": "tools",
            "to": "orders",
            "text": "Order found: delivered 3 days ago, $79"
          },
          {
            "from": "agent",
            "to": "llm",
            "text": "The LLM reads the result and proposes issue_refund(4821, 79)"
          },
          {
            "from": "agent",
            "to": "policy",
            "text": "Allowed: under the $100 auto-approve limit, identity verified"
          },
          {
            "from": "agent",
            "to": "tools",
            "text": "Run the refund with an idempotency key"
          },
          {
            "from": "agent",
            "to": "trace",
            "text": "Log every step, tool call and cost"
          },
          {
            "from": "agent",
            "to": "user",
            "text": "\"Done. $79 is on its way back to your card.\""
          }
        ]
      },
      {
        "name": "Escalate to a human",
        "steps": [
          {
            "from": "user",
            "to": "agent",
            "text": "\"Cancel my plan and refund the last 6 months\""
          },
          {
            "from": "agent",
            "to": "tools",
            "text": "Look up the refund policy"
          },
          {
            "from": "tools",
            "to": "kb",
            "text": "Refunds older than 30 days need approval"
          },
          {
            "from": "agent",
            "to": "policy",
            "text": "Over the auto-approve limit: approval required"
          },
          {
            "from": "agent",
            "to": "human",
            "text": "Hand off with a summary and the order history"
          },
          {
            "from": "agent",
            "to": "user",
            "text": "\"A teammate will reply within the hour.\""
          }
        ]
      }
    ],
    "requirements": {
      "functional": [
        "Answer questions and take actions (refunds, address changes)",
        "Use existing internal APIs",
        "Hand off to humans when needed",
        "Keep a full audit trail"
      ],
      "nonFunctional": [
        "Never take an unauthorized action",
        "Resolve most chats without a human",
        "A few seconds per step",
        "Predictable cost per conversation"
      ]
    },
    "estimates": [
      "50K conversations/day × ~4 LLM calls = 200K calls/day ≈ **2–3 calls/s** average",
      "~3K tokens per call → 600M tokens/day, so **model choice and caching drive cost**",
      "Cap steps per task (e.g. 8) to bound cost and latency",
      "Track the share of chats resolved without a human every week"
    ],
    "api": [
      "POST /conversations/{id}/messages",
      "get_order(order_id) → {status, total, items}",
      "issue_refund(order_id, amount, reason) → {refund_id}",
      "POST /handoff {conversation_id, summary}"
    ],
    "deepDives": [
      {
        "title": "Guardrails for actions",
        "body": "Permissions live in code, not in the prompt. Use narrow tools, argument validation, spending limits, idempotency keys and human approval for risky actions. Assume the model will sometimes choose wrongly, and make that safe."
      },
      {
        "title": "Prompt injection",
        "body": "Text from customers, emails or web pages can contain instructions. Keep untrusted content separate, never let it widen the agent’s permissions, and confirm actions it triggers."
      },
      {
        "title": "When is an agent the wrong choice?",
        "body": "If the steps are known in advance, a fixed workflow (a chain of LLM calls and code) is cheaper, faster and easier to test. Use an open-ended loop only when the path depends on what the agent discovers."
      },
      {
        "title": "Evaluating agents",
        "body": "Replay realistic conversations in a sandbox with mocked tools. Score task success, correct tool use, policy violations, number of steps and cost. Turn every failure you find into a new test case."
      },
      {
        "title": "Memory in long conversations",
        "body": "Summarize older turns, keep tool results short, and retrieve long-term facts on demand instead of filling the context window."
      }
    ]
  },
  {
    "id": "recsys",
    "name": "Recommendation feed",
    "track": "ai",
    "nodes": {
      "client": {
        "label": "App",
        "type": "client",
        "x": 85,
        "y": 230,
        "info": "Requests a page of the feed and sends back events: impressions, watch time, likes, skips."
      },
      "api": {
        "label": "Feed service",
        "type": "service",
        "x": 290,
        "y": 230,
        "info": "Runs the funnel (candidates → ranking → re-ranking) within a latency budget of about 100–200 ms."
      },
      "cand": {
        "label": "Candidate generation",
        "type": "model",
        "x": 500,
        "y": 90,
        "info": "Narrows millions of items to ~1,000 with cheap retrievers: a two-tower embedding model with ANN search, plus \"trending\" and \"from accounts you follow\"."
      },
      "ann": {
        "label": "ANN index",
        "type": "db",
        "x": 720,
        "y": 90,
        "info": "Item embeddings indexed for approximate nearest neighbor search, updated as new items arrive."
      },
      "rank": {
        "label": "Ranking model",
        "type": "model",
        "x": 500,
        "y": 230,
        "info": "A heavier model scores each candidate, often with several heads (click, watch time, like) combined into one score."
      },
      "fs": {
        "label": "Feature store",
        "type": "cache",
        "x": 720,
        "y": 230,
        "info": "Serves fresh user and item features online, using the same definitions as training to avoid training–serving skew."
      },
      "rerank": {
        "label": "Re-ranking",
        "type": "service",
        "x": 500,
        "y": 370,
        "info": "Rules on top of the scores: diversity, freshness, removing seen items, safety and policy filters."
      },
      "events": {
        "label": "Event stream",
        "type": "queue",
        "x": 290,
        "y": 400,
        "info": "Every impression and interaction, used for real-time features and training labels."
      },
      "train": {
        "label": "Training pipeline",
        "type": "worker",
        "x": 720,
        "y": 370,
        "info": "Retrains daily or continuously on logged data, checks offline metrics, then ships through an A/B test."
      }
    },
    "edges": [
      [
        "client",
        "api"
      ],
      [
        "api",
        "cand"
      ],
      [
        "cand",
        "ann"
      ],
      [
        "api",
        "rank"
      ],
      [
        "rank",
        "fs"
      ],
      [
        "api",
        "rerank"
      ],
      [
        "client",
        "events"
      ],
      [
        "events",
        "train"
      ],
      [
        "train",
        "rank"
      ]
    ],
    "flows": [
      {
        "name": "Serve the feed",
        "steps": [
          {
            "from": "client",
            "to": "api",
            "text": "GET /feed for user 42"
          },
          {
            "from": "api",
            "to": "cand",
            "text": "Fetch ~1,000 candidates from several retrievers"
          },
          {
            "from": "cand",
            "to": "ann",
            "text": "Nearest neighbors of the user embedding"
          },
          {
            "from": "api",
            "to": "rank",
            "text": "Score every candidate"
          },
          {
            "from": "rank",
            "to": "fs",
            "text": "Look up features for the user and each item"
          },
          {
            "from": "api",
            "to": "rerank",
            "text": "Apply diversity, freshness and policy rules"
          },
          {
            "from": "api",
            "to": "client",
            "text": "Return the top 20 with a cursor"
          }
        ]
      },
      {
        "name": "Learn from feedback",
        "steps": [
          {
            "from": "client",
            "to": "events",
            "text": "Impressions, watch time, likes, skips"
          },
          {
            "from": "events",
            "to": "fs",
            "text": "Update real-time features such as recent watches"
          },
          {
            "from": "events",
            "to": "train",
            "text": "Join events with logged features to build training data"
          },
          {
            "from": "train",
            "to": "rank",
            "text": "Ship the new model after offline checks and an A/B test"
          }
        ]
      }
    ],
    "requirements": {
      "functional": [
        "A personalized feed for every user",
        "New content shows up quickly",
        "Respect blocks, safety and policy filters",
        "A/B test new models"
      ],
      "nonFunctional": [
        "p99 latency under 200 ms",
        "Hundreds of millions of users",
        "Retrain at least daily",
        "Avoid feedback loops and filter bubbles"
      ]
    },
    "estimates": [
      "200M DAU × 20 feed requests = 4B/day ≈ **46K QPS**",
      "1,000 candidates × 46K QPS ≈ **46M model scores/s**, so ranking must be cheap or distilled",
      "Billions of events per day for training labels",
      "Funnel: millions → ~1,000 → ~20"
    ],
    "api": [
      "GET /feed?cursor=…",
      "POST /events (batched impressions and actions)",
      "retrieve(user_id, k)",
      "score(user_id, item_ids[]) → scores"
    ],
    "deepDives": [
      {
        "title": "Why a multi-stage funnel?",
        "body": "You cannot run an expensive model over millions of items in 100 ms. Cheap retrieval narrows the set, a heavy ranker orders it, and re-ranking applies rules. Each stage trades accuracy for speed."
      },
      {
        "title": "What do you optimize?",
        "body": "Clicks alone reward clickbait. Combine several predicted outcomes (watch time, likes, shares, \"not interested\") with tuned weights, and judge models on long-term metrics such as retention in A/B tests."
      },
      {
        "title": "Cold start",
        "body": "New users: onboarding choices, location and popular items, then learn quickly from early sessions. New items: content embeddings from text, images or audio, plus a little exploration traffic."
      },
      {
        "title": "Training–serving skew",
        "body": "Compute features with the same code online and offline (a feature store), log features at serving time, and train on those logs."
      },
      {
        "title": "Offline vs online evaluation",
        "body": "Offline: AUC, NDCG, recall@k on held-out data. Online: A/B tests on engagement and retention. Offline wins often fail to transfer, so the A/B test decides."
      }
    ]
  },
  {
    "id": "serving",
    "name": "LLM serving platform",
    "track": "ai",
    "nodes": {
      "client": {
        "label": "Client apps",
        "type": "client",
        "x": 85,
        "y": 230,
        "info": "Send chat requests and read the response as a stream of tokens."
      },
      "gw": {
        "label": "API gateway",
        "type": "lb",
        "x": 275,
        "y": 230,
        "info": "Authentication, per-customer rate limits and token quotas, request logging."
      },
      "router": {
        "label": "Model router",
        "type": "service",
        "x": 465,
        "y": 230,
        "info": "Sends each request to the right model and replica: a small fast model for easy tasks, a large one for hard tasks, with fallbacks when a pool is overloaded."
      },
      "small": {
        "label": "Small model pool",
        "type": "model",
        "x": 465,
        "y": 70,
        "info": "A cheaper, faster model for classification, extraction and simple chat."
      },
      "srv": {
        "label": "Inference servers",
        "type": "model",
        "x": 680,
        "y": 230,
        "info": "GPU workers running an inference engine with continuous batching and a paged KV cache to keep the hardware busy."
      },
      "kv": {
        "label": "Prefix / KV cache",
        "type": "cache",
        "x": 680,
        "y": 70,
        "info": "Reuses attention keys and values for shared prompt prefixes (system prompts, long documents), cutting time to first token and cost."
      },
      "mon": {
        "label": "Metrics",
        "type": "queue",
        "x": 275,
        "y": 400,
        "info": "Time to first token, tokens per second, queue time, errors and cost per 1K tokens, per model and per customer."
      },
      "autos": {
        "label": "Autoscaler",
        "type": "worker",
        "x": 465,
        "y": 400,
        "info": "Scales on queue depth and GPU utilization. New replicas take minutes to load, so it keeps headroom and uses forecasts."
      },
      "reg": {
        "label": "Model weights store",
        "type": "storage",
        "x": 680,
        "y": 400,
        "info": "Versioned weights loaded onto new replicas. Large models load slowly, so keep warm spares."
      }
    },
    "edges": [
      [
        "client",
        "gw"
      ],
      [
        "gw",
        "router"
      ],
      [
        "router",
        "small"
      ],
      [
        "router",
        "srv"
      ],
      [
        "srv",
        "kv"
      ],
      [
        "gw",
        "mon"
      ],
      [
        "mon",
        "autos"
      ],
      [
        "autos",
        "reg"
      ],
      [
        "autos",
        "srv"
      ]
    ],
    "flows": [
      {
        "name": "Stream a completion",
        "steps": [
          {
            "from": "client",
            "to": "gw",
            "text": "POST /v1/chat with stream=true"
          },
          {
            "from": "gw",
            "to": "router",
            "text": "Authenticated and within quota"
          },
          {
            "from": "router",
            "to": "srv",
            "text": "Large model, least-loaded replica"
          },
          {
            "from": "srv",
            "to": "kv",
            "text": "Prefix cache hit on the shared system prompt"
          },
          {
            "from": "srv",
            "to": "gw",
            "text": "Prefill the prompt, then decode tokens batched with other requests"
          },
          {
            "from": "gw",
            "to": "client",
            "text": "Stream tokens as they are generated"
          },
          {
            "from": "gw",
            "to": "mon",
            "text": "Record time to first token, tokens/s and tokens used"
          }
        ]
      },
      {
        "name": "Handle a traffic spike",
        "steps": [
          {
            "from": "client",
            "to": "gw",
            "text": "Requests jump 3×"
          },
          {
            "from": "gw",
            "to": "router",
            "text": "Queues grow on the large-model pool"
          },
          {
            "from": "router",
            "to": "small",
            "text": "Send simple requests to the small model"
          },
          {
            "from": "mon",
            "to": "autos",
            "text": "Queue depth over target for 2 minutes"
          },
          {
            "from": "autos",
            "to": "reg",
            "text": "Load weights onto new GPU replicas"
          },
          {
            "from": "autos",
            "to": "srv",
            "text": "New replicas join once they are warm"
          }
        ]
      }
    ],
    "requirements": {
      "functional": [
        "Several models behind one API",
        "Streaming responses",
        "Per-customer quotas and billing",
        "Safe rollout of new model versions"
      ],
      "nonFunctional": [
        "Time to first token under ~500 ms",
        "High throughput per GPU (cost)",
        "99.9% availability",
        "Graceful degradation under load"
      ]
    },
    "estimates": [
      "1,000 requests/s × 800 output tokens ≈ **800K tokens/s** to generate",
      "At ~2K tokens/s per replica with batching, that is **~400 replicas** plus headroom",
      "Decoding is limited by memory bandwidth, so batching many requests is the main throughput lever",
      "KV cache memory grows with batch size × context length, which caps concurrency"
    ],
    "api": [
      "POST /v1/chat {model, messages, max_tokens, stream}",
      "Server-sent events, one chunk per group of tokens",
      "Header: x-ratelimit-remaining-tokens",
      "deploy(model, version, traffic_percent)"
    ],
    "deepDives": [
      {
        "title": "Prefill vs decode",
        "body": "Prefill processes the whole prompt in parallel and is compute-bound. Decode produces one token at a time and is memory-bandwidth-bound. Long prompts hurt time to first token; long outputs hurt total latency."
      },
      {
        "title": "Continuous batching",
        "body": "New requests join and finished ones leave at every decoding step, instead of waiting for a whole batch to finish. This keeps GPUs busy and raises throughput several-fold."
      },
      {
        "title": "Making it cheaper",
        "body": "Quantize weights (8- or 4-bit), route easy requests to smaller or distilled models, cache prefixes, use speculative decoding, and cap max output tokens."
      },
      {
        "title": "Safe rollouts",
        "body": "Run evals and shadow traffic first, then a small canary. Compare quality, latency and cost, and keep the old version warm for instant rollback."
      },
      {
        "title": "Fairness between customers",
        "body": "Per-customer token quotas and priority queues, so one heavy user cannot starve everyone else."
      }
    ]
  },
  {
    "id": "fraud",
    "name": "Real-time fraud detection",
    "track": "ai",
    "nodes": {
      "pay": {
        "label": "Checkout",
        "type": "client",
        "x": 85,
        "y": 230,
        "info": "A card payment is submitted. The decision must come back inside the payment flow."
      },
      "api": {
        "label": "Payments API",
        "type": "service",
        "x": 275,
        "y": 230,
        "info": "Calls the risk service before authorizing, and falls back to rules if it times out."
      },
      "risk": {
        "label": "Risk scoring service",
        "type": "service",
        "x": 480,
        "y": 230,
        "info": "Combines hard rules with the model score into approve, decline or review, within about 50–100 ms."
      },
      "rules": {
        "label": "Rules engine",
        "type": "service",
        "x": 480,
        "y": 70,
        "info": "Fast, explainable checks such as blocked cards, impossible travel and velocity limits. Analysts can update them quickly."
      },
      "model": {
        "label": "Fraud model",
        "type": "model",
        "x": 690,
        "y": 150,
        "info": "Gradient-boosted trees or a neural network that outputs a fraud probability. It must be calibrated so thresholds map to business cost."
      },
      "fs": {
        "label": "Online features",
        "type": "cache",
        "x": 690,
        "y": 310,
        "info": "Real-time aggregates such as \"payments from this card in the last hour\", plus device and merchant features."
      },
      "stream": {
        "label": "Event stream",
        "type": "queue",
        "x": 275,
        "y": 400,
        "info": "All payments and outcomes, used for real-time features and training data."
      },
      "review": {
        "label": "Manual review",
        "type": "worker",
        "x": 480,
        "y": 400,
        "info": "Analysts check borderline cases. Their decisions are fast labels."
      },
      "labels": {
        "label": "Labels & retraining",
        "type": "worker",
        "x": 690,
        "y": 430,
        "info": "Joins chargebacks and analyst decisions to past payments and retrains the model."
      }
    },
    "edges": [
      [
        "pay",
        "api"
      ],
      [
        "api",
        "risk"
      ],
      [
        "risk",
        "rules"
      ],
      [
        "risk",
        "model"
      ],
      [
        "model",
        "fs"
      ],
      [
        "risk",
        "review"
      ],
      [
        "api",
        "stream"
      ],
      [
        "review",
        "labels"
      ]
    ],
    "flows": [
      {
        "name": "Score a payment",
        "steps": [
          {
            "from": "pay",
            "to": "api",
            "text": "Card payment of $420 from a new device"
          },
          {
            "from": "api",
            "to": "risk",
            "text": "Score this payment within 100 ms"
          },
          {
            "from": "risk",
            "to": "rules",
            "text": "No hard rule fires"
          },
          {
            "from": "risk",
            "to": "model",
            "text": "Request a fraud score"
          },
          {
            "from": "model",
            "to": "fs",
            "text": "6 payments on this card in the last hour; device first seen today"
          },
          {
            "from": "risk",
            "to": "review",
            "text": "Score 0.71 is between the thresholds, so hold for review"
          },
          {
            "from": "api",
            "to": "stream",
            "text": "Publish the payment and the decision"
          }
        ]
      },
      {
        "name": "Learn from outcomes",
        "steps": [
          {
            "from": "review",
            "to": "labels",
            "text": "An analyst marks it as fraud"
          },
          {
            "from": "stream",
            "to": "labels",
            "text": "Chargebacks arrive weeks later and are joined to the original payment"
          },
          {
            "from": "labels",
            "to": "model",
            "text": "Retrain, compare on recent data, and shadow-test before switching"
          }
        ]
      }
    ],
    "requirements": {
      "functional": [
        "Approve, decline or review each payment",
        "Explain decisions to analysts",
        "Let analysts add rules quickly",
        "Adapt to new fraud patterns"
      ],
      "nonFunctional": [
        "Decision in under 100 ms",
        "Never block checkout if scoring fails",
        "Few false declines",
        "Auditable decisions"
      ]
    },
    "estimates": [
      "~5K payments/s at peak",
      "Fraud rate ~0.1%, so data is **heavily imbalanced** and accuracy is meaningless",
      "Chargeback labels arrive 30–90 days late",
      "Feature lookups must take ~10 ms to fit the budget"
    ],
    "api": [
      "POST /risk/score {payment, card, device, merchant} → {decision, score, reasons}",
      "POST /risk/feedback {payment_id, label}",
      "PUT /rules/{id}"
    ],
    "deepDives": [
      {
        "title": "Choosing the threshold",
        "body": "Use costs, not accuracy: missed fraud costs the payment amount, a false decline costs margin and trust. Two thresholds create a manual-review band in the middle. Try the precision and recall lab to see the trade-off."
      },
      {
        "title": "Imbalanced data",
        "body": "Look at precision–recall curves rather than accuracy, use class weights or down-sample negatives (then recalibrate), and split train and test by time."
      },
      {
        "title": "Delayed and biased labels",
        "body": "Chargebacks arrive weeks later, and you never learn the outcome for declined payments. Keep a small random holdout that bypasses the model to measure true performance."
      },
      {
        "title": "Drift and adversaries",
        "body": "Fraudsters adapt. Monitor score and feature distributions, retrain often, and let analysts add rules for brand-new patterns until the model catches up."
      },
      {
        "title": "Explainability",
        "body": "Return the top contributing features (e.g. SHAP values) with each score so analysts and customers get a reason."
      }
    ]
  }
];
