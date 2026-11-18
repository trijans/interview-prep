import type { Concept } from './types';

/** Core system design concepts. */
export const CONCEPTS: Concept[] = [
  {
    "title": "Scaling: vertical vs horizontal",
    "body": "Vertical means a bigger machine: simple, but there is a ceiling and a single point of failure. Horizontal means more machines: keep services stateless and put session state in Redis or a DB so any instance can serve any request."
  },
  {
    "title": "Load balancing",
    "body": "L4 (TCP) is fast. L7 (HTTP) can route by path or header, terminate TLS and do sticky sessions. Algorithms: round robin, least connections, consistent hashing (for cache affinity). Use health checks, and run the LB itself in an active-passive pair."
  },
  {
    "title": "Caching",
    "body": "Patterns: **cache-aside** (the app reads the cache, then the DB on a miss: most common), **write-through** (write to the cache and DB together), **write-back** (write to the cache and flush later: fast, but can lose data). Eviction: LRU or LFU. The hard parts are invalidation, stampedes and hot keys."
  },
  {
    "title": "SQL vs NoSQL",
    "body": "SQL: relations, joins, ACID transactions, strong consistency (payments, inventory). NoSQL: key-value (Redis, DynamoDB), document (MongoDB), wide-column (Cassandra: write-heavy, time series), graph (Neo4j). Choose by access pattern, not by hype."
  },
  {
    "title": "Replication",
    "body": "Leader–follower: writes go to the leader, reads scale across replicas, but replication lag breaks read-your-writes. Multi-leader: writes in several regions, with conflicts to resolve. Leaderless (Dynamo style): quorum reads and writes where R + W > N."
  },
  {
    "title": "Sharding / partitioning",
    "body": "By hash (even spread, but range queries are hard), by range (good for scans, but risks hot spots), or by geography. Problems: cross-shard joins and transactions, rebalancing (use consistent hashing), celebrity hot keys."
  },
  {
    "title": "CAP and PACELC",
    "body": "During a network partition you choose consistency (CP: refuse some requests) or availability (AP: serve possibly stale data). PACELC adds that even without a partition you trade latency for consistency. Banking leans CP. Social feeds lean AP."
  },
  {
    "title": "Message queues and streams",
    "body": "Queues (SQS, RabbitMQ) decouple producers and consumers, absorb spikes and allow retries. Streams (Kafka) are durable, replayable logs read by many consumer groups. Delivery is usually at-least-once, so make consumers idempotent."
  },
  {
    "title": "CDN",
    "body": "Caches static content and media at edges near users. Push CDN (you upload) or pull CDN (fetched on first request). Version file names to bust caches."
  },
  {
    "title": "Unique IDs at scale",
    "body": "UUIDv4: random, no coordination, but not sortable. Snowflake (timestamp + machine + sequence): 64-bit and time-sortable. A DB auto-increment does not scale across shards."
  },
  {
    "title": "Latency numbers to know",
    "body": "L1 cache ~1 ns · RAM ~100 ns · SSD random read ~100 µs · same-datacenter round trip ~0.5 ms · HDD seek ~10 ms · US↔Europe round trip ~100–150 ms."
  },
  {
    "title": "Availability (the \"nines\")",
    "body": "99.9% ≈ 8.8 h of downtime per year · 99.99% ≈ 53 min/year · 99.999% ≈ 5 min/year. Components in series multiply their availabilities. Redundant components in parallel raise it."
  }
];
