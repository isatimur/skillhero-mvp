
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Layers, Server, Database, Globe, Zap, Shield, Radio,
  HardDrive, Network, Clock, Hash, Wifi, Cloud, Box, MessageSquare,
  CheckCircle2, XCircle, ChevronRight, Award, Brain, BookOpen,
  HelpCircle, Target, Cpu, Lock, BarChart3, Workflow, Shuffle,
  AlertTriangle, Star, Trophy
} from 'lucide-react';
import { User } from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface SystemDesignProps {
  user: User;
  onBack: () => void;
  onGainXp?: (amount: number) => void;
}

type TabId = 'patterns' | 'challenges' | 'concepts' | 'quiz' | 'cto-raid';

interface Pattern {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  keyConcepts: string[];
  details: string;
  diagram: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

interface Challenge {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  requirements: { users: string; qps: string; dataSize: string };
  requiredComponents: string[];
  explanation: string;
  xpReward: number;
}

interface Concept {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  points: { title: string; detail: string }[];
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

interface CtoPrinciple {
  id: string;
  label: string;
  description: string;
}

interface CtoMission {
  id: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Mythic';
  name: string;
  bossName: string;
  scenario: string;
  nonFunctional: { qps: string; p95: string; availability: string; budget: string };
  requiredComponents: string[];
  recommendedPrinciples: string[];
  xpReward: number;
}

// ============================================================================
// DATA - PATTERNS
// ============================================================================

const PATTERNS: Pattern[] = [
  {
    id: 'load-balancer',
    name: 'Load Balancer',
    icon: <Shuffle size={24} />,
    color: 'from-blue-500/30 to-cyan-500/30 border-blue-400/40',
    description: 'Distributes incoming traffic across multiple servers to ensure no single server is overwhelmed.',
    keyConcepts: ['Round Robin', 'Least Connections', 'Health Checks', 'L4 vs L7'],
    details: `A load balancer acts as a traffic cop sitting in front of your servers, routing client requests across all servers capable of fulfilling those requests in a manner that maximizes speed and capacity utilization.

Round Robin: Requests are distributed sequentially across servers. Simple but doesn't account for server load.

Least Connections: Routes to the server with the fewest active connections. Better for varying request complexity.

Weighted Round Robin: Assigns weights to servers based on capacity. A server with weight 3 gets 3x the traffic of weight 1.

Health Checks: The load balancer periodically pings servers. If a server fails to respond, it's removed from the pool until it recovers.

L4 (Transport Layer): Routes based on IP and TCP/UDP port. Faster but less intelligent.

L7 (Application Layer): Routes based on HTTP headers, URLs, cookies. More flexible — can route /api to backend servers and /static to CDN.

Common implementations: AWS ALB/NLB, Nginx, HAProxy, F5.`,
    diagram: `
    ┌─────────┐
    │ Clients │
    └────┬────┘
         │
    ┌────▼────┐
    │  Load   │
    │Balancer │
    └──┬──┬──┬┘
       │  │  │
   ┌───▼┐┌▼──▼───┐
   │ S1 ││S2 │ S3│
   └────┘└───┴───┘`,
    quiz: {
      question: 'Which load balancing algorithm is best when requests have varying processing times?',
      options: ['Round Robin', 'Least Connections', 'Random', 'IP Hash'],
      correctIndex: 1,
      explanation: 'Least Connections routes traffic to the server with the fewest active connections, making it ideal when request processing times vary significantly.'
    }
  },
  {
    id: 'cdn',
    name: 'CDN',
    icon: <Globe size={24} />,
    color: 'from-green-500/30 to-emerald-500/30 border-green-400/40',
    description: 'Content Delivery Network caches content at edge locations worldwide for faster delivery.',
    keyConcepts: ['Edge Caching', 'Origin Server', 'Cache Invalidation', 'PoP'],
    details: `A CDN is a geographically distributed network of proxy servers and their data centers. The goal is to provide high availability and performance by distributing the service spatially relative to end users.

Edge Caching: Content is cached at Points of Presence (PoPs) near users. When a user in Tokyo requests an image, the Tokyo PoP serves it instead of the origin in Virginia.

Pull CDN: Content is fetched from origin on first request, then cached. Simpler to set up, works well for most use cases. Example: Cloudflare.

Push CDN: You upload content directly to CDN. Better for large, infrequently changing files. Example: uploading video to CDN nodes.

Cache Invalidation: When content changes at origin, CDN caches must be updated. Strategies include TTL-based expiry, versioned URLs (style.v2.css), and purge APIs.

Cache Headers: Cache-Control, ETag, and Last-Modified headers control caching behavior. max-age=86400 caches for 24 hours.

Common CDN providers: CloudFront, Cloudflare, Akamai, Fastly.

Benefits: Reduced latency (50-300ms improvement), reduced origin load, DDoS protection, SSL termination at edge.`,
    diagram: `
    ┌───────────────────────────┐
    │       Origin Server       │
    └─────────┬─────────────────┘
              │ Pull/Push
    ┌─────────▼─────────────────┐
    │      CDN Edge Network     │
    │  ┌─────┐ ┌─────┐ ┌─────┐ │
    │  │Tokyo│ │ NYC │ │London│ │
    │  └──┬──┘ └──┬──┘ └──┬──┘ │
    └─────┼───────┼───────┼────┘
          │       │       │
        Users   Users   Users`,
    quiz: {
      question: 'What is the main disadvantage of a Pull CDN?',
      options: [
        'Higher cost than Push CDN',
        'First request to each edge is slow (cache miss)',
        'Cannot serve dynamic content',
        'Requires manual deployment to each PoP'
      ],
      correctIndex: 1,
      explanation: 'With a Pull CDN, the first request to any edge location results in a cache miss — the CDN must fetch from origin, adding latency. Subsequent requests are fast.'
    }
  },
  {
    id: 'db-sharding',
    name: 'Database Sharding',
    icon: <Database size={24} />,
    color: 'from-purple-500/30 to-violet-500/30 border-purple-400/40',
    description: 'Horizontal partitioning of data across multiple database instances for scalability.',
    keyConcepts: ['Shard Keys', 'Consistent Hashing', 'Range-based', 'Cross-shard Queries'],
    details: `Database sharding is splitting a large dataset across multiple database instances (shards). Each shard holds a subset of the data and operates independently.

Shard Key Selection: The shard key determines which shard stores each record. A good shard key has high cardinality, even distribution, and matches query patterns. Example: user_id for user data.

Range-based Sharding: Data is split by ranges (users A-M on shard 1, N-Z on shard 2). Simple but can create hotspots if distribution is uneven.

Hash-based Sharding: Apply hash(shard_key) % num_shards. More even distribution but range queries become expensive.

Directory-based Sharding: A lookup table maps each key to its shard. Flexible but the directory is a single point of failure.

Challenges:
- Cross-shard joins are expensive and complex
- Resharding when adding/removing shards requires data migration
- Maintaining referential integrity across shards is difficult
- Auto-increment IDs need global coordination (use UUIDs or snowflake IDs)

Best practices: Start with read replicas before sharding. Shard only when single-server capacity is truly exceeded. Consider managed solutions (Vitess, CockroachDB, MongoDB Atlas).`,
    diagram: `
    ┌──────────────┐
    │ Application  │
    └──────┬───────┘
           │ shard_key
    ┌──────▼───────┐
    │  Shard Router │
    └──┬─────┬────┬┘
       │     │    │
   ┌───▼─┐┌─▼──┐┌▼───┐
   │Shard││Shard││Shard│
   │ A-H ││ I-P ││ Q-Z │
   └─────┘└────┘└─────┘`,
    quiz: {
      question: 'What is the biggest challenge with database sharding?',
      options: [
        'Increased read latency',
        'Cross-shard joins and transactions',
        'Higher storage costs',
        'Reduced write throughput'
      ],
      correctIndex: 1,
      explanation: 'Cross-shard joins require fetching data from multiple shards and combining results, which is complex and slow. Distributed transactions across shards require coordination protocols like 2PC.'
    }
  },
  {
    id: 'caching',
    name: 'Caching',
    icon: <Zap size={24} />,
    color: 'from-yellow-500/30 to-amber-500/30 border-yellow-400/40',
    description: 'Storing frequently accessed data in fast storage to reduce database load and latency.',
    keyConcepts: ['Redis', 'Write-through', 'Write-back', 'Cache-aside', 'TTL'],
    details: `Caching stores copies of frequently accessed data in a faster storage layer (RAM) to reduce the load on slower storage (disk/database).

Cache-aside (Lazy Loading): Application checks cache first. On miss, reads from DB, writes to cache, returns data. Most common pattern. Risk: stale data if DB is updated without invalidating cache.

Write-through: Every write goes to both cache and DB simultaneously. Data is always consistent but writes are slower (2 writes per operation).

Write-back (Write-behind): Writes go to cache only. Cache asynchronously writes to DB in batches. Fast writes but risk of data loss if cache crashes before flush.

Read-through: Cache sits between app and DB. On miss, cache itself fetches from DB. Simplifies application code.

Eviction Policies:
- LRU (Least Recently Used): Evicts least recently accessed. Most common.
- LFU (Least Frequently Used): Evicts least frequently accessed. Good for skewed access patterns.
- TTL (Time to Live): Data expires after set time. Good for session data.

Redis vs Memcached: Redis supports data structures (lists, sets, sorted sets), persistence, and pub/sub. Memcached is simpler, multi-threaded, slightly faster for pure key-value.

Cache stampede: When many requests hit the same expired cache key simultaneously, all hit the DB. Solutions: lock/mutex, probabilistic early expiration.`,
    diagram: `
    ┌─────────┐  1.Check  ┌───────┐
    │   App   │──────────▶│ Cache │
    │ Server  │◀──────────│(Redis)│
    └────┬────┘  2.Hit?   └───────┘
         │
    3.Miss│
         │
    ┌────▼────┐
    │Database │  4.Update cache
    └─────────┘`,
    quiz: {
      question: 'Which caching strategy has the risk of data loss if the cache crashes?',
      options: ['Cache-aside', 'Write-through', 'Write-back', 'Read-through'],
      correctIndex: 2,
      explanation: 'Write-back (write-behind) writes to cache only and asynchronously flushes to DB. If the cache crashes before flushing, those writes are lost.'
    }
  },
  {
    id: 'message-queue',
    name: 'Message Queue',
    icon: <MessageSquare size={24} />,
    color: 'from-red-500/30 to-rose-500/30 border-red-400/40',
    description: 'Asynchronous communication between services using message brokers for decoupling.',
    keyConcepts: ['Kafka', 'RabbitMQ', 'Pub/Sub', 'Event-driven', 'Dead Letter Queue'],
    details: `Message queues enable asynchronous communication between services. A producer sends messages to a queue, and a consumer processes them independently.

Point-to-Point: Each message is consumed by exactly one consumer. Good for task distribution. Example: order processing.

Pub/Sub (Publish-Subscribe): Messages are broadcast to all subscribers of a topic. Good for event notifications. Example: user signup triggers email, analytics, and welcome notification services.

Kafka: Distributed streaming platform. Messages are stored in ordered, immutable logs (topics with partitions). Supports replay. High throughput (millions of messages/sec). Consumer groups enable parallel processing.

RabbitMQ: Traditional message broker with AMQP protocol. Supports complex routing, priority queues, message acknowledgment. Better for task queues with complex routing needs.

Key Patterns:
- Dead Letter Queue (DLQ): Failed messages are moved to a separate queue for investigation.
- Retry with backoff: Failed messages are retried with exponential delays.
- Idempotency: Consumers should handle duplicate messages gracefully.
- Ordering: Kafka guarantees order within a partition. Use partition keys for ordered processing.

Use cases: Order processing, email sending, log aggregation, real-time analytics, event sourcing.`,
    diagram: `
    ┌──────────┐         ┌──────────┐
    │Producer A│────┐    │Consumer 1│
    └──────────┘    │    └────▲─────┘
                ┌───▼────┐   │
    ┌──────────┐│ Message │───┘
    │Producer B││  Queue  │
    └──────────┘│(Broker) │───┐
                └───▲────┘   │
    ┌──────────┐    │    ┌───▼──────┐
    │Producer C│────┘    │Consumer 2│
    └──────────┘         └──────────┘`,
    quiz: {
      question: 'What does Kafka guarantee that most traditional message queues do not?',
      options: [
        'Exactly-once delivery',
        'Message ordering within a partition',
        'Zero latency',
        'Automatic scaling'
      ],
      correctIndex: 1,
      explanation: 'Kafka guarantees message ordering within a partition. Messages with the same partition key are always consumed in order. Traditional queues often don\'t guarantee ordering.'
    }
  },
  {
    id: 'api-gateway',
    name: 'API Gateway',
    icon: <Shield size={24} />,
    color: 'from-indigo-500/30 to-blue-500/30 border-indigo-400/40',
    description: 'Single entry point for all API calls handling auth, rate limiting, routing, and aggregation.',
    keyConcepts: ['Rate Limiting', 'Authentication', 'Request Routing', 'Response Aggregation'],
    details: `An API Gateway is a server that acts as the single entry point for all client requests. It handles cross-cutting concerns so individual services don't have to.

Core Responsibilities:
- Request Routing: Routes /users/* to User Service, /orders/* to Order Service.
- Authentication & Authorization: Validates JWT tokens, API keys, OAuth. Rejects unauthorized requests before they reach backend services.
- Rate Limiting: Prevents abuse by limiting requests per user/IP. Algorithms: token bucket, sliding window.
- Request/Response Transformation: Converts between protocols (REST to gRPC), formats (XML to JSON), or versions.
- Response Aggregation: Combines responses from multiple microservices into a single response for the client.
- SSL Termination: Handles HTTPS at the gateway, internal traffic can be HTTP.
- Caching: Caches responses for repeated identical requests.
- Circuit Breaking: Stops forwarding requests to a failing service, returns cached/default response.

API Gateway vs Load Balancer: Load balancers distribute traffic across instances of the same service. API Gateways route to different services and add business logic.

Popular implementations: Kong, AWS API Gateway, Nginx Plus, Envoy, Zuul (Netflix).

BFF Pattern (Backend for Frontend): Different API gateways optimized for different clients (mobile vs web vs IoT).`,
    diagram: `
    ┌───────┐ ┌───────┐ ┌───────┐
    │Mobile │ │  Web  │ │  IoT  │
    └───┬───┘ └───┬───┘ └───┬───┘
        │         │         │
    ┌───▼─────────▼─────────▼───┐
    │       API Gateway         │
    │ [Auth][Rate][Route][Cache]│
    └──┬──────┬──────┬──────┬──┘
       │      │      │      │
    ┌──▼─┐ ┌─▼──┐ ┌─▼──┐ ┌▼───┐
    │User│ │Order│ │Pay │ │Noti│
    │Svc │ │ Svc│ │Svc │ │fy  │
    └────┘ └────┘ └────┘ └────┘`,
    quiz: {
      question: 'What is the BFF (Backend for Frontend) pattern?',
      options: [
        'A database optimization technique',
        'Separate API gateways optimized for different client types',
        'A caching strategy for frontend assets',
        'A load balancing algorithm'
      ],
      correctIndex: 1,
      explanation: 'BFF creates separate API gateways for different clients (mobile, web, IoT). Each BFF is tailored to the specific needs and data shapes of its frontend.'
    }
  },
  {
    id: 'microservices',
    name: 'Microservices',
    icon: <Workflow size={24} />,
    color: 'from-teal-500/30 to-cyan-500/30 border-teal-400/40',
    description: 'Architecture pattern decomposing applications into small, independently deployable services.',
    keyConcepts: ['Service Mesh', 'Service Discovery', 'Circuit Breaker', 'Saga Pattern'],
    details: `Microservices architecture structures an application as a collection of loosely coupled, independently deployable services. Each service owns its data and business logic.

Key Principles:
- Single Responsibility: Each service does one thing well.
- Independent Deployment: Deploy, scale, and update services independently.
- Decentralized Data: Each service owns its database. No shared databases.
- API Contracts: Services communicate via well-defined APIs (REST, gRPC, events).

Service Discovery: Services need to find each other. Client-side discovery (services query a registry like Consul/Eureka) or server-side discovery (load balancer queries registry).

Circuit Breaker Pattern: Prevents cascade failures. If Service B is down, Service A stops calling it (circuit opens) and returns a fallback response. After a timeout, it tries again (half-open). If successful, circuit closes. Libraries: Hystrix, Resilience4j.

Saga Pattern: Manages distributed transactions across services. Each service performs its local transaction and publishes an event. If any step fails, compensating transactions are triggered to undo previous steps. Types: Choreography (events) or Orchestration (central coordinator).

Service Mesh (Istio, Linkerd): Infrastructure layer handling service-to-service communication. Provides load balancing, encryption, observability, and traffic management without changing application code.

Challenges: Network latency, distributed tracing, data consistency, operational complexity, testing difficulty.`,
    diagram: `
    ┌─────────────────────────────┐
    │        Service Mesh         │
    │  ┌─────┐  ┌─────┐  ┌─────┐│
    │  │Auth ├──▶Order├──▶Pay  ││
    │  │ Svc │  │ Svc │  │ Svc ││
    │  └──┬──┘  └──┬──┘  └──┬──┘│
    │     │        │        │   │
    │  ┌──▼──┐  ┌──▼──┐  ┌─▼──┐│
    │  │DB-A │  │DB-B │  │DB-C││
    │  └─────┘  └─────┘  └────┘│
    └─────────────────────────────┘`,
    quiz: {
      question: 'What pattern prevents cascade failures in microservices?',
      options: ['Saga Pattern', 'Circuit Breaker', 'Service Mesh', 'Event Sourcing'],
      correctIndex: 1,
      explanation: 'The Circuit Breaker pattern detects failures and prevents requests from being sent to a failing service. It "opens" the circuit to stop cascade failures and provides fallback responses.'
    }
  },
  {
    id: 'db-replication',
    name: 'Database Replication',
    icon: <HardDrive size={24} />,
    color: 'from-orange-500/30 to-amber-500/30 border-orange-400/40',
    description: 'Copying data across multiple database servers for availability, fault tolerance, and read scaling.',
    keyConcepts: ['Leader-Follower', 'Multi-Leader', 'Quorum', 'CAP Theorem'],
    details: `Database replication keeps copies of the same data on multiple machines to improve availability, fault tolerance, and read performance.

Leader-Follower (Master-Slave): One leader handles all writes. Followers replicate the leader's data and serve reads. If leader fails, a follower is promoted. Simple and common.

Synchronous Replication: Leader waits for follower acknowledgment before confirming write. Guarantees data consistency but increases write latency.

Asynchronous Replication: Leader confirms write immediately, followers catch up later. Low latency but followers may serve stale data. Risk of data loss if leader crashes before replication.

Multi-Leader: Multiple nodes accept writes. Useful for multi-datacenter setups. Challenge: write conflicts need resolution (last-write-wins, merge, custom logic).

CAP Theorem: In a distributed system, you can only guarantee 2 of 3:
- Consistency: Every read returns the most recent write.
- Availability: Every request receives a response.
- Partition Tolerance: System works despite network failures.

In practice, P is mandatory (networks fail), so the choice is between CP (consistent, may be unavailable during partition) and AP (available, may serve stale data).

CP examples: MySQL with sync replication, HBase, MongoDB (with majority reads).
AP examples: Cassandra, DynamoDB, CouchDB.`,
    diagram: `
    ┌──────────────┐
    │  Writes ──▶  │
    │    Leader     │
    │  (Primary)   │
    └──┬───────┬───┘
       │ Sync  │ Async
    ┌──▼───┐ ┌─▼────┐
    │Follow│ │Follow│
    │ er 1 │ │ er 2 │
    │(Sync)│ │(Async│
    └──────┘ └──────┘
     Reads◀   Reads◀`,
    quiz: {
      question: 'According to CAP theorem, what must a distributed system always tolerate?',
      options: ['Consistency', 'Availability', 'Partition tolerance', 'Latency'],
      correctIndex: 2,
      explanation: 'Network partitions are inevitable in distributed systems, so Partition Tolerance (P) is always required. The real choice is between Consistency (CP) and Availability (AP).'
    }
  },
  {
    id: 'rate-limiting',
    name: 'Rate Limiting',
    icon: <Clock size={24} />,
    color: 'from-pink-500/30 to-rose-500/30 border-pink-400/40',
    description: 'Controlling the rate of requests to prevent abuse and ensure fair resource usage.',
    keyConcepts: ['Token Bucket', 'Sliding Window', 'Fixed Window', 'Leaky Bucket'],
    details: `Rate limiting controls how many requests a client can make in a given time period. Essential for API protection, preventing abuse, and ensuring fair resource usage.

Token Bucket: A bucket holds tokens (max = burst size). Tokens are added at a fixed rate. Each request consumes a token. If bucket is empty, request is rejected. Allows bursts up to bucket size. Used by: AWS, Stripe.

Leaky Bucket: Requests enter a queue (bucket) and are processed at a fixed rate. Excess requests are dropped. Smooths out bursts. Used for: traffic shaping.

Fixed Window: Count requests in fixed time windows (e.g., 100 requests per minute). Simple but allows burst at window boundaries (200 requests if split across boundary).

Sliding Window Log: Tracks timestamp of each request. Counts requests in the sliding window. Accurate but memory-intensive (stores all timestamps).

Sliding Window Counter: Combines fixed window and sliding window. Estimates count using weighted average of current and previous window. Good balance of accuracy and efficiency.

Implementation: Use Redis INCR with EXPIRE for distributed rate limiting. Key format: rate_limit:{user_id}:{window}. Return headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset.

HTTP 429 Too Many Requests is the standard response code when rate limited.`,
    diagram: `
    Token Bucket Algorithm:

    Tokens added      ┌─────────┐
    at fixed rate ──▶ │ Bucket  │
                      │ ○○○○○○  │ max=10
                      │ ○○○○    │ current=4
                      └────┬────┘
                           │ -1 token
                      ┌────▼────┐
                      │ Request │
                      │Processed│
                      └─────────┘`,
    quiz: {
      question: 'Which rate limiting algorithm allows request bursts?',
      options: ['Leaky Bucket', 'Token Bucket', 'Fixed Window', 'Sliding Window Log'],
      correctIndex: 1,
      explanation: 'Token Bucket allows bursts up to the bucket size. If the bucket has accumulated tokens during a quiet period, a burst of requests can consume them all at once.'
    }
  },
  {
    id: 'consistent-hashing',
    name: 'Consistent Hashing',
    icon: <Hash size={24} />,
    color: 'from-lime-500/30 to-green-500/30 border-lime-400/40',
    description: 'Hash ring technique that minimizes key redistribution when nodes are added or removed.',
    keyConcepts: ['Hash Ring', 'Virtual Nodes', 'Rebalancing', 'Key Distribution'],
    details: `Consistent hashing distributes data across nodes in a way that minimizes redistribution when nodes are added or removed. Used in distributed caches, databases, and CDNs.

The Hash Ring: Imagine a circle (ring) of hash values from 0 to 2^32-1. Both servers and keys are hashed onto this ring. Each key is assigned to the first server found clockwise from its position.

Adding a Node: When a new server is added, only keys between the new server and its predecessor need to move. In a system with N nodes, only ~1/N of keys are redistributed (vs. rehashing everything with modular hashing).

Removing a Node: Keys from the removed node move to the next server clockwise. Again, only ~1/N of keys are affected.

Virtual Nodes: Each physical server is mapped to multiple positions on the ring. This ensures even distribution. Without virtual nodes, uneven spacing can cause hotspots. Typically 100-200 virtual nodes per physical server.

Without consistent hashing: hash(key) % N. Adding one server changes the assignment of nearly all keys — cache miss storm.

Real-world usage: Amazon DynamoDB, Apache Cassandra, Akamai CDN, Discord, Memcached client libraries.

The concept is critical for any distributed system that needs to scale horizontally while minimizing data movement.`,
    diagram: `
         ┌─── Node A
         │
    ─────●─────── Hash Ring
    │    │                │
    ●    │           ●    │
    │    │     Key1──▶    │
    │    │                │
    │    ●──── Node B     │
    │                     │
    ●──── Node C          │
    │                     │
    ──────────────────────`,
    quiz: {
      question: 'What problem do virtual nodes solve in consistent hashing?',
      options: [
        'Reducing hash collisions',
        'Ensuring even data distribution',
        'Speeding up hash computation',
        'Preventing node failures'
      ],
      correctIndex: 1,
      explanation: 'Virtual nodes ensure even data distribution. Without them, physical nodes may be unevenly spaced on the hash ring, causing some nodes to handle much more data than others.'
    }
  },
  {
    id: 'websockets',
    name: 'WebSockets',
    icon: <Wifi size={24} />,
    color: 'from-sky-500/30 to-blue-500/30 border-sky-400/40',
    description: 'Full-duplex, persistent connections enabling real-time bidirectional communication.',
    keyConcepts: ['Full-duplex', 'Handshake', 'Heartbeat', 'Connection Pooling'],
    details: `WebSockets provide full-duplex communication channels over a single TCP connection, enabling real-time bidirectional data flow between client and server.

How it works:
1. Client sends HTTP Upgrade request with "Upgrade: websocket" header.
2. Server responds with 101 Switching Protocols.
3. TCP connection is upgraded — both sides can now send messages freely.

vs HTTP Polling: Client repeatedly asks "any updates?" — wastes bandwidth.
vs Long Polling: Server holds request open until data is available. Better, but still one-directional per request and reconnection overhead.
vs SSE (Server-Sent Events): Server pushes to client only. Simpler than WebSockets but unidirectional.

Heartbeat/Ping-Pong: Periodic ping frames detect dead connections. If no pong received within timeout, connection is closed and client reconnects.

Scaling WebSockets: Each connection is stateful and long-lived. Use sticky sessions on the load balancer. For broadcasting across servers, use a pub/sub system like Redis Pub/Sub or Kafka.

Connection limits: A single server can handle ~65K connections (limited by ports). In practice, memory is the bottleneck (~50-500K connections per server depending on message rate).

Use cases: Chat applications, live dashboards, collaborative editing, gaming, financial tickers, notifications.

Libraries: Socket.IO, ws (Node.js), Django Channels, Spring WebSocket.`,
    diagram: `
    ┌───────┐  1. HTTP Upgrade  ┌───────┐
    │Client │─────────────────▶│Server │
    │       │  2. 101 Switch    │       │
    │       │◀─────────────────│       │
    │       │                   │       │
    │       │◀═══════════════▶│       │
    │       │  3. Bidirectional │       │
    │       │  WebSocket Msgs   │       │
    └───────┘                   └───────┘`,
    quiz: {
      question: 'Why is WebSocket preferred over HTTP long polling for chat applications?',
      options: [
        'WebSockets use less memory',
        'WebSockets are encrypted by default',
        'WebSockets provide true bidirectional communication without reconnection overhead',
        'WebSockets are supported by more browsers'
      ],
      correctIndex: 2,
      explanation: 'WebSockets maintain a persistent connection for true bidirectional communication. Long polling requires establishing a new connection for each message cycle, adding latency and overhead.'
    }
  },
  {
    id: 'blob-storage',
    name: 'Blob Storage',
    icon: <Cloud size={24} />,
    color: 'from-slate-500/30 to-gray-500/30 border-slate-400/40',
    description: 'Object storage for large unstructured data like images, videos, and backups.',
    keyConcepts: ['Object Storage', 'S3', 'CDN Integration', 'Presigned URLs'],
    details: `Blob (Binary Large Object) storage is designed for storing large amounts of unstructured data: images, videos, documents, backups, logs.

Object Storage vs File System: Objects are stored in a flat namespace with metadata (no hierarchy). Access via unique keys. Highly scalable. Not suited for frequently modified files (objects are immutable — overwrite to "edit").

Amazon S3 Model:
- Buckets: Top-level containers (globally unique names).
- Objects: Files stored with a key (path-like string). Max 5TB per object.
- Storage Classes: Standard (frequent access), IA (infrequent), Glacier (archive).
- Durability: 99.999999999% (11 nines) — data replicated across facilities.

Presigned URLs: Generate temporary URLs allowing clients to upload/download directly to/from S3, bypassing your server. Reduces server load and bandwidth.

CDN Integration: Serve objects through CDN for global low-latency access. CloudFront + S3 is the canonical example.

Access Control: Bucket policies, ACLs, IAM roles. Principle of least privilege.

Upload Patterns:
- Small files: Direct upload via API.
- Large files: Multipart upload (split into parts, upload in parallel, combine).

Common alternatives: Google Cloud Storage, Azure Blob Storage, MinIO (self-hosted).

Use in system design: User avatars, video content, static website hosting, data lake storage, log archival.`,
    diagram: `
    ┌───────┐  Presigned URL  ┌──────┐
    │Client │───────────────▶│  S3  │
    │       │  Direct Upload  │Bucket│
    └───┬───┘                 └──┬───┘
        │                        │
        │    ┌─────────┐         │
        └───▶│   CDN   │◀───────┘
             │  (Edge) │ Origin
             └────┬────┘
                  │
              Fast Delivery
              to Users`,
    quiz: {
      question: 'What is the primary benefit of using presigned URLs for file uploads?',
      options: [
        'Faster upload speeds',
        'Better file compression',
        'Clients upload directly to storage, reducing server load',
        'Automatic virus scanning'
      ],
      correctIndex: 2,
      explanation: 'Presigned URLs allow clients to upload directly to object storage (like S3) without the data passing through your application server, significantly reducing server bandwidth and processing load.'
    }
  }
];

// ============================================================================
// DATA - CHALLENGES
// ============================================================================

const CHALLENGES: Challenge[] = [
  {
    id: 'url-shortener',
    name: 'Design a URL Shortener',
    icon: <Target size={20} />,
    description: 'Build a service like bit.ly that converts long URLs into short, shareable links and redirects users.',
    requirements: { users: '100M monthly active users', qps: '1,000 URL creations/sec, 10,000 redirects/sec', dataSize: '500M URLs stored, ~500 bytes each = ~250GB' },
    requiredComponents: ['api-gateway', 'load-balancer', 'caching', 'db-sharding'],
    explanation: 'API Gateway handles rate limiting and auth. Load Balancer distributes traffic across stateless app servers. Cache (Redis) stores hot URLs for fast redirects (80/20 rule — 20% of URLs get 80% of traffic). Database Sharding distributes the URL mappings across shards using the short URL hash as shard key. Base62 encoding converts numeric IDs to short strings. A counter service or pre-generated key table avoids collisions.',
    xpReward: 75
  },
  {
    id: 'twitter-feed',
    name: 'Design Twitter Feed',
    icon: <MessageSquare size={20} />,
    description: 'Design the home timeline feature showing tweets from followed users, sorted by relevance and recency.',
    requirements: { users: '300M monthly active users', qps: '600K read QPS for timeline, 5K write QPS for tweets', dataSize: '~500M tweets/day, 140 chars + metadata = ~1KB each' },
    requiredComponents: ['api-gateway', 'message-queue', 'caching', 'db-sharding', 'cdn'],
    explanation: 'API Gateway handles authentication and rate limiting. Fan-out on write: when a user tweets, a Message Queue distributes the tweet to all followers\' timeline caches. Cache (Redis) stores pre-computed timelines for each user — read is just a cache lookup. Database Sharding stores tweet data sharded by user_id. CDN serves media attachments (images, videos). For celebrity users with millions of followers, use fan-out on read (hybrid approach) to avoid overwhelming the write pipeline.',
    xpReward: 100
  },
  {
    id: 'chat-app',
    name: 'Design a Chat App',
    icon: <Radio size={20} />,
    description: 'Build a real-time messaging system like WhatsApp supporting 1:1 and group chats with delivery receipts.',
    requirements: { users: '500M monthly active users', qps: '50K messages/sec peak', dataSize: '~100B messages/day, ~100 bytes each = ~10TB/day' },
    requiredComponents: ['websockets', 'message-queue', 'db-replication', 'load-balancer'],
    explanation: 'WebSockets provide persistent bidirectional connections for real-time messaging. Load Balancer with sticky sessions routes users to their WebSocket server. Message Queue (Kafka) handles message delivery between servers — when sender and receiver are on different servers. Database with Replication stores message history (write to leader, read from followers). Messages are stored per-conversation. Presence service tracks online/offline status via heartbeats. For group chats, fan-out the message to all group members\' WebSocket connections.',
    xpReward: 80
  },
  {
    id: 'video-platform',
    name: 'Design a Video Platform',
    icon: <Box size={20} />,
    description: 'Build a video streaming service like YouTube supporting upload, transcoding, and adaptive streaming.',
    requirements: { users: '2B monthly active users', qps: '5M video views/hour, 500 uploads/min', dataSize: '~500 hours of video uploaded per minute, petabytes of storage' },
    requiredComponents: ['cdn', 'blob-storage', 'message-queue', 'db-sharding', 'caching'],
    explanation: 'Blob Storage (S3) stores raw and transcoded video files. When a video is uploaded, a Message Queue triggers transcoding workers that create multiple resolutions (240p, 480p, 720p, 1080p, 4K) and formats. CDN distributes transcoded videos globally — most views are served from edge. Database Sharding stores video metadata (title, description, view counts) sharded by video_id. Cache stores popular video metadata and user recommendations. Adaptive bitrate streaming (HLS/DASH) adjusts quality based on viewer bandwidth.',
    xpReward: 90
  },
  {
    id: 'ecommerce',
    name: 'Design an E-commerce System',
    icon: <BarChart3 size={20} />,
    description: 'Build an online marketplace like Amazon handling product catalog, orders, payments, and inventory.',
    requirements: { users: '150M monthly active users', qps: '100K product views/sec, 10K orders/sec during peak', dataSize: '~100M products, order history growing 1TB/month' },
    requiredComponents: ['api-gateway', 'db-sharding', 'caching', 'message-queue', 'cdn'],
    explanation: 'API Gateway routes requests to microservices (product, order, payment, inventory) and handles auth. Database Sharding: product catalog sharded by category/product_id, orders by user_id. Cache stores product details, pricing, and session data — product pages are read-heavy. Message Queue orchestrates the order flow: order placed -> inventory reserved -> payment processed -> confirmation sent (saga pattern). CDN serves product images and static assets. Search is powered by Elasticsearch for full-text product search with faceted filtering.',
    xpReward: 100
  }
];

const CTO_PRINCIPLES: CtoPrinciple[] = [
  {
    id: 'graceful-degradation',
    label: 'Graceful Degradation',
    description: 'Define which parts can fail while core flow remains available.',
  },
  {
    id: 'idempotency',
    label: 'Idempotency',
    description: 'Ensure retries do not produce duplicate side effects.',
  },
  {
    id: 'observability-first',
    label: 'Observability First',
    description: 'Metrics, logs, traces, and SLO alerts are part of the design.',
  },
  {
    id: 'cost-guardrails',
    label: 'Cost Guardrails',
    description: 'Protect against runaway costs with limits, tiers, and lifecycle rules.',
  },
  {
    id: 'consistency-boundaries',
    label: 'Consistency Boundaries',
    description: 'Explicitly choose strong vs eventual consistency per workflow.',
  },
  {
    id: 'blast-radius',
    label: 'Blast Radius Isolation',
    description: 'Contain failures to tenant, region, queue, or service slice.',
  },
  {
    id: 'async-by-default',
    label: 'Async By Default',
    description: 'Use queues/events for spike handling and decoupled workflows.',
  },
  {
    id: 'security-baseline',
    label: 'Security Baseline',
    description: 'Threat model, authz boundaries, and secrets management from day one.',
  },
];

const CTO_MISSIONS: CtoMission[] = [
  {
    id: 'warfront-live-classes',
    tier: 'Bronze',
    name: 'Live Class Warfront',
    bossName: 'The Latency Wyrm',
    scenario: 'Build a live coding classroom with 50k concurrent learners, real-time chat, code sync, and replay.',
    nonFunctional: { qps: '15k msg/s', p95: '< 250ms', availability: '99.9%', budget: '$25k/month' },
    requiredComponents: ['api-gateway', 'websockets', 'message-queue', 'caching', 'blob-storage'],
    recommendedPrinciples: ['observability-first', 'graceful-degradation', 'async-by-default'],
    xpReward: 120,
  },
  {
    id: 'trial-by-checkout',
    tier: 'Silver',
    name: 'Checkout Trial',
    bossName: 'The Consistency Hydra',
    scenario: 'Design checkout for global marketplace: inventory, payments, fraud checks, and order confirmation.',
    nonFunctional: { qps: '12k orders/s peak', p95: '< 400ms for place-order', availability: '99.95%', budget: '$80k/month' },
    requiredComponents: ['api-gateway', 'message-queue', 'db-sharding', 'db-replication', 'caching', 'rate-limiting'],
    recommendedPrinciples: ['idempotency', 'consistency-boundaries', 'blast-radius', 'security-baseline'],
    xpReward: 160,
  },
  {
    id: 'global-feed-siege',
    tier: 'Gold',
    name: 'Global Feed Siege',
    bossName: 'Queen Fanout',
    scenario: 'Ship social feed for 120M DAU with personalized timelines and media-heavy posts.',
    nonFunctional: { qps: '900k read/s', p95: '< 180ms timeline read', availability: '99.95%', budget: '$140k/month' },
    requiredComponents: ['cdn', 'caching', 'message-queue', 'db-sharding', 'api-gateway', 'blob-storage', 'consistent-hashing'],
    recommendedPrinciples: ['cost-guardrails', 'async-by-default', 'graceful-degradation', 'observability-first'],
    xpReward: 210,
  },
  {
    id: 'mythic-control-plane',
    tier: 'Mythic',
    name: 'Control Plane Ascension',
    bossName: 'Architect Prime',
    scenario: 'Design multi-region control plane for developer platform with strict tenant isolation and 24/7 uptime.',
    nonFunctional: { qps: '80k control ops/s', p95: '< 150ms API', availability: '99.99%', budget: '$220k/month' },
    requiredComponents: ['api-gateway', 'microservices', 'message-queue', 'db-replication', 'rate-limiting', 'consistent-hashing', 'load-balancer'],
    recommendedPrinciples: ['blast-radius', 'security-baseline', 'observability-first', 'idempotency', 'consistency-boundaries'],
    xpReward: 260,
  },
];

// ============================================================================
// DATA - CONCEPTS
// ============================================================================

const CONCEPTS: Concept[] = [
  {
    id: 'scalability',
    name: 'Scalability',
    icon: <Layers size={20} />,
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-400/30',
    points: [
      { title: 'Vertical Scaling (Scale Up)', detail: 'Add more CPU, RAM, or storage to a single machine. Simpler but has a hardware ceiling. Good for databases that are hard to distribute.' },
      { title: 'Horizontal Scaling (Scale Out)', detail: 'Add more machines to handle load. Requires stateless application design. Practically unlimited scaling potential. Standard for web servers.' },
      { title: 'Stateless Design', detail: 'No session data stored on the server. State goes in shared storage (Redis, DB). Any server can handle any request — enables easy horizontal scaling and load balancing.' },
      { title: 'Database Scaling Path', detail: '1. Optimize queries and indexes. 2. Add read replicas. 3. Implement caching. 4. Vertical scaling. 5. Sharding. Each step adds complexity — exhaust simpler options first.' },
      { title: 'Auto-scaling', detail: 'Automatically add/remove instances based on metrics (CPU, memory, request count). Scale-out on high load, scale-in on low load. Cloud providers offer this natively (AWS ASG, K8s HPA).' },
      { title: 'Scaling Bottlenecks', detail: 'Common bottlenecks: database (most frequent), network bandwidth, single points of failure, stateful services, shared resources with locks.' }
    ]
  },
  {
    id: 'cap-theorem',
    name: 'CAP Theorem',
    icon: <AlertTriangle size={20} />,
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-400/30',
    points: [
      { title: 'Consistency (C)', detail: 'Every read receives the most recent write or an error. All nodes see the same data at the same time. Like a single-server database.' },
      { title: 'Availability (A)', detail: 'Every request receives a (non-error) response, without the guarantee that it contains the most recent write. The system always responds.' },
      { title: 'Partition Tolerance (P)', detail: 'The system continues to operate despite network partitions between nodes. In distributed systems, partitions WILL happen, so P is always required.' },
      { title: 'CP Systems', detail: 'Choose Consistency over Availability during partitions. Examples: MongoDB (default), HBase, Redis Cluster. When a partition occurs, unavailable nodes stop serving requests to prevent stale reads.' },
      { title: 'AP Systems', detail: 'Choose Availability over Consistency during partitions. Examples: Cassandra, DynamoDB, CouchDB. During partitions, all nodes respond but may return stale data. Use conflict resolution on merge.' },
      { title: 'PACELC Extension', detail: 'If Partition: choose A or C. Else (normal operation): choose Latency or Consistency. DynamoDB is PA/EL — available during partition, low latency normally. PostgreSQL sync replication is PC/EC — consistent always.' }
    ]
  },
  {
    id: 'acid-base',
    name: 'ACID vs BASE',
    icon: <Database size={20} />,
    color: 'from-purple-500/20 to-violet-500/20 border-purple-400/30',
    points: [
      { title: 'ACID: Atomicity', detail: 'Transaction is all-or-nothing. If any part fails, the entire transaction is rolled back. No partial updates. Critical for financial transactions.' },
      { title: 'ACID: Consistency', detail: 'Transaction moves database from one valid state to another. All constraints, triggers, and cascades are satisfied. Data integrity is maintained.' },
      { title: 'ACID: Isolation', detail: 'Concurrent transactions don\'t interfere. Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable. Higher isolation = lower throughput.' },
      { title: 'ACID: Durability', detail: 'Once committed, data survives crashes. Achieved via write-ahead logging (WAL) — changes written to log before applied. On crash, replay the log.' },
      { title: 'BASE: Basically Available', detail: 'System guarantees availability (per CAP). May return stale data but will always respond. Prioritizes uptime over perfect consistency.' },
      { title: 'BASE: Eventually Consistent', detail: 'Given enough time without new updates, all replicas will converge to the same value. The "eventually" can be milliseconds to seconds. Acceptable for social media feeds, product catalogs, analytics.' }
    ]
  },
  {
    id: 'latency',
    name: 'Latency Numbers',
    icon: <Clock size={20} />,
    color: 'from-green-500/20 to-emerald-500/20 border-green-400/30',
    points: [
      { title: 'L1 Cache Reference', detail: '~0.5 nanoseconds. On-CPU cache, fastest memory access possible. ~200x faster than main memory.' },
      { title: 'L2 Cache Reference', detail: '~7 nanoseconds. Still on-CPU but larger and slower than L1. ~30x faster than main memory.' },
      { title: 'Main Memory (RAM)', detail: '~100 nanoseconds. Random access to DRAM. This is your baseline for in-memory operations.' },
      { title: 'SSD Random Read', detail: '~150 microseconds (150,000 ns). ~1,500x slower than RAM. SSDs are great for random access patterns.' },
      { title: 'HDD Disk Seek', detail: '~10 milliseconds (10,000,000 ns). ~100,000x slower than RAM. Mechanical seeks are very slow — sequential reads are much better.' },
      { title: 'Network Round Trip', detail: 'Same datacenter: ~0.5ms. Cross-continent: ~150ms. These dominate system design — minimize network calls. Batch requests. Use caching.' }
    ]
  },
  {
    id: 'estimation',
    name: 'Back of Envelope',
    icon: <Brain size={20} />,
    color: 'from-red-500/20 to-rose-500/20 border-red-400/30',
    points: [
      { title: 'QPS Estimation', detail: 'DAU * avg_requests_per_user / 86,400. Example: 10M DAU * 10 requests = 100M/day = ~1,157 QPS. Peak is typically 2-3x average.' },
      { title: 'Storage Estimation', detail: 'Records per day * size per record * retention period. Example: 1M photos/day * 2MB * 365 days * 5 years = ~3.65 PB total.' },
      { title: 'Bandwidth Estimation', detail: 'QPS * average response size. Example: 1000 QPS * 500KB = 500MB/s = 4 Gbps outbound. Consider peak multipliers.' },
      { title: 'Power of 2 Quick Reference', detail: '2^10 = 1K, 2^20 = 1M, 2^30 = 1G, 2^40 = 1T. 1 char = 1 byte (ASCII) or 2-4 bytes (UTF-8). A UUID = 16 bytes. A timestamp = 8 bytes.' },
      { title: 'Server Capacity', detail: 'A modern server: 256GB RAM, 64 cores, 10 Gbps network. Can handle ~10K-50K concurrent connections. A Redis instance: ~100K ops/sec. A PostgreSQL instance: ~10K simple queries/sec.' },
      { title: 'The 80/20 Rule', detail: '80% of traffic hits 20% of data. Cache the hot 20% in memory. If you have 100GB of data, caching 20GB covers 80% of reads. This guides cache sizing.' }
    ]
  },
  {
    id: 'data-modeling',
    name: 'Data Modeling',
    icon: <Server size={20} />,
    color: 'from-teal-500/20 to-cyan-500/20 border-teal-400/30',
    points: [
      { title: 'SQL (Relational)', detail: 'Structured data with relationships. ACID transactions. Strong consistency. Good for: financial data, user accounts, inventory. Examples: PostgreSQL, MySQL, SQL Server.' },
      { title: 'NoSQL: Document Store', detail: 'Flexible JSON-like documents. No fixed schema. Good for: product catalogs, content management, user profiles. Examples: MongoDB, CouchDB, Firestore.' },
      { title: 'NoSQL: Key-Value Store', detail: 'Simple key-value pairs. Fastest reads. Good for: caching, sessions, feature flags. Examples: Redis, DynamoDB, Memcached.' },
      { title: 'NoSQL: Wide-Column Store', detail: 'Data stored in columns, not rows. Excellent for time-series and analytics. Good for: IoT data, event logging, analytics. Examples: Cassandra, HBase, Bigtable.' },
      { title: 'NoSQL: Graph Database', detail: 'Nodes and edges represent relationships. Traversal queries are fast. Good for: social networks, recommendation engines, fraud detection. Examples: Neo4j, Neptune, JanusGraph.' },
      { title: 'When to Choose What', detail: 'Need transactions? SQL. Need flexibility? Document. Need speed? Key-Value. Need relationships? Graph. Need time-series? Wide-Column. Many systems use multiple databases (polyglot persistence).' }
    ]
  }
];

// ============================================================================
// DATA - QUIZ
// ============================================================================

const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: 1, question: 'What is the primary purpose of database indexing?', options: ['Reduce storage space', 'Speed up data retrieval queries', 'Ensure data consistency', 'Enable data replication'], correctIndex: 1, explanation: 'Indexes create data structures (typically B-trees) that allow the database to find rows without scanning the entire table, dramatically speeding up SELECT queries at the cost of slower writes and extra storage.', topic: 'Databases' },
  { id: 2, question: 'Which consistency model does DynamoDB use by default?', options: ['Strong consistency', 'Eventual consistency', 'Causal consistency', 'Linearizability'], correctIndex: 1, explanation: 'DynamoDB defaults to eventual consistency for reads, which offers lower latency and higher throughput. You can opt into strongly consistent reads per-request at higher cost and latency.', topic: 'Databases' },
  { id: 3, question: 'In a microservices architecture, what pattern handles distributed transactions?', options: ['Circuit Breaker', 'Saga Pattern', 'Service Mesh', 'API Gateway'], correctIndex: 1, explanation: 'The Saga pattern manages distributed transactions by breaking them into a sequence of local transactions. Each service performs its transaction and publishes an event. Failures trigger compensating transactions.', topic: 'Microservices' },
  { id: 4, question: 'What is the main advantage of using a CDN?', options: ['Reduces server costs', 'Provides data encryption', 'Reduces latency by serving content from nearby edge locations', 'Increases database throughput'], correctIndex: 2, explanation: 'CDNs cache content at edge locations around the world, so users receive content from a server geographically close to them, reducing latency from hundreds of milliseconds to single digits.', topic: 'CDN' },
  { id: 5, question: 'What HTTP status code indicates rate limiting?', options: ['403 Forbidden', '429 Too Many Requests', '503 Service Unavailable', '408 Request Timeout'], correctIndex: 1, explanation: 'HTTP 429 Too Many Requests is the standard response when a client has sent too many requests in a given time period. It should include Retry-After header indicating when the client can retry.', topic: 'Rate Limiting' },
  { id: 6, question: 'Which algorithm does Kafka use to assign partitions to consumers in a consumer group?', options: ['Round Robin only', 'Range assignment by default', 'Consistent Hashing', 'Random assignment'], correctIndex: 1, explanation: 'Kafka uses Range assignment by default, which assigns contiguous partitions to consumers based on sorted order. Round Robin is available as an alternative. Sticky assignment minimizes rebalancing.', topic: 'Message Queues' },
  { id: 7, question: 'What is the purpose of a write-ahead log (WAL)?', options: ['Speed up read queries', 'Ensure durability by recording changes before applying them', 'Compress data for storage', 'Balance load across replicas'], correctIndex: 1, explanation: 'WAL records all changes to a log file before they are applied to the actual data pages. On crash, the database replays the log to recover committed transactions, ensuring durability.', topic: 'Databases' },
  { id: 8, question: 'How does a circuit breaker pattern transition from Open to Closed state?', options: ['Immediately on next request', 'Through a Half-Open state that tests with limited requests', 'After a fixed timeout period with no testing', 'When an admin manually resets it'], correctIndex: 1, explanation: 'After the timeout period in Open state, the circuit breaker moves to Half-Open, allowing a limited number of test requests through. If they succeed, the circuit closes. If they fail, it re-opens.', topic: 'Microservices' },
  { id: 9, question: 'What is fan-out on write in the context of a social media feed?', options: ['Writing data to multiple databases simultaneously', 'Pre-computing and storing a user\'s feed when a followed user posts', 'Distributing writes across shards', 'Broadcasting notifications to all users'], correctIndex: 1, explanation: 'Fan-out on write means when a user posts, the post is immediately pushed to the feed cache of all followers. This makes reads fast (just read the cache) but writes expensive for users with many followers.', topic: 'System Design' },
  { id: 10, question: 'What is the difference between horizontal and vertical partitioning?', options: ['Horizontal splits tables, vertical splits columns', 'Horizontal splits rows, vertical splits columns', 'They are the same thing', 'Horizontal is for SQL, vertical is for NoSQL'], correctIndex: 1, explanation: 'Horizontal partitioning (sharding) splits rows across databases — each shard has all columns but a subset of rows. Vertical partitioning splits columns — one table has user_id and name, another has user_id and profile_data.', topic: 'Databases' },
  { id: 11, question: 'What problem does consistent hashing solve?', options: ['Data encryption', 'Minimizing key redistribution when nodes change', 'Faster hash computation', 'Preventing hash collisions'], correctIndex: 1, explanation: 'With naive hash(key) % N, adding a node changes N, causing nearly all keys to remap. Consistent hashing uses a hash ring where adding/removing a node only affects ~1/N of the keys.', topic: 'Distributed Systems' },
  { id: 12, question: 'What is the primary trade-off of using synchronous database replication?', options: ['Higher storage cost', 'Increased write latency for stronger consistency', 'Reduced read throughput', 'More complex queries'], correctIndex: 1, explanation: 'Synchronous replication waits for the follower to confirm the write before acknowledging to the client. This guarantees the follower has the data (strong consistency) but adds network round-trip latency to every write.', topic: 'Databases' },
  { id: 13, question: 'When would you choose a message queue over direct HTTP calls between services?', options: ['When you need synchronous responses', 'When you need to decouple services and handle spikes asynchronously', 'When you need lower latency', 'When you need real-time communication'], correctIndex: 1, explanation: 'Message queues decouple producers from consumers. The producer doesn\'t wait for processing to complete. Queues buffer spikes in traffic, enable retry on failure, and allow independent scaling of producers and consumers.', topic: 'Architecture' },
  { id: 14, question: 'What is the thundering herd problem in caching?', options: ['Cache using too much memory', 'Many requests hitting the database when a popular cache key expires', 'Cache servers crashing under load', 'Data inconsistency between cache and database'], correctIndex: 1, explanation: 'When a popular cache key expires, thousands of concurrent requests see the cache miss and all hit the database simultaneously. Solutions: mutex/lock on cache miss, probabilistic early expiration, or cache warming.', topic: 'Caching' },
  { id: 15, question: 'What is the difference between REST and gRPC?', options: ['REST is faster than gRPC', 'gRPC uses Protocol Buffers and HTTP/2 for efficient binary serialization', 'REST supports streaming but gRPC does not', 'They use the same protocol'], correctIndex: 1, explanation: 'gRPC uses Protocol Buffers (binary format) over HTTP/2 for efficient serialization, bidirectional streaming, and strong typing. REST uses JSON over HTTP/1.1. gRPC is 2-10x faster but less human-readable.', topic: 'APIs' },
  { id: 16, question: 'What is the purpose of a bloom filter?', options: ['Sorting data efficiently', 'Testing set membership with possible false positives but no false negatives', 'Encrypting data at rest', 'Compressing network traffic'], correctIndex: 1, explanation: 'A bloom filter is a space-efficient probabilistic data structure. It can tell you "definitely not in set" or "probably in set." Used in databases to skip disk reads for non-existent keys, reducing unnecessary I/O.', topic: 'Data Structures' },
  { id: 17, question: 'How does a token bucket rate limiter handle burst traffic?', options: ['It rejects all burst traffic', 'It allows bursts up to the bucket size, then throttles', 'It queues burst requests', 'It doubles the rate limit temporarily'], correctIndex: 1, explanation: 'The token bucket accumulates tokens at a fixed rate up to a maximum (bucket size). Burst traffic can consume accumulated tokens instantly. Once the bucket is empty, requests are throttled to the refill rate.', topic: 'Rate Limiting' },
  { id: 18, question: 'What is the CAP theorem implication for a single-datacenter database?', options: ['CAP doesn\'t apply to single datacenters', 'It can provide both C and A since network partitions are rare', 'It must choose between C and A', 'It can only provide P'], correctIndex: 1, explanation: 'Within a single datacenter, network partitions are rare (but possible). In practice, a single-datacenter database can offer both strong consistency and high availability. CAP trade-offs become critical across datacenters.', topic: 'Distributed Systems' },
  { id: 19, question: 'What is the difference between a reverse proxy and a load balancer?', options: ['They are the same thing', 'A reverse proxy serves one server, a load balancer serves many', 'A reverse proxy can do everything a load balancer does, plus caching, SSL, and compression', 'A load balancer operates at L7, a reverse proxy at L4'], correctIndex: 2, explanation: 'A reverse proxy sits in front of servers and can provide caching, SSL termination, compression, and security. A load balancer distributes traffic. In practice, reverse proxies (like Nginx) can also load balance, so they overlap.', topic: 'Networking' },
  { id: 20, question: 'What strategy would you use to generate unique IDs in a distributed system?', options: ['Auto-increment in each database', 'UUID v4 (random)', 'Twitter Snowflake (timestamp + worker ID + sequence)', 'All of the above are valid, with different trade-offs'], correctIndex: 3, explanation: 'Auto-increment works with a single sequence service (SPOF risk). UUID v4 is simple but not sortable and 128 bits. Snowflake IDs are 64-bit, sortable, and encode timestamp + worker + sequence. Each has valid use cases.' , topic: 'Distributed Systems' }
];

// ============================================================================
// TABS CONFIG
// ============================================================================

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'patterns', label: 'Patterns', icon: <Layers size={18} /> },
  { id: 'challenges', label: 'Challenges', icon: <Target size={18} /> },
  { id: 'concepts', label: 'Concepts', icon: <BookOpen size={18} /> },
  { id: 'quiz', label: 'Quiz', icon: <HelpCircle size={18} /> },
  { id: 'cto-raid', label: 'CTO Raid', icon: <Trophy size={18} /> }
];

// ============================================================================
// COMPONENT
// ============================================================================

const SystemDesign: React.FC<SystemDesignProps> = ({ user, onBack, onGainXp }) => {
  const [activeTab, setActiveTab] = useState<TabId>('patterns');
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);
  const [patternQuizAnswers, setPatternQuizAnswers] = useState<Record<string, number | null>>({});
  const [patternQuizSubmitted, setPatternQuizSubmitted] = useState<Record<string, boolean>>({});

  // Challenge state
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [challengeSelections, setChallengeSelections] = useState<Record<string, string[]>>({});
  const [challengeResults, setChallengeResults] = useState<Record<string, { score: number; checked: boolean }>>({});

  // Concept state
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);

  // Quiz state
  const [quizPage, setQuizPage] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});
  const [quizXpAwarded, setQuizXpAwarded] = useState<Set<number>>(new Set());

  const [completedPatterns, setCompletedPatterns] = useState<Set<string>>(new Set());
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  const [activeCtoMissionId, setActiveCtoMissionId] = useState<string | null>(null);
  const [ctoComponentSelections, setCtoComponentSelections] = useState<Record<string, string[]>>({});
  const [ctoPrincipleSelections, setCtoPrincipleSelections] = useState<Record<string, string[]>>({});
  const [ctoResults, setCtoResults] = useState<Record<string, { checked: boolean; score: number; componentAccuracy: number; principleAccuracy: number; xpEarned: number }>>({});
  const [completedCtoMissions, setCompletedCtoMissions] = useState<Set<string>>(new Set());

  // Pattern quiz handlers
  const handlePatternQuizSelect = (patternId: string, optionIndex: number) => {
    if (patternQuizSubmitted[patternId]) return;
    setPatternQuizAnswers(prev => ({ ...prev, [patternId]: optionIndex }));
  };

  const handlePatternQuizSubmit = (patternId: string, correctIndex: number) => {
    setPatternQuizSubmitted(prev => ({ ...prev, [patternId]: true }));
    if (patternQuizAnswers[patternId] === correctIndex) {
      setCompletedPatterns(prev => new Set(prev).add(patternId));
      onGainXp?.(25);
    }
  };

  // Challenge handlers
  const toggleChallengeComponent = (challengeId: string, componentId: string) => {
    setChallengeSelections(prev => {
      const current = prev[challengeId] || [];
      const updated = current.includes(componentId)
        ? current.filter(c => c !== componentId)
        : [...current, componentId];
      return { ...prev, [challengeId]: updated };
    });
  };

  const checkChallenge = (challenge: Challenge) => {
    const selected = challengeSelections[challenge.id] || [];
    const required = challenge.requiredComponents;
    const correctSelections = selected.filter(s => required.includes(s)).length;
    const incorrectSelections = selected.filter(s => !required.includes(s)).length;
    const missedSelections = required.filter(r => !selected.includes(r)).length;
    const totalRequired = required.length;
    const rawScore = Math.max(0, correctSelections - incorrectSelections * 0.5);
    const score = Math.round((rawScore / totalRequired) * 100);
    const xpEarned = Math.round((score / 100) * challenge.xpReward);

    setChallengeResults(prev => ({ ...prev, [challenge.id]: { score, checked: true } }));
    if (score >= 60) {
      setCompletedChallenges(prev => new Set(prev).add(challenge.id));
    }
    if (xpEarned > 0) {
      onGainXp?.(xpEarned);
    }
  };

  const toggleCtoComponent = (missionId: string, componentId: string) => {
    if (ctoResults[missionId]?.checked) return;
    setCtoComponentSelections((prev) => {
      const current = prev[missionId] || [];
      const updated = current.includes(componentId)
        ? current.filter((c) => c !== componentId)
        : [...current, componentId];
      return { ...prev, [missionId]: updated };
    });
  };

  const toggleCtoPrinciple = (missionId: string, principleId: string) => {
    if (ctoResults[missionId]?.checked) return;
    setCtoPrincipleSelections((prev) => {
      const current = prev[missionId] || [];
      const updated = current.includes(principleId)
        ? current.filter((p) => p !== principleId)
        : [...current, principleId];
      return { ...prev, [missionId]: updated };
    });
  };

  const checkCtoMission = (mission: CtoMission) => {
    if (ctoResults[mission.id]?.checked) return;

    const selectedComponents = ctoComponentSelections[mission.id] || [];
    const selectedPrinciples = ctoPrincipleSelections[mission.id] || [];

    const requiredHits = selectedComponents.filter((c) => mission.requiredComponents.includes(c)).length;
    const requiredMissed = mission.requiredComponents.filter((c) => !selectedComponents.includes(c)).length;
    const wrongComponents = selectedComponents.filter((c) => !mission.requiredComponents.includes(c)).length;

    const principleHits = selectedPrinciples.filter((p) => mission.recommendedPrinciples.includes(p)).length;
    const principleMissed = mission.recommendedPrinciples.filter((p) => !selectedPrinciples.includes(p)).length;
    const wrongPrinciples = selectedPrinciples.filter((p) => !mission.recommendedPrinciples.includes(p)).length;

    const componentBase = mission.requiredComponents.length > 0
      ? (requiredHits / mission.requiredComponents.length) * 100
      : 100;
    const principleBase = mission.recommendedPrinciples.length > 0
      ? (principleHits / mission.recommendedPrinciples.length) * 100
      : 100;

    const componentAccuracy = Math.max(0, Math.min(100, componentBase - wrongComponents * 12 - requiredMissed * 6));
    const principleAccuracy = Math.max(0, Math.min(100, principleBase - wrongPrinciples * 8 - principleMissed * 4));
    const score = Math.round(componentAccuracy * 0.7 + principleAccuracy * 0.3);
    const xpEarned = Math.round((score / 100) * mission.xpReward);

    setCtoResults((prev) => ({
      ...prev,
      [mission.id]: {
        checked: true,
        score,
        componentAccuracy,
        principleAccuracy,
        xpEarned,
      },
    }));

    if (score >= 70) {
      setCompletedCtoMissions((prev) => new Set(prev).add(mission.id));
    }
    if (xpEarned > 0) {
      onGainXp?.(xpEarned);
    }
  };

  const resetCtoMission = (missionId: string) => {
    setCtoResults((prev) => {
      const next = { ...prev };
      delete next[missionId];
      return next;
    });
  };

  // Quiz handlers
  const handleQuizSelect = (questionId: number, optionIndex: number) => {
    if (quizSubmitted[questionId]) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleQuizSubmit = (question: QuizQuestion) => {
    setQuizSubmitted(prev => ({ ...prev, [question.id]: true }));
    if (quizAnswers[question.id] === question.correctIndex && !quizXpAwarded.has(question.id)) {
      setQuizXpAwarded(prev => new Set(prev).add(question.id));
      onGainXp?.(15);
    }
  };

  const quizQuestionsPerPage = 5;
  const totalQuizPages = Math.ceil(QUIZ_QUESTIONS.length / quizQuestionsPerPage);
  const currentQuizQuestions = QUIZ_QUESTIONS.slice(
    quizPage * quizQuestionsPerPage,
    (quizPage + 1) * quizQuestionsPerPage
  );
  const answeredQuizCount = Object.keys(quizSubmitted).filter(k => quizSubmitted[Number(k)]).length;
  const correctQuizCount = Object.keys(quizSubmitted).filter(
    k => quizSubmitted[Number(k)] && quizAnswers[Number(k)] === QUIZ_QUESTIONS.find(q => q.id === Number(k))?.correctIndex
  ).length;
  const ctoRank = useMemo(() => {
    if (completedCtoMissions.size >= 4) return 'Mythic Architect';
    if (completedCtoMissions.size >= 3) return 'Principal Architect';
    if (completedCtoMissions.size >= 2) return 'Staff Architect';
    if (completedCtoMissions.size >= 1) return 'Senior Architect';
    return 'Apprentice Architect';
  }, [completedCtoMissions.size]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderPatterns = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="text-sm text-gold-300/70">
          Completed: {completedPatterns.size}/{PATTERNS.length} patterns
        </div>
        <div className="flex-1 h-2 bg-obsidian-900/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold-500 to-amber-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completedPatterns.size / PATTERNS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PATTERNS.map((pattern) => {
          const isExpanded = expandedPattern === pattern.id;
          const isCompleted = completedPatterns.has(pattern.id);
          return (
            <motion.div
              key={pattern.id}
              layout
              className={`col-span-1 ${isExpanded ? 'md:col-span-2 lg:col-span-3' : ''}`}
            >
              <motion.div
                className={`relative rounded-xl border bg-gradient-to-br ${pattern.color} backdrop-blur-sm cursor-pointer overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-gold-400/50' : 'hover:scale-[1.02] hover:shadow-lg hover:shadow-gold-500/10'}`}
                onClick={() => setExpandedPattern(isExpanded ? null : pattern.id)}
                layout
              >
                {isCompleted && (
                  <div className="absolute top-2 right-2 z-10">
                    <CheckCircle2 size={20} className="text-green-400" />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-gold-400">{pattern.icon}</div>
                    <h3 className="font-fantasy text-lg text-white">{pattern.name}</h3>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{pattern.description}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {pattern.keyConcepts.map((concept, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-obsidian-800/60 text-gold-300 border border-gold-500/20">
                        {concept}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gold-400/60 mt-2">
                    <ChevronRight size={14} className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    {isExpanded ? 'Click to collapse' : 'Click to learn more'}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="border-t border-gold-600/15 p-5">
                        <h4 className="font-fantasy text-gold-300 mb-3 text-base">Deep Dive</h4>
                        <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed mb-4">
                          {pattern.details}
                        </div>

                        <div className="bg-obsidian-900/60 rounded-lg p-4 mb-4 border border-gold-600/15">
                          <h5 className="font-fantasy text-xs text-gold-400 mb-2 uppercase tracking-widest">Architecture Diagram</h5>
                          <pre className="font-mono text-xs text-gold-400/80 whitespace-pre overflow-x-auto">
                            {pattern.diagram}
                          </pre>
                        </div>

                        <div className="bg-slate-900/40 rounded-lg p-4 border border-amber-500/20">
                          <h5 className="font-fantasy text-amber-400 mb-3 flex items-center gap-2">
                            <HelpCircle size={16} /> Knowledge Check
                          </h5>
                          <p className="text-sm text-white mb-3">{pattern.quiz.question}</p>
                          <div className="space-y-2 mb-3">
                            {pattern.quiz.options.map((option, i) => {
                              const selected = patternQuizAnswers[pattern.id] === i;
                              const submitted = patternQuizSubmitted[pattern.id];
                              const isCorrect = i === pattern.quiz.correctIndex;
                              let optionClasses = 'p-3 rounded-lg border text-sm cursor-pointer transition-all ';
                              if (submitted && isCorrect) {
                                optionClasses += 'bg-green-500/20 border-green-400/50 text-green-300';
                              } else if (submitted && selected && !isCorrect) {
                                optionClasses += 'bg-red-500/20 border-red-400/50 text-red-300';
                              } else if (selected) {
                                optionClasses += 'bg-gold-500/20 border-gold-400/50 text-gold-300';
                              } else {
                                optionClasses += 'bg-obsidian-800/40 border-gold-600/20 text-slate-300 hover:border-gold-500/40';
                              }
                              return (
                                <div
                                  key={i}
                                  className={optionClasses}
                                  onClick={() => handlePatternQuizSelect(pattern.id, i)}
                                >
                                  <span className="font-mono text-xs mr-2 text-slate-500">{String.fromCharCode(65 + i)}.</span>
                                  {option}
                                </div>
                              );
                            })}
                          </div>
                          {!patternQuizSubmitted[pattern.id] ? (
                            <button
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                patternQuizAnswers[pattern.id] != null
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-400 hover:to-yellow-400'
                                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                              }`}
                              disabled={patternQuizAnswers[pattern.id] == null}
                              onClick={() => handlePatternQuizSubmit(pattern.id, pattern.quiz.correctIndex)}
                            >
                              Check Answer
                            </button>
                          ) : (
                            <div className={`p-3 rounded-lg text-sm ${
                              patternQuizAnswers[pattern.id] === pattern.quiz.correctIndex
                                ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                                : 'bg-red-500/10 border border-red-500/30 text-red-300'
                            }`}>
                              {patternQuizAnswers[pattern.id] === pattern.quiz.correctIndex
                                ? <span className="flex items-center gap-2"><Award size={16} /> Correct! +25 XP</span>
                                : <span className="flex items-center gap-2"><XCircle size={16} /> Incorrect</span>
                              }
                              <p className="mt-2 text-slate-300">{pattern.quiz.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  const renderChallenges = () => {
    const activeChallenge = CHALLENGES.find(c => c.id === activeChallengeId);
    const result = activeChallengeId ? challengeResults[activeChallengeId] : null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="text-sm text-gold-300/70">
            Completed: {completedChallenges.size}/{CHALLENGES.length} challenges
          </div>
          <div className="flex-1 h-2 bg-obsidian-900/60 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedChallenges.size / CHALLENGES.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!activeChallenge ? (
            <motion.div
              key="challenge-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {CHALLENGES.map((challenge) => {
                const isCompleted = completedChallenges.has(challenge.id);
                return (
                  <motion.div
                    key={challenge.id}
                    className={`rounded-xl border backdrop-blur-sm p-5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-gold-500/10 ${
                      isCompleted
                        ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30'
                        : 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-400/30'
                    }`}
                    whileHover={{ y: -2 }}
                    onClick={() => setActiveChallengeId(challenge.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`${isCompleted ? 'text-green-400' : 'text-purple-400'}`}>
                        {isCompleted ? <CheckCircle2 size={20} /> : challenge.icon}
                      </div>
                      <h3 className="font-fantasy text-lg text-white">{challenge.name}</h3>
                      <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                        isCompleted
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {isCompleted ? 'Completed' : `${challenge.xpReward} XP`}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">{challenge.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-obsidian-800/40 rounded p-2">
                        <span className="text-slate-500 block">Users</span>
                        <span className="text-gold-300">{challenge.requirements.users}</span>
                      </div>
                      <div className="bg-obsidian-800/40 rounded p-2">
                        <span className="text-slate-500 block">QPS</span>
                        <span className="text-gold-300">{challenge.requirements.qps}</span>
                      </div>
                      <div className="bg-obsidian-800/40 rounded p-2">
                        <span className="text-slate-500 block">Data</span>
                        <span className="text-gold-300">{challenge.requirements.dataSize}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="challenge-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                className="mb-4 flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors font-fantasy"
                onClick={() => setActiveChallengeId(null)}
              >
                <ArrowLeft size={16} /> Back to Challenges
              </button>

              <div className="rounded-xl border border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-sm p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-purple-400">{activeChallenge.icon}</div>
                  <h2 className="font-fantasy text-2xl text-white">{activeChallenge.name}</h2>
                </div>
                <p className="text-slate-300 mb-4">{activeChallenge.description}</p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-obsidian-900/50 rounded-lg p-3 border border-gold-600/15">
                    <div className="text-xs text-slate-500 mb-1">Expected Users</div>
                    <div className="text-sm text-gold-300 font-semibold">{activeChallenge.requirements.users}</div>
                  </div>
                  <div className="bg-obsidian-900/50 rounded-lg p-3 border border-gold-600/15">
                    <div className="text-xs text-slate-500 mb-1">QPS Target</div>
                    <div className="text-sm text-gold-300 font-semibold">{activeChallenge.requirements.qps}</div>
                  </div>
                  <div className="bg-obsidian-900/50 rounded-lg p-3 border border-gold-600/15">
                    <div className="text-xs text-slate-500 mb-1">Data Size</div>
                    <div className="text-sm text-gold-300 font-semibold">{activeChallenge.requirements.dataSize}</div>
                  </div>
                </div>

                <h4 className="font-fantasy text-amber-400 mb-3">Select the components needed for this system:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  {PATTERNS.map((pattern) => {
                    const isSelected = (challengeSelections[activeChallenge.id] || []).includes(pattern.id);
                    const isChecked = result?.checked;
                    const isRequired = activeChallenge.requiredComponents.includes(pattern.id);

                    let cardClasses = 'rounded-lg border p-3 cursor-pointer transition-all text-center ';
                    if (isChecked && isRequired && isSelected) {
                      cardClasses += 'bg-green-500/20 border-green-400/50';
                    } else if (isChecked && !isRequired && isSelected) {
                      cardClasses += 'bg-red-500/20 border-red-400/50';
                    } else if (isChecked && isRequired && !isSelected) {
                      cardClasses += 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20';
                    } else if (isSelected) {
                      cardClasses += 'bg-gold-500/20 border-gold-400/50 shadow-md shadow-gold-500/10';
                    } else {
                      cardClasses += 'bg-obsidian-800/40 border-gold-600/20 hover:border-gold-500/40 hover:bg-obsidian-800/60';
                    }

                    return (
                      <div
                        key={pattern.id}
                        className={cardClasses}
                        onClick={() => !isChecked && toggleChallengeComponent(activeChallenge.id, pattern.id)}
                      >
                        <div className="text-gold-400 flex justify-center mb-1">{pattern.icon}</div>
                        <div className="text-xs text-white font-semibold">{pattern.name}</div>
                        {isChecked && isRequired && (
                          <div className="text-xs text-green-400 mt-1">Required</div>
                        )}
                        {isChecked && isSelected && !isRequired && (
                          <div className="text-xs text-red-400 mt-1">Not needed</div>
                        )}
                        {isChecked && isRequired && !isSelected && (
                          <div className="text-xs text-amber-400 mt-1">Missed</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!result?.checked ? (
                  <button
                    className="w-full py-3 rounded-lg font-fantasy text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/20"
                    onClick={() => checkChallenge(activeChallenge)}
                  >
                    Check Design
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${
                      result.score >= 80
                        ? 'bg-green-500/10 border-green-500/30'
                        : result.score >= 60
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-fantasy text-lg text-white flex items-center gap-2">
                          {result.score >= 80 ? <Trophy size={20} className="text-yellow-400" /> : result.score >= 60 ? <Star size={20} className="text-amber-400" /> : <AlertTriangle size={20} className="text-red-400" />}
                          Score: {result.score}%
                        </span>
                        <span className="text-sm text-gold-300">
                          +{Math.round((result.score / 100) * activeChallenge.xpReward)} XP
                        </span>
                      </div>
                      <div className="w-full h-3 bg-obsidian-900/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            result.score >= 80
                              ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                              : result.score >= 60
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                              : 'bg-gradient-to-r from-red-500 to-rose-400'
                          }`}
                          style={{ width: `${result.score}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-obsidian-900/50 rounded-lg p-4 border border-gold-600/15">
                      <h5 className="font-fantasy text-gold-300 mb-2">Explanation</h5>
                      <p className="text-sm text-slate-300 leading-relaxed">{activeChallenge.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderCtoRaid = () => {
    const activeMission = CTO_MISSIONS.find((m) => m.id === activeCtoMissionId);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="text-sm text-cyan-300/80">
            Rank: {ctoRank} • Cleared: {completedCtoMissions.size}/{CTO_MISSIONS.length}
          </div>
          <div className="flex-1 h-2 bg-obsidian-900/60 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCtoMissions.size / CTO_MISSIONS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!activeMission ? (
            <motion.div
              key="cto-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {CTO_MISSIONS.map((mission) => {
                const cleared = completedCtoMissions.has(mission.id);
                return (
                  <motion.div
                    key={mission.id}
                    className={`rounded-xl border backdrop-blur-sm p-5 cursor-pointer transition-all hover:scale-[1.02] ${
                      cleared
                        ? 'bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 border-cyan-500/40'
                        : 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30'
                    }`}
                    onClick={() => setActiveCtoMissionId(mission.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-black/30 border border-white/10 text-gold-300">{mission.tier}</span>
                      <span className="text-xs text-amber-300">Boss: {mission.bossName}</span>
                    </div>
                    <h3 className="font-fantasy text-xl text-white mb-2">{mission.name}</h3>
                    <p className="text-sm text-slate-300 mb-3">{mission.scenario}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div className="bg-black/25 rounded p-2 border border-white/10">QPS: {mission.nonFunctional.qps}</div>
                      <div className="bg-black/25 rounded p-2 border border-white/10">P95: {mission.nonFunctional.p95}</div>
                      <div className="bg-black/25 rounded p-2 border border-white/10">SLA: {mission.nonFunctional.availability}</div>
                      <div className="bg-black/25 rounded p-2 border border-white/10">Budget: {mission.nonFunctional.budget}</div>
                    </div>
                    <div className="mt-3 text-xs text-cyan-300">Reward: up to {mission.xpReward} XP</div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="cto-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                className="mb-4 flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200 transition-colors font-fantasy"
                onClick={() => setActiveCtoMissionId(null)}
              >
                <ArrowLeft size={16} /> Back to Raid Board
              </button>

              <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/80 to-indigo-950/40 p-6 mb-6">
                <div className="mb-4">
                  <div className="text-xs uppercase tracking-widest text-amber-300 mb-1">{activeMission.tier} Raid</div>
                  <h2 className="font-fantasy text-2xl text-white">{activeMission.name}</h2>
                  <p className="text-sm text-slate-300 mt-2">{activeMission.scenario}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  <div className="bg-black/30 rounded-lg p-3 border border-white/10 text-xs text-slate-200">
                    <div className="text-slate-400 mb-1">QPS</div>{activeMission.nonFunctional.qps}
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-white/10 text-xs text-slate-200">
                    <div className="text-slate-400 mb-1">P95</div>{activeMission.nonFunctional.p95}
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-white/10 text-xs text-slate-200">
                    <div className="text-slate-400 mb-1">Availability</div>{activeMission.nonFunctional.availability}
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-white/10 text-xs text-slate-200">
                    <div className="text-slate-400 mb-1">Budget</div>{activeMission.nonFunctional.budget}
                  </div>
                </div>

                <h4 className="font-fantasy text-cyan-300 mb-2">Pick Architecture Components</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
                  {PATTERNS.map((pattern) => {
                    const selected = (ctoComponentSelections[activeMission.id] || []).includes(pattern.id);
                    const checked = Boolean(ctoResults[activeMission.id]?.checked);
                    const required = activeMission.requiredComponents.includes(pattern.id);
                    const cls = checked
                      ? required && selected
                        ? 'bg-emerald-500/20 border-emerald-400/50'
                        : required && !selected
                        ? 'bg-amber-500/15 border-amber-500/40'
                        : selected
                        ? 'bg-red-500/15 border-red-400/50'
                        : 'bg-obsidian-800/30 border-gold-600/20'
                      : selected
                      ? 'bg-cyan-500/20 border-cyan-400/50'
                      : 'bg-obsidian-800/30 border-gold-600/20 hover:border-cyan-400/40';

                    return (
                      <button
                        key={pattern.id}
                        className={`rounded-lg border p-3 text-left transition-all ${cls}`}
                        onClick={() => toggleCtoComponent(activeMission.id, pattern.id)}
                        disabled={checked}
                      >
                        <div className="text-cyan-300 mb-1">{pattern.icon}</div>
                        <div className="text-xs text-white font-semibold">{pattern.name}</div>
                      </button>
                    );
                  })}
                </div>

                <h4 className="font-fantasy text-fuchsia-300 mb-2">Pick CTO Principles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-5">
                  {CTO_PRINCIPLES.map((principle) => {
                    const selected = (ctoPrincipleSelections[activeMission.id] || []).includes(principle.id);
                    const checked = Boolean(ctoResults[activeMission.id]?.checked);
                    const required = activeMission.recommendedPrinciples.includes(principle.id);
                    const cls = checked
                      ? required && selected
                        ? 'bg-emerald-500/15 border-emerald-400/40'
                        : required && !selected
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : selected
                        ? 'bg-red-500/10 border-red-400/40'
                        : 'bg-obsidian-800/20 border-gold-600/20'
                      : selected
                      ? 'bg-fuchsia-500/15 border-fuchsia-400/40'
                      : 'bg-obsidian-800/20 border-gold-600/20 hover:border-fuchsia-400/30';
                    return (
                      <button
                        key={principle.id}
                        className={`rounded-lg border p-3 text-left transition-all ${cls}`}
                        onClick={() => toggleCtoPrinciple(activeMission.id, principle.id)}
                        disabled={checked}
                      >
                        <div className="text-sm text-white font-semibold">{principle.label}</div>
                        <div className="text-xs text-slate-400 mt-1">{principle.description}</div>
                      </button>
                    );
                  })}
                </div>

                {!ctoResults[activeMission.id]?.checked ? (
                  <button
                    className="w-full py-3 rounded-lg font-fantasy text-lg font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 text-white hover:from-cyan-500 hover:to-indigo-500 transition-all"
                    onClick={() => checkCtoMission(activeMission)}
                  >
                    Resolve Raid
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className={`p-4 rounded-lg border ${
                      ctoResults[activeMission.id].score >= 85
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : ctoResults[activeMission.id].score >= 70
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-white font-bold">Raid Score: {ctoResults[activeMission.id].score}%</span>
                        <span className="text-cyan-300">+{ctoResults[activeMission.id].xpEarned} XP</span>
                      </div>
                      <div className="text-xs text-slate-300">
                        Components: {Math.round(ctoResults[activeMission.id].componentAccuracy)}% • Principles: {Math.round(ctoResults[activeMission.id].principleAccuracy)}%
                      </div>
                    </div>
                    <button
                      className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-xs text-white"
                      onClick={() => resetCtoMission(activeMission.id)}
                    >
                      Reset Attempt
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderConcepts = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {CONCEPTS.map((concept) => {
        const isExpanded = expandedConcept === concept.id;
        return (
          <motion.div
            key={concept.id}
            layout
            className={`rounded-xl border bg-gradient-to-br ${concept.color} backdrop-blur-sm overflow-hidden transition-all`}
          >
            <div
              className="p-5 cursor-pointer flex items-center justify-between"
              onClick={() => setExpandedConcept(isExpanded ? null : concept.id)}
            >
              <div className="flex items-center gap-3">
                <div className="text-gold-400">{concept.icon}</div>
                <h3 className="font-fantasy text-lg text-white">{concept.name}</h3>
              </div>
              <ChevronRight
                size={18}
                className={`text-gold-400 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              />
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gold-600/15 p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {concept.points.map((point, i) => (
                        <div key={i} className="bg-obsidian-900/40 rounded-lg p-4 border border-gold-600/15">
                          <h5 className="font-semibold text-gold-300 text-sm mb-2 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-gold-500/20 flex items-center justify-center text-xs text-gold-400 font-mono flex-shrink-0">{i + 1}</span>
                            {point.title}
                          </h5>
                          <p className="text-xs text-slate-300 leading-relaxed">{point.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );

  const renderQuiz = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gold-300/70">
            Progress: {answeredQuizCount}/{QUIZ_QUESTIONS.length} answered | {correctQuizCount} correct
          </span>
          <span className="text-sm text-amber-300/70">
            +{correctQuizCount * 15} XP earned
          </span>
        </div>
        <div className="w-full h-2 bg-obsidian-900/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
            animate={{ width: `${(answeredQuizCount / QUIZ_QUESTIONS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-center gap-1 mt-3">
          {QUIZ_QUESTIONS.map((q) => {
            const answered = quizSubmitted[q.id];
            const correct = answered && quizAnswers[q.id] === q.correctIndex;
            return (
              <div
                key={q.id}
                className={`w-3 h-3 rounded-full transition-colors ${
                  !answered
                    ? 'bg-slate-700'
                    : correct
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
                title={`Q${q.id}: ${q.topic}`}
              />
            );
          })}
        </div>
      </div>

      {/* Page indicator */}
      <div className="flex items-center justify-between mb-4">
        <button
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
            quizPage > 0
              ? 'bg-slate-700 text-white hover:bg-slate-600'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
          onClick={() => quizPage > 0 && setQuizPage(quizPage - 1)}
          disabled={quizPage === 0}
        >
          Previous
        </button>
        <span className="text-sm text-slate-400">Page {quizPage + 1} of {totalQuizPages}</span>
        <button
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
            quizPage < totalQuizPages - 1
              ? 'bg-slate-700 text-white hover:bg-slate-600'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
          onClick={() => quizPage < totalQuizPages - 1 && setQuizPage(quizPage + 1)}
          disabled={quizPage >= totalQuizPages - 1}
        >
          Next
        </button>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {currentQuizQuestions.map((question, qi) => {
          const globalIndex = quizPage * quizQuestionsPerPage + qi + 1;
          const answered = quizSubmitted[question.id];
          const selectedAnswer = quizAnswers[question.id];
          const isCorrect = selectedAnswer === question.correctIndex;

          return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qi * 0.05 }}
              className="rounded-xl border border-gold-600/15 bg-gradient-to-br from-obsidian-800/60 to-obsidian-900/60 backdrop-blur-sm p-5 ornament-corners"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center text-black font-bold text-sm font-fantasy">
                  {globalIndex}
                </span>
                <div>
                  <p className="text-white font-semibold">{question.question}</p>
                  <span className="text-xs text-gold-400/60 mt-1 inline-block">{question.topic}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {question.options.map((option, i) => {
                  const isSelected = selectedAnswer === i;
                  const isCorrectOption = i === question.correctIndex;
                  let optClasses = 'p-3 rounded-lg border text-sm transition-all ';

                  if (answered && isCorrectOption) {
                    optClasses += 'bg-green-500/20 border-green-400/50 text-green-300';
                  } else if (answered && isSelected && !isCorrectOption) {
                    optClasses += 'bg-red-500/20 border-red-400/50 text-red-300';
                  } else if (isSelected) {
                    optClasses += 'bg-gold-500/20 border-gold-400/50 text-gold-300 cursor-pointer';
                  } else if (answered) {
                    optClasses += 'bg-obsidian-800/30 border-gold-600/10 text-slate-500';
                  } else {
                    optClasses += 'bg-obsidian-800/30 border-gold-600/20 text-slate-300 hover:border-gold-500/40 hover:bg-obsidian-800/50 cursor-pointer';
                  }

                  return (
                    <div
                      key={i}
                      className={optClasses}
                      onClick={() => handleQuizSelect(question.id, i)}
                    >
                      <span className="font-mono text-xs mr-2 text-slate-500">{String.fromCharCode(65 + i)}.</span>
                      {option}
                      {answered && isCorrectOption && <CheckCircle2 size={14} className="inline ml-2 text-green-400" />}
                      {answered && isSelected && !isCorrectOption && <XCircle size={14} className="inline ml-2 text-red-400" />}
                    </div>
                  );
                })}
              </div>

              {!answered ? (
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    selectedAnswer != null
                      ? 'bg-gradient-to-r from-gold-500 to-amber-500 text-black font-bold hover:from-gold-400 hover:to-amber-400'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                  disabled={selectedAnswer == null}
                  onClick={() => handleQuizSubmit(question)}
                >
                  Submit Answer
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg text-sm ${
                    isCorrect
                      ? 'bg-green-500/10 border border-green-500/20 text-green-300'
                      : 'bg-red-500/10 border border-red-500/20 text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    {isCorrect ? (
                      <><Award size={14} /> Correct! +15 XP</>
                    ) : (
                      <><XCircle size={14} /> Incorrect</>
                    )}
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{question.explanation}</p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Page navigation bottom */}
      <div className="flex items-center justify-between mt-6">
        <button
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            quizPage > 0
              ? 'bg-slate-700 text-white hover:bg-slate-600'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
          onClick={() => quizPage > 0 && setQuizPage(quizPage - 1)}
          disabled={quizPage === 0}
        >
          Previous Page
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            quizPage < totalQuizPages - 1
              ? 'bg-slate-700 text-white hover:bg-slate-600'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
          onClick={() => quizPage < totalQuizPages - 1 && setQuizPage(quizPage + 1)}
          disabled={quizPage >= totalQuizPages - 1}
        >
          Next Page
        </button>
      </div>
    </motion.div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d1a] via-[#1a1a2e] to-[#0d0d1a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0d0d1a]/90 backdrop-blur-md border-b border-gold-600/20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-obsidian-800/60 border border-gold-600/15 text-slate-300 hover:text-white hover:border-[#DAA520]/50 hover:bg-slate-700/60 transition-all text-sm"
              >
                <ArrowLeft size={16} />
                <span className="font-fantasy">Back</span>
              </button>
              <div>
                <h1 className="font-fantasy text-2xl bg-gradient-to-r from-gold-400 via-amber-400 to-gold-500 bg-clip-text text-transparent">
                  System Design Forge
                </h1>
                <p className="text-xs text-slate-400">Master the art of building scalable systems</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-obsidian-800/60 border border-gold-600/15">
                <Layers size={14} className="text-gold-400" />
                <span className="text-gold-300">{completedPatterns.size} Patterns</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-obsidian-800/60 border border-gold-600/15">
                <Target size={14} className="text-purple-400" />
                <span className="text-purple-300">{completedChallenges.size} Challenges</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-obsidian-800/60 border border-gold-600/15">
                <Award size={14} className="text-amber-400" />
                <span className="text-amber-300">{correctQuizCount}/{QUIZ_QUESTIONS.length} Quiz</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-obsidian-800/60 border border-gold-600/15">
                <Trophy size={14} className="text-cyan-400" />
                <span className="text-cyan-300">{completedCtoMissions.size}/{CTO_MISSIONS.length} Raid</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-semibold transition-all relative ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-b from-slate-800/80 to-transparent text-gold-300 border-t border-x border-gold-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-500 to-amber-500"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'patterns' && <div key="patterns">{renderPatterns()}</div>}
          {activeTab === 'challenges' && <div key="challenges">{renderChallenges()}</div>}
          {activeTab === 'concepts' && <div key="concepts">{renderConcepts()}</div>}
          {activeTab === 'quiz' && <div key="quiz">{renderQuiz()}</div>}
          {activeTab === 'cto-raid' && <div key="cto-raid">{renderCtoRaid()}</div>}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SystemDesign;
