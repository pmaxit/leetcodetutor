# Redis Deep Dive for System Design Interviews | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/deep-dives/redis

[

Limited Time Offer:Up to 20% off Hello Interview Premium

Up to 20% off Hello Interview Premium 🎉



](/premium)

Search

⌘K

[Pricing](/pricing)[Become a Coach](/become-an-expert)

Tutor

Get Premium

###### Key Technologies

# Redis

Learn about how you can use Redis to solve a large number of problems in System Design.

Updated Jan 16, 2026

* * *

###### Watch Video Walkthrough

Watch the author walk through the problem step-by-step

###### Watch Video Walkthrough

Watch the author walk through the problem step-by-step

Watch Now

System designs can involve a dizzying array of different [technologies](/learn/system-design/in-a-hurry/key-technologies), [concepts](/learn/system-design/in-a-hurry/core-concepts) and [patterns](/learn/system-design/in-a-hurry/patterns), but one technology (arguably) stands above the rest in terms of its _versatility:_ Redis. This versatility is important in an interview setting because it allows you to go deep. Instead of learning about dozens of different technologies, you can learn a few useful ones and learn them deeply, which magnifies the chances that you're able to get to the level your interviewer is expecting.

Beyond versatility, Redis is great for its _simplicity_. Redis has a ton of features which resemble data structures you're probably used to from coding (hashes, sets, sorted sets, streams, etc) and which, given a few basics, are easy to reason about how they behave in a distributed system. While many databases involve a lot of magic (optimizers, query planners, etc), with only minor exceptions Redis has remained quite simple and good at what it does best: executing simple operations **fast**.

Ok, Redis is versatile, simple, and useful for system design interviews. Let's learn how it works.

## Redis Basics

Redis is a self-described ["data structure store"](https://redis.io/docs/latest/) written in C. It's in-memory 🫢 and single threaded 😱 making it very fast and easy to reason about.

One important reason you might not want to use Redis is because you need **durability**. While there are some reasonable strategies for (using Redis' Append-Only File [AOF](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)) to _minimize_ data loss, you don't get the same guarantees you might get from e.g. a relational database about commits being written to disk. This is an intentional tradeoff made by the Redis team in favor of speed, but alternative implementations (e.g. [AWS' MemoryDB](https://aws.amazon.com/memorydb/)) will compromise a bit on speed to give you disk-based durability. If you need it, it's there!

Some of the most fundamental data structures supported by Redis:

*   Strings
*   Hashes (objects/dictionaries)
*   Lists
*   Sets
*   Sorted Sets (Priority Queues)
*   Bloom Filters (probabilistic set membership; allows false positives)
*   Geospatial Indexes
*   Time Series

In addition to simple data structures, Redis also supports different communication patterns like Pub/Sub and Streams, partially standing in for more complex setups like Apache Kafka or AWS SNS (Simple Notification Service) / SQS (Simple Queue Service).

The core structure underneath Redis is a key-value store. Keys are strings while values which can be any of the data structures supported by Redis: binary data and strings, sets, lists, hashes, sorted sets, etc. All objects in Redis have a key.

Redis logical model

The choice of keys is important as these keys might be stored in separate nodes based on your [infrastructure configuration](#infrastructure-configurations). Effectively, the way you organize the keys will be the way you organize your data and scale your Redis cluster.

### Commands

Redis' wire protocol is a custom query language comprised of simple strings which are used for all functionality of Redis. The CLI is really simple, you can literally connect to a Redis instance and run these commands from the CLI.

```
SET foo 1  
GET foo     # Returns 1
INCR foo    # Returns 2
XADD mystream * name Sara surname OConnor # Adds an item to a stream
```

The [full set of commands](https://redis.io/commands/) is surprisingly readable, when grouped by data structure. As an example, Redis' Sets support simple operations like adding an element to the set (SADD), getting the number of elements or cardinality (SCARD, the count of set members), listing those elements (SMEMBERS) and checking existence (SISMEMBER) - close analogs to what you would have with a Set in any general purpose programming language.

### Infrastructure Configurations

Redis can run as a single node, with a high availability (HA) replica, or as a cluster. When operating as a cluster, Redis clients cache a set of "hash slots" which map keys to a specific node. This way clients can directly connect to the node which contains the data they are requesting.

Redis infrastructure configurations

Think of hash slots like a phone book: the client keeps a local map from slots to nodes. If a slot moves during rebalancing or failover, the server replies with MOVED and the client refreshes its map (e.g. via CLUSTER SHARDS).

Each node maintains some awareness of other nodes via a gossip protocol so, in limited instances, if you request a key from the wrong node you can be redirected to the correct node. But Redis' emphasis is on performance so hitting the correct endpoint first is a priority.

Compared to most databases, Redis clusters are surprisingly basic (and thus, have some pretty severe limitations on what they can do). Rather than solving scalability problems for you, Redis can be thought of as providing you some basic primitives on which you can solve them. As an example, with few exceptions, Redis expects all the data for a given request to be on a single node! **Choosing how to structure your keys is how you scale Redis.**

## Performance

Redis is really, really fast. Redis can handle O(100k) writes per second and read latency is often in the microsecond range. This scale makes some anti-patterns for other database systems actually feasible with Redis. As an example, firing off 100 SQL requests to generate a list of items with a SQL database is a terrible idea, you're better off writing a SQL query which returns all the data you need in one request. On the other hand, the overhead for doing the same with Redis is rather low - while it'd be great to avoid it if you can, it's doable.

This is completely a function of the in-memory nature of Redis. It's not a good fit for every use case, but it's a great fit for many.

## Capabilities

### Redis as a Cache

The most common deployment scenario of Redis is as a cache. In this case, the root keys and values of Redis map to the keys and values in our cache. Redis can distribute this hash map trivially across all the nodes of our cluster enabling us to scale without much fuss - if we need more capacity we simply add nodes to the cluster.

For example, you might cache a product under key product:123 with the value stored as a JSON blob or a Redis Hash containing fields like name, price, and inventoryCount.

When using Redis as a cache, you'll often employ a time to live (TTL) on each key. Redis guarantees you'll never read the value of a key after the TTL has expired and the TTL is used to decide which items to evict from the server - keeping the cache size manageable even in the case where you're trying to cache more items than memory allows.

Using Redis in this fashion doesn't solve one of the more important problems caches face: the ["hot key" problem](#hot-key-issues), though Redis is not unique in this respect vs alternatives like Memcached or other highly scaled databases like DynamoDB.

Redis as a cache

### Redis as a Distributed Lock

Another common use of Redis in system design settings is as a distributed lock. Occasionally we have data in our system and we need to maintain consistency during updates (e.g. the very common [Design Ticketmaster](/learn/system-design/problem-breakdowns/ticketmaster) system design question), or we need to make sure multiple people aren't performing an action at the same time (e.g. [Design Uber](/learn/system-design/problem-breakdowns/uber)).

Most databases (including Redis) will offer _some_ consistency guarantees. If your core database can provide consistency, don't rely on a distributed lock which may introduce extra complexity and issues. Your interviewer will likely ask you to think through the edge cases in order to make sure you really understand the concept.

A very simple distributed lock with a timeout might use the atomic increment (INCR) with a TTL. This is basically a shared counter. When we want to try to acquire the lock, we run INCR. If the response is 1 (i.e. we were the first person to try to grab the lock, so we own it!), we proceed. If the response is > 1 (i.e. someone else beat us and has the lock), we wait and retry again later. When we're done with the lock, we can DEL the key so that other processes can make use of it.

More sophisticated locks in Redis can use the [Redlock algorithm](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/) together with fencing tokens if you want an airtight solution.

### Redis for Leaderboards

Redis' sorted sets maintain ordered data which can be queried in log time which make them appropriate for leaderboard applications. The high write throughput and low read latency make this especially useful for scaled applications where something like a SQL DB will start to struggle.

In [Post Search](/learn/system-design/problem-breakdowns/fb-post-search) we have a need to find the posts which contain a given keyword (e.g. "tiger") which have the most likes (e.g. "Tiger Woods made an appearance..." @ 500 likes).

We can use Redis' sorted sets to maintain a list of the top liked posts for a given keyword. Periodically, we can remove low-ranked posts to save space.

```
ZADD tiger_posts 500 "SomeId1" # Add the Tiger woods post
ZADD tiger_posts 1 "SomeId2" # Add some tweet about zoo tigers
ZREMRANGEBYRANK tiger_posts 0 -6 # Remove all but the top 5 posts
```

### Redis for Rate Limiting

As a data structure server, implementing a wide variety of rate limiting algorithms is possible. A common algorithm is a fixed-window rate limiter where we guarantee that the number of requests does not exceed N over some fixed window of time W.

Implementation of this in Redis is simple. When a request comes in, we increment (INCR) the key for our rate limiter and check the response. If the response is greater than N, we wait. If it's less than N, we can proceed. We call EXPIRE on our key so that after time period W, the value is reset.

If you need a sliding window, you can store timestamps in a Sorted Set per key and remove old entries before counting; run the check in Lua to keep it atomic.

### Redis for Proximity Search

Redis natively supports geospatial indexes with commands like GEOADD and GEOSEARCH. The basic commands are simple:

```
GEOADD key longitude latitude member # Adds "member" to the index at key "key"
GEOSEARCH key FROMLONLAT longitude latitude BYRADIUS radius unit # Searches the index at key "key" at specified position and radius
```

The search command, in this instance, runs in O(N+log(M)) time where N is the number of elements in the radius and M is the number of items inside the shape.

Why do we have both N and M? Redis' geospatial commands use geohashes under the hood to index the data. These geohashes allow us to grab candidates in grid-aligned bounding boxes. But these boxes are square and imprecise. A second pass takes the candidates and filters them to only include items that are within the exact radius.

### Redis for Event Sourcing

Redis' streams are append-only logs similar to Kafka's topics. The basic idea behind Redis streams is that we want to durably add items to a log and then have a distributed mechanism for consuming items from these logs. Redis solves this problem with streams (managed with commands like XADD) and consumer groups (commands like XREADGROUP and XCLAIM).

Redis streams and consumer groups

A simple example is a work queue. We want to add items to the queue and have them processed. At any point in time one of our workers might fail, and in these instances we'd like to re-process them once the failure is detected. With Redis streams we add items onto the queue with commands like XADD and have a single consumer group attached to the stream for our workers. This consumer group is maintaining a reference to the items processed via the stream and, in the case a worker fails, provides a way for a new worker to claim (XCLAIM) and restart processing that message.

### Redis for Pub/Sub

Redis natively supports a publish/subscribe (Pub/Sub) messaging pattern, allowing messages to be broadcast to multiple subscribers in real time. This is useful for building chat systems, real-time notifications, or any scenario where you want to decouple message producers from consumers (more discussion on this in our [Realtime Updates](/learn/system-design/deep-dives/realtime-updates) pattern).

People frequently call out limitations of Redis Pub/Sub that are no longer true, e.g. Redis pub/sub is now sharded which enables scalability which was not possible in previous versions!

The basic commands are straightforward:

```
SPUBLISH channel message   # Sends a message to all subscribers of 'channel' (the S prefix means "sharded")
SSUBSCRIBE channel        # Listens for messages on 'channel'
```

When a client subscribes to a channel, it will receive any messages published to that channel as long as the connection remains open. This makes Pub/Sub great for ephemeral, real-time communication, but it's important to note that messages are not persisted—if a subscriber is offline when a message is published, it will miss that message entirely.

Pub/Sub clients **use a single connection to each node in the cluster** (rather than a connection per channel). Generally speaking, this means that in most cases you'll use a number of connections equal to the number of nodes in your cluster. It also means that you don't need millions of connections even if you have millions of channels!

Redis Pub/Sub

Redis Pub/Sub is simple and fast, but not durable. The delivery of messages is "at most once" which means that if a subscriber is offline when a message is published, it will miss that message entirely. If you need message persistence, delivery guarantees, or the ability to replay missed messages, consider using Redis Streams or a dedicated message broker like Kafka or RabbitMQ.

Pub/Sub is a great fit for interview scenarios where you need to demonstrate real-time communication patterns, but be ready to discuss its limitations and when you might need a more robust solution.

Need offline delivery or durable fan-out? Redis Streams are a good option or you can pair Pub/Sub with a queue (e.g., SNS→SQS, Kafka) or outbox pattern (i.e. write the messages to a database) so consumers can catch up later.

#### Can I roll my own Pub/Sub?

Some candidates recoil at the idea of using Redis' native Pub/Sub because they're concerned about scalability (often stemming from a misunderstanding, thinking that Pub/Sub uses a connection per channel). The typical proposal looks like this:

> Instead of using Redis Pub/Sub, we'll create keys for each topic with the server address as a value. Then, when a user wants to publish a message to that topic, they can look up the key and send the message directly to that server.

While there may be some applications of this, it has some acute downsides.

First, the number of network hops is increased. With Pub/Sub, when we want to send a message, the pathway looks like this:

```
1. Client sends message to Pub/Sub node
2. Pub/Sub node dispatches message to all subscribers
```

Two network hops. With the homegrown Pub/Sub, the pathway looks like this:

```
1. Client requests subscribers for topic key from Redis
2. Redis responds with servers to contact
3. Client sends message to each server
```

Three network hops. The last hop is the most expensive because it's likely that we don't already have a TCP connection established to each subscriber. When we set up a Pub/Sub connection, we're establishing (and holding open) a TCP connection to each node. This makes the message quick to send. With our homegrown approach, we need to establish these new connections for each server before we send.

And next, we need to consider the resident memory cost. With Pub/Sub, we're only keeping track of channels that have active subscribers. When the last subscriber for a channel disconnects, the channel is removed from memory (publishes to that channel aren't received by anyone). With our homegrown approach, when a server goes down we need to somehow learn about it to remove the entry from our map. This may require some sort of heartbeat mechanism where each server reports "hey, I'm still alive listening to this topic", either explicitly or using a TTL. This adds a lot of complexity and chatter to the system, especially if the number of topics is high.

All said, if you have a use-case that seems like Pub/Sub, use Pub/Sub!

## Shortcomings and Remediations

### Hot Key Issues

If our load is not evenly distributed across the keys in our Redis cluster, we can run into a problem known as the "hot key" issue. To illustrate it, let's pretend we're using Redis to cache the details of items in our ecommerce store. We have lots of items so we scale our cluster to 100 nodes and our items are evenly spread across them. So far, so good. Now imagine one day we have a surge of interest for _one particular item_, so much that the volume for this item matches the volume for the rest of the items.

Hot key issue

Now the load on _one server_ is dramatically higher than the rest of the servers. Unless we were severely overprovisioned (i.e. we were only using a small % of the existing CPU on each node), this server is now going to start failing.

There are lots of potential solutions for this, all with tradeoffs.

*   We can add an in-memory cache in our clients so they aren't making so many requests to Redis for the same data.
*   We can store the same data in multiple keys and randomize the requests so they are spread across the cluster.
*   We can add read replica instances and dynamically scale these with load.

For an interview setting, the important thing is that you recognize potential hot key issues (+) and that you proactively design remediations (++).

## Summary

Redis is a powerful, versatile, and simple tool you can use in system design interviews. Because Redis' capabilities are based on simple data structures, reasoning through the scaling implications of your decisions is straightforward: allowing you to go deep with your interviewer without needing to know a lot of details about Redis internals.

###### Test Your Knowledge

Take a quick 15 question quiz to test what you've learned.

Start Quiz

Login to track your progress

[Next: Elasticsearch](/learn/system-design/deep-dives/elasticsearch)

How would you rate the quality of this article?

0.5 Stars1 Star1.5 Stars2 Stars2.5 Stars3 Stars3.5 Stars4 Stars4.5 Stars5 StarsEmpty

## Comments

(179)

Login to Join the Discussion

Your account is free and you can post anonymously if you choose.

​

Sort By

Popular

Sort By

![Muhammad Ahmad](https://lh3.googleusercontent.com/a/ACg8ocKcSJqCsk2p1x7CYdU3hgkT2srWKNwAYlvzEGJiE_xojNQ_bw=s96-c)

Muhammad Ahmad

Top 5%

Top 5%

[• 1 year ago](#comment-cm6vzbqen0108kuuzr32cix5n)

Redis distributed lock (including the one from Redlock protocol) is not safe, because it is not fenced.

Consider this use case:

1.  Client 1 acquires a TTL lock (SUCCESS)
2.  Client 1 experiences a GC pause
3.  TTL lock expires
4.  Client 2 acquires a TTL lock (SUCCESS, because of step 3 above)
5.  Client 2 writes to shared resource (SUCCESS)
6.  Client 1 resumes from GC pause and does not know that the lock has expired
7.  Client 1 writes to shared resource (SUCCESS, because shared resource does not know lock has expired).

You cannot make shared resource check Redis for status of lock, because network is unreliable etc.

Instead, the right way to do distributed locking is to use a fencing token/lock, which is a monotonically increasing integer number. This is discussed here:

1.  Client 1 acquires a TTL fencing token (SUCCESS) Let's say, Token: 37
2.  Client 1 experiences a GC pause
3.  TTL lock expires
4.  Client 2 acquires a TTL lock (SUCCESS, because of step 3 above). Let's say, Token: 38 (token increases monotonically).
5.  Client 2 writes to shared resource (SUCCESS). Shared resource keeps track of the highest fencing token it has seen so far.
6.  Client 1 resumes from GC pause and does not know that the lock has expired
7.  Client 1 writes to shared resource (FAILED). Because locks increase monotonically, client can simply perform an equality comparison to determine which lock is newer and does not need to contact the lock server. Since Client 1 is writing with Token: 37 and Client 2 has already written with Token: 38 and 37 < 38, therefore shared resource can reject the write.

Show more

106

![huayang lyu](https://lh3.googleusercontent.com/a/ACg8ocLV7FvCDIElLNtetOQ8WyYJt9EdpudS06Hxf0dpjYMo3zQLsQ=s96-c)

huayang lyu

Premium

Premium

[• 7 months ago](#comment-cmfnlfa7g034f08adfa3ulun6)

This is a great share! And I think that any distributed lock system cannot handle the issue that GC pause happens after the client gets the lock. And the clock drift could cause the same issue. The distributed lock + fencing token might be always a safer strategy when distributed lock is needed

Show more

9

H

HollowGreenAlpaca227

Premium

Premium

[• 3 months ago](#comment-cmkef6df8000c07ad0oplov2x)

Isn't this the called as "optimistic locking"?

Show more

7

C

core2extremist

Top 5%

Top 5%

[• 5 days ago](#comment-cmokdvy2500ve0dadafmdusus)

I think it's tricky - It Depends (TM) if the database operation is the expensive part.

If nodes do a bunch of work, then just do a cheap DB operation at the end, then I think it's optimistic:

*   read the database for parameters and state, call these "preconditions" (P)
*   do a bunch of work based on P
    *   note that we're doing the expensive operation _before_ acquiring the lock
    *   hence optimistic: we assume we'll almost always commit rather than abort later
*   acquire a lock
*   check that P still holds, conditions may have changed due to other threads edits while we did work. Example: make sure the client still has $100 in their account before approving the withdrawal
*   commit or abort
*   release lock

It's optimistic because we go ahead and do the work assuming conflicts are rare, then we do a quick check at the end.

If the database operation is the heavy operation then acquiring the lock first I think counts as pessimistic locking:

*   acquire the lock first before doing significant work
    *   note that we acquire the lock first
    *   this is pessimistic because we assume lock contention is high, so to prevent wasting a lot of effort, we get the lock first
*   do the significant work, in this case an expensive database operation
*   release the lock

Show more

0

![Prachiti Parkar](https://lh3.googleusercontent.com/a/ACg8ocLJ1zzwMTR0bkTuEi0OcA_RMAddoM1V9h3McHHmVfQeAdXoeQ=s96-c)

Prachiti Parkar

Premium

Premium

[• 1 month ago](#comment-cmmsbrru8078m0fadix7fvh8z)

Refer to martin kelpmann post for more details -> [https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)

Show more

4

L

lyflwh

Premium

Premium

[• 4 days ago](#comment-cmom5kqa70tsv0hadgk9zxvw8)

You need consensus algorithm to get consistent distributed lock like raft. Redis doesn't guarantee that so you will have to rely on the DB itself to achieve consistency but it does protect the DB from a lot of writes that trying to grab the lock. Even in the end there is race condition that client A and client B both aquire lock from Redis (which is possible without a consensus algorithm), the DB will only let one through and the other one would just fail.

Show more

1

P

PastBrownPerch475

Top 5%

Top 5%

[• 1 year ago](#comment-clyaft4d4001to8e4pnhoftk3)

I feel this guide (like most sys design content about Redis) is severely lacking in discussions around durability issues. You mention you don't want to use Redis when you need durability, but then propose it as a solution for multiple problems like distributed locking and leaderboard computation.

There should be discussion around what happens in those use-cases when the Redis master goes down. What are the options and tradeoffs: do requests block until you restore from a backup, how do you gracefully handle lost locks in the middle of a distributed locking controlled flow, do you recompute the leaderboard and return error responses until you have completed the work? Etc...

Show more

43

![Stefan Mai](https://hellointerview-files.s3.us-west-2.amazonaws.com/public-media/stefan-headshot_100.png)

Stefan Mai

Admin

Admin

[• 1 year ago](#comment-clyafxm9r0027qpccoe4gnpb5)

Fair, though I think I mention this directly right under Redis Basics. If you have durability as a requirement, there are alternative implementations that provide better guarantees. For everyone else, replication and fsyncing at higher frequency is the best you're going to get.

The reality is most applications aren't going to be absolutely hosed by failing/corrupting a few requests. If they will, Redis is likely not a good solution!

Show more

16

H

HomelessAquamarineTrout494

Top 5%

Top 5%

[• 3 months ago](#comment-cmkf1bas101j508ads2u7k0p2)

+1 to this concern, it'd be great to fill in this gap by providing an alternative deep dive of AWS MemoryDB and how/when it can help when durability is required and how it compares with Redis (with RDB and AOF turned on).

Show more

1

![Aayush Airan](https://lh3.googleusercontent.com/a/ACg8ocL9kyBcSlL_djbtO5Nn3PDfO-Lj6oqHpIW07cGIgip_G7AfkE4=s96-c)

Aayush Airan

Premium

Premium

[• 19 days ago](#comment-cmo1gaynv233j07adk9xbpiq6)

**@Stefan Mai** possible to fill in the gaps?

Show more

0

L

LongPinkMite157

Premium

Premium

[• 15 days ago• edited 15 days ago](#comment-cmo6d3uud2r4w08ad0l7k75aq)

Give it a read -- or use AI to summarize. But there's a pretty deep discussion of Redis durability/consistency gaps. [https://assets.amazon.science/e0/1b/ba6c28034babbc1b18f54aa8102e/amazon-memorydb-a-fast-and-durable-memory-first-cloud-database.pdf](https://assets.amazon.science/e0/1b/ba6c28034babbc1b18f54aa8102e/amazon-memorydb-a-fast-and-durable-memory-first-cloud-database.pdf)

Edit: MemoryDB does not provide durability (only) -- it provides strong consistency. It can solve any design issue when the storage capacity requirement is not too big. So it can be used as a "system of record". Supporting rich data structures, incl streams (very good alternative to kafka), json, text search etc, makes it like a swiss knife.

Edit2: A lot of times I feel that even for staff+ level the discussion around failure modes is just brushed off and we consider that when candidates know the technology/pattern that's it -- great. Unfortunately, almost all design solutions have gaps when failures happen and when you're dealing with a system that is not linearizable (client + server).

Edit3: replication and fsyncing at higher frequency is the best you're going to get Sorry, but that is not true **@Stefan Mai**. In fact, if someone proposes frequent fsync for a production system, I'd strongly advise against hiring them and it shows they don't understand how Redis operates, or have never operated it in production. If you are to deploy an open-source Redis, or use Redis enterprise, and really need something close to durable/consistent model of MemoryDB, then you should use WAIT command (with enough replicas). It has so many caveats though -- read the paper.

Show more

0

P

PersistentMoccasinTortoise870

Premium

Premium

[• 3 months ago](#comment-cmk4h2pvo005308adbmkhlgr0)

You mentioned AOF and RDB for durability mitigation. Can you have a video to put it in practice? Or one that uses technology alternative to Redis for solving problems like Instagram feed? Thanks!

Show more

1

![Darshil Bhayani](https://lh3.googleusercontent.com/a/ACg8ocKza0pppUe60sJe45Y9GzWrpuXNLCAdbRdeGl2EWnxXbvWTs_182g=s96-c)

Darshil Bhayani

[• 1 year ago](#comment-cm9fan7po00qdad08vwgzg6hr)

TL;DR Summary with Pros, Cons, and Practical Redis Use Cases

Pros of Using Redis
1. High Performance: Sub-millisecond latency and ability to handle 100k+ writes/sec make Redis ideal for real-time applications.
2. Versatile Data Structures: Supports strings, hashes, sets, sorted sets, streams, geospatial indexes, etc., enabling diverse use cases.
3. Ease of Use: Simple commands and intuitive syntax make implementation straightforward.
4. Scalability: Redis can scale horizontally with clustering and replication.
5. Durability Options: Persistence mechanisms (RDB and AOF) minimize data loss risks while maintaining performance.
6. Wide Applications: Used for caching, session storage, real-time analytics, leaderboards, rate limiting, event sourcing, etc.

Cons of Using Redis
1. Memory-Intensive: Stores data in RAM, which can be costly for large datasets.
2. Potential Data Loss: Without persistence configured, data loss can occur during crashes.
3. Manual Memory Management: Developers need to configure eviction policies for memory overflow scenarios.
4. Limited Query Capabilities: Not suitable for complex queries or relational data needs.

Practical Usage of Redis in Real Problems
Redis is widely used across industries to solve real-world problems efficiently. Here are some examples:
1. Caching:
    \* Example: E-commerce platforms cache product details to improve page load times and reduce backend strain.
    \* Implementation: Use SET and GET commands with TTL for automatic eviction.
2. Session Management:
    \* Example: Gaming platforms store user sessions to scale stateless servers during traffic spikes.
    \* Implementation: Store session data as hashes (HSET) with expiry times (EXPIRE).
3. Real-Time Analytics:
    \* Example: Retailers track website visits and user behavior instantly for actionable insights.
    \* Implementation: Use streams (XADD, XREAD) for continuous event logging.
4. Leaderboards:
    \* Example: Gaming platforms rank players based on scores using ZADD and retrieve top players with ZRANGE.
    \* Implementation: Periodically remove low-ranked entries (ZREMRANGEBYRANK) to save space.
5. Rate Limiting:
    \* Example: API gateways limit requests per user by incrementing counters (INCR) with expiry times (EXPIRE).
    \* Implementation: Reject requests if the counter exceeds the limit.
6. Proximity Search:
    \* Example: Ride-sharing apps find nearby drivers using GEOADD and GEORADIUS.
    \* Implementation: Store driver locations as geospatial data and query within a radius.
7. Event Sourcing & Message Queues:
    \* Example: Chat applications use Pub/Sub (PUBLISH, SUBSCRIBE) for real-time notifications.
    \* Implementation: Workers claim unprocessed tasks from streams (XCLAIM) in case of failures.
8. Fraud Detection:
    \* Example: Financial institutions monitor suspicious activities in real time to prevent fraud.
    \* Implementation: Use hashes or streams for quick data aggregation.
Redis is a powerful tool for solving real-world problems requiring low-latency data access and scalability across industries such as retail, gaming, ride-hailing, and finance.

Show more

17

![Aditya Jain](https://lh3.googleusercontent.com/a/ACg8ocIDFrbvCA6dVYDzSDVp8im_J1aOkWr-2ARYQpLeRtBOtB0d=s96-c)

Aditya Jain

[• 2 years ago](#comment-clt9bsv2l00035pcdfvxeq8i0)

Wow! So well written and to the point. This was very helpful. Thank you for putting this together :)

Show more

12

![Stefan Mai](https://hellointerview-files.s3.us-west-2.amazonaws.com/public-media/stefan-headshot_100.png)

Stefan Mai

Admin

Admin

[• 2 years ago](#comment-clt9bujsh00055pcdukqg228j)

Our pleasure Aditya, glad it was useful. Let us know if you have any feedback or questions - always looking to improve!

Show more

10

A

ashrock1970

[• 1 year ago](#comment-cm4mmjxnd00bg104vocdrsm7z)

Thanks Stefan for this well written doc. I had an ask, you did mention about Redis as a Pub/Sub, but can you provide any good reference blogs which cover Redis Pub/Sub in higher details and how it is different from Kafka.

Show more

6

Show All Comments

###### The best mocks on the market.

Now up to 10% off

[Learn More](/mock/overview)

Reading Progress

On This Page

[

Redis Basics

](#redis-basics)[

Commands

](#commands)[

Infrastructure Configurations

](#infrastructure-configurations)[

Performance

](#performance)[

Capabilities

](#capabilities)[

Redis as a Cache

](#redis-as-a-cache)[

Redis as a Distributed Lock

](#redis-as-a-distributed-lock)[

Redis for Leaderboards

](#redis-for-leaderboards)[

Redis for Rate Limiting

](#redis-for-rate-limiting)[

Redis for Proximity Search

](#redis-for-proximity-search)[

Redis for Event Sourcing

](#redis-for-event-sourcing)[

Redis for Pub/Sub

](#redis-for-pub-sub)[

Shortcomings and Remediations

](#shortcomings-and-remediations)[

Hot Key Issues

](#hot-key-issues)[

Summary

](#summary)

![CTA](/_next/image?url=https%3A%2F%2Ffiles.hellointerview.com%2Fbuild-assets%2FPRODUCTION%2F_next%2Fstatic%2Fmedia%2Fcta.0pmyxoc9fn9ja.png%3Fdpl%3Da5eaff0b0b1e4190375aeda4ce53625448283294&w=3840&q=75)

#### Schedule a mock interview

Meet with a FAANG senior+ engineer or manager and learn exactly what it takes to get the job.

[Schedule a Mock Interview](/mock/schedule?focus=true)

###### Questions

[Meta SWE Interview Questions](/community/questions?company=Meta)[Amazon SWE Interview Questions](/community/questions?company=Amazon)[Google SWE Interview Questions](/community/questions?company=Google)[OpenAI SWE Interview Questions](/community/questions?company=OpenAI)[Engineering Manager (EM) Interview Questions](/community/questions?level=MANAGER)

###### Learn

[Learn System Design](/learn/system-design/)[Learn DSA](/learn/code/)[Learn Behavioral](/learn/behavioral)[Learn ML System Design](/learn/ml-system-design/)[Learn Low Level Design](/learn/low-level-design/)[Guided Practice](/practice)

###### Links

[FAQ](/faq)[Pricing](/pricing)[Gift Mock Interviews](/mock/gift-credits)[Gift Premium](/premium/gift)[Become a Coach](/become-an-expert)[Our Coaches](/our-coaches)[Hello Interview Premium](/premium)

###### Legal

[Terms and Conditions](/terms)[Privacy Policy](/privacy)[Security](/security)

###### Contact

[About Us](/aboutus)[Product Support](/support)

7511 Greenwood Ave North Unit #4238 Seattle WA 98103

* * *

© 2026 Optick Labs Inc. All rights reserved.