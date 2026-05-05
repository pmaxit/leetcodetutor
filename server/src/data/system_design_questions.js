/**
 * System Design Questions Data
 * Each question has ordered stages mirroring the HelloInterview delivery framework:
 *   1. Functional Requirements
 *   2. Non-Functional Requirements
 *   3. Core Entities
 *   4. API Design
 *   5. High-Level Design
 *   6. Deep Dives
 */

const SYSTEM_DESIGN_QUESTIONS = [
  {
    id: 'bitly',
    title: 'Design a URL Shortener (Bitly)',
    difficulty: 'Medium',
    category: 'System Design',
    description:
      'Design a URL shortening service like Bitly that allows users to submit a long URL and receive a shortened version, and redirects users who access the short URL to the original destination.',
    stages: [
      {
        id: 1,
        name: 'Functional Requirements',
        icon: '📋',
        prompt:
          'What are the **core functional requirements** for this URL shortener? Define what the system must do from a user-facing perspective.',
        hint: 'Think: What does a user actually DO with a URL shortener? What are the must-haves vs nice-to-haves?',
        successKeywords: ['shorten', 'redirect', 'short url', 'long url', 'custom alias', 'expiration'],
        referenceAnswer: {
          core: [
            'Users should be able to submit a long URL and receive a shortened version.',
            'Users should be able to access the original URL by using the shortened URL (redirect).',
          ],
          optional: [
            'Users can specify a custom alias (e.g. short.ly/my-alias).',
            'Users can set an expiration date for their short URL.',
          ],
          outOfScope: ['User authentication & account management.', 'Click analytics (geographic data, click counts).'],
        },
        probeQuestion:
          "You've listed shortening and redirecting. Should we support custom aliases? What's the storage impact of tracking click analytics vs. leaving it out of scope?",
      },
      {
        id: 2,
        name: 'Non-Functional Requirements',
        icon: '⚡',
        prompt:
          'Define the **non-functional requirements**: performance targets, reliability, scale, and key trade-offs.',
        hint: 'Think about: latency SLAs, availability target, scale (DAU / total URLs), and the CAP trade-off (consistency vs. availability).',
        successKeywords: ['latency', 'availability', 'scale', 'dau', 'unique', '100ms', '99.9', 'consistent'],
        referenceAnswer: {
          core: [
            'Short code uniqueness: each short code maps to exactly one long URL.',
            'Redirection latency < 100ms.',
            'High availability: 99.99% uptime (availability > consistency).',
            'Scale: 1B shortened URLs, 100M DAU.',
          ],
          outOfScope: ['Real-time analytics consistency.', 'Advanced security (spam/malicious URL detection).'],
        },
        probeQuestion:
          'You mentioned high availability. If two servers race to create the same short code, how do you ensure uniqueness without sacrificing latency?',
      },
      {
        id: 3,
        name: 'Core Entities',
        icon: '🗄️',
        prompt:
          'Define the **core data entities** your system needs. What does the database schema look like at a high level?',
        hint: 'What data do you need to store to support shortening + redirecting? What are the key fields?',
        successKeywords: ['url', 'short code', 'long url', 'user', 'expiration', 'created_at', 'alias'],
        referenceAnswer: {
          entities: [
            'URL Mapping: { short_code (PK), long_url, created_at, expires_at, user_id? }',
            'User (optional): { user_id (PK), email, created_at }',
          ],
        },
        probeQuestion:
          "Good. Where would you store the short_code → long_url mapping? What's your primary key, and why does that matter for lookup performance?",
      },
      {
        id: 4,
        name: 'API Design',
        icon: '🔌',
        prompt: 'Design the **REST API** for your system. List the endpoints, HTTP methods, request/response formats.',
        hint: 'What are the two core operations? How does a browser perform a redirect via HTTP?',
        successKeywords: ['post', 'get', '302', '301', 'short_url', 'long_url', 'redirect', '/urls', 'short_code'],
        referenceAnswer: {
          endpoints: [
            'POST /urls — Body: { long_url, custom_alias?, expiration_date? } → Response: { short_url }',
            'GET /{short_code} → HTTP 302 Redirect to long_url',
          ],
          notes: [
            'Use 302 (Temporary Redirect) over 301 (Permanent) to prevent browsers from caching the redirect, allowing future URL updates/expirations and analytics tracking.',
          ],
        },
        probeQuestion:
          "Why use HTTP 302 instead of 301 for the redirect? What's the operational risk if you choose 301 and later need to expire or update a URL?",
      },
      {
        id: 5,
        name: 'High-Level Design',
        icon: '🏗️',
        prompt:
          'Sketch the **high-level architecture**. Draw the major components and how they interact for both the shorten-URL and redirect flows. Use the whiteboard!',
        hint: 'Walk through the two main flows: (1) Shorten a URL, (2) Redirect a user. What components touch each request?',
        successKeywords: ['client', 'server', 'database', 'load balancer', 'cache', 'redis', 'primary server'],
        referenceAnswer: {
          components: [
            'Client (browser/mobile)',
            'Load Balancer (distribute traffic)',
            'Primary Server (handles business logic)',
            'Database (stores short_code → long_url mapping)',
          ],
          flows: {
            shorten: [
              '1. Client sends POST /urls with long_url.',
              '2. Primary Server validates URL format.',
              '3. Server generates a short_code (magic function for now).',
              '4. Server stores { short_code, long_url, expiration } in DB.',
              '5. Server returns { short_url }.',
            ],
            redirect: [
              "1. User's browser sends GET /{short_code}.",
              '2. Primary Server looks up short_code in DB.',
              '3. If found and not expired → return HTTP 302 to long_url.',
              '4. If expired → return HTTP 410 Gone.',
            ],
          },
        },
        probeQuestion:
          "This design works but won't meet the <100ms SLA at 100M DAU. Every redirect hits the database. What's the first thing you'd add to fix that?",
      },
      {
        id: 6,
        name: 'Deep Dive: Unique Short Codes',
        icon: '🔬',
        prompt:
          '**Deep Dive #1:** How do you generate unique short codes at scale? Walk through at least two approaches and their trade-offs.',
        hint: "Three approaches to consider: (1) URL prefix/hash, (2) Hash function + Base62, (3) Distributed counter + Base62. What's the problem with each?",
        successKeywords: ['hash', 'base62', 'counter', 'collision', 'md5', 'sha', 'unique', 'distributed', 'redis'],
        referenceAnswer: {
          approaches: [
            {
              name: 'Bad: Long URL Prefix',
              description: 'Take first N chars of the URL. Not unique (collisions guaranteed).',
            },
            {
              name: 'Great: Hash Function + Base62',
              description:
                'hash(long_url) → base62_encode → first 8 chars. Risk: hash collisions (need collision resolution strategy).',
              code: `hash_code = hash(canonical_url)\nshort_code = base62_encode(hash_code)[:8]`,
            },
            {
              name: 'Great: Unique Counter + Base62',
              description:
                'Global atomic counter (e.g., Redis INCR). Encode counter in base62. 1B in base62 = only 6 chars. Risk: counter is a single point of failure → use batched counters per Write Service instance.',
            },
          ],
        },
        probeQuestion:
          'If you use a hash function and two different long URLs happen to produce the same 8-char hash, how do you handle that collision without sacrificing write latency?',
      },
      {
        id: 7,
        name: 'Deep Dive: Scaling Redirects',
        icon: '🚀',
        prompt:
          '**Deep Dive #2:** How do you ensure redirects are fast (< 100ms) at 100M DAU? What technologies and patterns would you add?',
        hint: 'The read:write ratio for a URL shortener is extremely skewed. What does that imply about the optimization strategy?',
        successKeywords: ['cache', 'redis', 'cdn', 'index', 'b-tree', 'read', 'hot', 'ttl', 'lru', 'memory'],
        referenceAnswer: {
          solutions: [
            {
              name: 'Good: Add a DB Index',
              description:
                'B-tree index on short_code (already the PK). O(log n) lookup. Helps but still requires a DB round-trip.',
            },
            {
              name: 'Great: In-Memory Cache (Redis)',
              description:
                'Cache short_code → long_url in Redis. Memory access = ~100ns vs SSD = ~0.1ms. Cache hot URLs with LRU eviction. Cache miss → DB lookup → repopulate cache.',
              perf: 'Memory: millions of reads/sec. SSD: ~100K IOPS. HDD: ~200 IOPS.',
            },
            {
              name: 'Great: CDN + Edge Computing',
              description:
                'Push popular short codes to CDN edge nodes. Redirect happens at the edge, sub-millisecond, no origin server touch.',
            },
          ],
        },
        probeQuestion:
          'You add Redis. Now the cache contains a URL that was deleted or expired. How do you handle stale cache entries without adding too much latency on the hot path?',
      },
    ],
  },
];

module.exports = { SYSTEM_DESIGN_QUESTIONS };
