# System Design Interview Patterns | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/in-a-hurry/patterns

[

Limited Time Offer:Up to 20% off Hello Interview Premium

Up to 20% off Hello Interview Premium 🎉



](/premium)

Search

⌘K

[Pricing](/pricing)[Become a Coach](/become-an-expert)

Tutor

Get Premium

###### System Design in a Hurry

# Common Patterns

The most common system design interview patterns, built by FAANG managers and staff engineers

Updated Jul 17, 2025

* * *

By taking the [key technologies](/learn/system-design/in-a-hurry/key-technologies) and [core concepts](/learn/system-design/in-a-hurry/core-concepts) we've discussed and combining them, you can build a wide variety of systems. But success in the time-constrained environment of interviewing is all about patterns. If you're able to identify the patterns that are required for a specific design, not only can you fall back to best practices but you'll save a bunch of time trying to reinvent the wheel.

The ability to identify and apply patterns is a skill that often separates senior engineers from more junior engineers in the system design interview. Patterns allow you to know what's interesting and what's not, they also save you time by helping you to see common failure modes rather than reverse engineering them on the fly!

Overall Structure

What follows are some common patterns that you can use to build systems. These patterns are not mutually exclusive, and you'll often find yourself utilizing several of them to build a system. In each of our [Problem Breakdowns](/learn/system-design/problem-breakdowns/overview), we'll call out patterns that are used to build the system so you can spot these commonalities and read about common deep dives and pitfalls.

## Pushing Realtime Updates

In many systems, you'll need to be able to make updates to the user in real-time. For synchronous APIs, this is as simple as returning a response once the request is completed. For other systems like chat applications, notifications, or live dashboards, you'll need to be able to push updates to the user as they happen.

There are a lot of decisions to make when implementing realtime updates. First, you'll need to choose a protocol. Simple HTTP polling is the simplest option, but it's not the most efficient. Server-sent events (SSE) and websockets are purpose-built for realtime updates, but the infrastructure can be tricky to get right. Read our [Networking Essentials](/learn/system-design/core-concepts/networking-essentials) core concept for a deep dive on the protocol choice. We generally recommend starting with HTTP polling until it no longer serves your needs. Once you're there, you can consider SSE or websockets.

For the server side of realtime updates, you again have more options! Pub/Sub services are a common way to decouple the publisher and subscriber (used in our [Whatsapp](/learn/system-design/problem-breakdowns/whatsapp) breakdown), while stateful servers in a consistent hash ring or other configuration can be used for situations where processing is heavier (used in our [Google Docs](/learn/system-design/problem-breakdowns/google-docs) breakdown).

Realtime Updates Challenges

We talk about all of these options at length in our [Pushing Realtime Updates](/learn/system-design/patterns/realtime-updates) Pattern.

## Managing Long-Running Tasks

Many operations in distributed systems take too long for synchronous processing - video encoding, report generation, bulk operations, or any task that takes more than a few seconds. The Managing Long-Running Tasks pattern splits these operations into immediate acknowledgment and background processing.

When users submit heavy tasks, your web server instantly validates the request, pushes a job to a queue (like Redis or Kafka), and returns a job ID within milliseconds. Separate worker processes continuously pull jobs from the queue and execute the actual work. This provides fast user response times, independent scaling of web servers and workers, and fault isolation.

Many candidates are quick to pull the trigger on pushing their processing behind a queue, but this is frequently a bad decision and you need to be careful about the tradeoffs. If you have short-running jobs, returning the status of the job synchronously with the request simplifies your architecture dramatically providing clearer back-pressure and better user experience.

The key technologies are message queues for job coordination and worker pools for processing. You'll need to handle job status tracking, retries, and failure scenarios like dead letter queues for poison messages.

Long Running Tasks

Get the full breakdown of async worker pools, job queues, and failure handling in our [Managing Long-Running Tasks](/learn/system-design/patterns/long-running-tasks) Pattern.

## Dealing with Contention

When multiple users try to access the same resource simultaneously, like booking the last concert ticket or bidding on an auction item, you need mechanisms to prevent race conditions and ensure data consistency. This pattern addresses coordination challenges in distributed systems.

Solutions range from database-level approaches like pessimistic locking and optimistic concurrency control to distributed coordination mechanisms. The key is understanding when to use atomicity and transactions versus explicit locking strategies. For distributed systems, you might need distributed locks, two-phase commit protocols, or queue-based serialization.

Trade-offs include performance versus consistency guarantees, and simple database solutions versus complex distributed coordination. Most problems start with single-database solutions before scaling to distributed approaches.

Databases are built around problems of contention. When you separate your data into multiple databases, you're taking on all of the challenges that the database systems were originally designed to solve. In some cases this can be completely appropriate, but be careful about doing it prematurely. Interviewers are keen to dig in and see if you really understand all that you're giving up by breaking your data apart.

Example of a race condition

Dive deeper into locks, transactions, and distributed coordination techniques in our [Dealing with Contention](/learn/system-design/patterns/dealing-with-contention) Pattern.

## Scaling Reads

As your application grows from hundreds to millions of users, read traffic often becomes the first bottleneck. While writes create data, reads consume it - and read traffic typically grows much faster than write traffic. The Scaling Reads pattern addresses high-volume read requests through database optimization, horizontal scaling, and intelligent caching.

For most applications, the read-to-write ratio starts at 10:1 but often reaches 100:1 or higher. Consider Instagram: when you open the app, you see dozens of photos requiring hundreds of database queries for metadata, user info, and engagement data. Meanwhile, you might only post once per day - a single write operation.

The solution follows a natural progression: optimize read performance within your database through indexing and denormalization, scale horizontally with read replicas, then add external caching layers like Redis and CDNs.

Key considerations include managing cache invalidation, handling replication lag in read replicas, and dealing with hot keys where millions of users request the same popular content simultaneously.

Database Read Scaling

Learn about indexing strategies, read replicas, and cache invalidation patterns in our [Scaling Reads](/learn/system-design/patterns/scaling-reads) Pattern.

## Scaling Writes

As your application grows from hundreds to millions of writes per second, individual database servers and storage systems hit hard limits. The Scaling Writes pattern addresses write bottlenecks through [sharding](/learn/system-design/core-concepts/sharding), batching, and intelligent load management.

The core strategies are horizontal [sharding](/learn/system-design/core-concepts/sharding) (distributing data across multiple servers), vertical partitioning (separating different types of data), and handling write bursts through queues and load shedding. Key considerations include selecting good partition keys that distribute load evenly while keeping related data together.

For burst handling, you can use write queues to buffer temporary spikes or implement load shedding to prioritize important writes during overload. Batching techniques help reduce per-operation overhead by grouping multiple writes together.

Good and Bad Partition Keys

Read our comprehensive guide to [sharding](/learn/system-design/core-concepts/sharding), partitioning, and handling write bursts in our [Scaling Writes](/learn/system-design/patterns/scaling-writes) Pattern.

## Handling Large Blobs

Large files like videos, images, and documents need special handling in distributed systems. Instead of routing gigabytes through your application servers, this pattern uses direct client-to-storage transfers with presigned URLs and CDN delivery.

Your application server generates temporary, scoped credentials (presigned URLs) that let clients upload directly to blob storage like S3. Downloads come from CDNs with signed URLs for access control. This eliminates your servers as bottlenecks while providing resumable uploads, progress tracking, and global distribution.

Key challenges include state synchronization between your database metadata and blob storage, handling upload failures, and managing the lifecycle of large files. Event notifications from storage services help keep your application state consistent.

Large Blobs

Explore advanced techniques for presigned URLs, resumable uploads, and CDN delivery in our [Large Blobs](/learn/system-design/patterns/large-blobs) Pattern.

## Multi-Step Processes

Complex business processes often involve multiple services and long-running operations that must survive failures, retries, and external dependencies. This pattern provides reliable coordination for workflows like order fulfillment, user onboarding, or payment processing.

Solutions range from simple single-server orchestration to sophisticated workflow engines and durable execution systems. Event sourcing provides a distributed approach where each step emits events that trigger subsequent steps. Modern workflow systems like Temporal or AWS Step Functions handle state management, failure recovery, and retry logic automatically.

The key insight is moving from scattered state management and manual error handling to declarative workflow definitions where the system guarantees exactly-once execution and maintains complete audit trails.

Multi-Step Processes

See detailed examples and implementation strategies for workflow engines and durable execution in our [Multi-Step Processes](/learn/system-design/patterns/multi-step-processes) Pattern.

## Proximity-Based Services

Several systems like [Design Uber](/learn/system-design/problem-breakdowns/uber) or [Design Gopuff](/learn/system-design/problem-breakdowns/gopuff) will require you to search for entities by location. Geospatial indexes are the key to efficiently querying and retrieving entities based on geographical proximity. These services often rely on extensions to commodity databases like [PostgreSQL with PostGIS extensions](https://postgis.net/) or [Redis' geospatial data type](https://redis.io/docs/latest/develop/data-types/geospatial/), or dedicated solutions like Elasticsearch with geo-queries enabled.

The architecture typically involves dividing the geographical area into manageable regions and indexing entities within these regions. This allows the system to quickly exclude vast areas that don't contain relevant entities, thereby reducing the search space significantly.

While geospatial indexes are great, they're only really necessary when you need to index hundreds of thousands or millions of items. If you need to search through a map of 1,000 items, you're better off scanning all of the items than the overhead of a purpose-built index or service.

Note that most systems won't require users to be querying globally. Often, when proximity is involved, it means users are looking for entities _local_ to them.

## Pattern Selection

These patterns often work together to solve complex system design challenges. A video platform might use **Large Blobs** for video uploads, **Long-Running Tasks** for transcoding, **Realtime Updates** for progress notifications, and **Multi-Step Processes** to coordinate the entire workflow.

The key is recognizing which patterns apply to your specific problem and understanding their trade-offs. Start with simpler approaches (polling, single-server orchestration) and only add complexity when you have specific requirements that demand it.

In system design interviews, proactively identifying and applying these patterns demonstrates architectural maturity and helps you focus on the most important aspects of your design rather than getting bogged down in implementation details.

Login to track your progress

[Next: Question Breakdowns](/learn/system-design/in-a-hurry/problem-breakdowns)

How would you rate the quality of this article?

0.5 Stars1 Star1.5 Stars2 Stars2.5 Stars3 Stars3.5 Stars4 Stars4.5 Stars5 StarsEmpty

## Comments

(78)

Login to Join the Discussion

Your account is free and you can post anonymously if you choose.

​

Sort By

Popular

Sort By

M

matchaLatte

Top 1%

Top 1%

[• 9 months ago](#comment-cmd4bbon001w1ad07ulx0ldx6)

It would be interesting to add a (now) common pattern on designing production-ready Gen AI / LLM products (e.g. including online eval, offline eval, golden data sets, prompt engineering, RAG, 3rd party APIs, etc)

Show more

140

I

InitialSalmonPanther511

Premium

Premium

[• 3 months ago](#comment-cml4c5scl02p108adc0ivj1cs)

isnt this ml design interview in a hurry?

Show more

5

![Pratik Agarwal](https://lh3.googleusercontent.com/a/ACg8ocK16L-xe3DRdTu1qIbw6eLzlCSI3aKAT51AI-bb5wBuKxYK-Q=s96-c)

Pratik Agarwal

Top 10%

Top 10%

[• 1 year ago](#comment-cm63b5oln005gy43n383u52h7)

CQRS will be a great addition here!

Show more

30

![Haris Osmanagić](https://lh3.googleusercontent.com/a/ACg8ocLHb1QoHI7nUJ6Qx_2Q8QA94elu6In48JrXe6IEjRP8q-nEUs2Q=s96-c)

Haris Osmanagić

Premium

Premium

[• 6 months ago](#comment-cmgt9w2ix02ye08addql5d9gr)

It's certainly a great pattern, but it appears to have limited use-cases: [https://martinfowler.com/bliki/CQRS.html](https://martinfowler.com/bliki/CQRS.html).

Show more

3

C

ClearYellowScallop568

Premium

Premium

[• 3 months ago](#comment-cmkypifg305cc08adc45kn073)

good call out! I've definitely seen patterns get unwound when the original implementer left the team / company, due to the pattern's lack of solving a practical problem and adding significant maintenance burden.

Show more

1

![Tim](https://lh3.googleusercontent.com/a/ACg8ocL09kBZez-hT2MqcisZf8Ydv9L3cS2DuO3HlfobOeiPkZXZku_n=s96-c)

Tim

[• 1 year ago](#comment-clxddwk8h007fh2cysoba0a22)

I introduced temporal to my company. it is very wonderful.

Show more

10

![Evan King](https://hellointerview-files.s3.us-west-2.amazonaws.com/public-media/evan-headshot_100.png)

Evan King

Admin

Admin

[• 1 year ago](#comment-clxdf5m7e007t8bpj9odj88o4)

Nice, we use it a lot here at Hello Interview and love it.

Show more

4

![Vishal Wagh](https://lh3.googleusercontent.com/a/ACg8ocIei9CXzvf_R9OA8y66DujnfeJ3h3nTo3M4fJZ0CYf_mz37GefB=s96-c)

Vishal Wagh

Premium

Premium

[• 3 months ago](#comment-cmkm7bopw02m607adj0joc6z0)

@Evan King, can you pls share the use case here at HelloInterview? I would love to know more about it.

Show more

1

![Stefan Mai](https://hellointerview-files.s3.us-west-2.amazonaws.com/public-media/stefan-headshot_100.png)

Stefan Mai

Admin

Admin

[• 3 months ago](#comment-cmkmmdlb608ns08aditp25v0j)

On [the blog](https://www.hellointerview.com/blog/lessons-from-building-hello-interview)! #4

Show more

5

A

Abhi

Top 5%

Top 5%

[• 10 months ago](#comment-cmc3uppnf011w08ad7bz4ms5m)

> Kafka gives you many of the same guarantees as SQS, but since the requests are written to an append-only log, you can replay the log to reprocess events if something goes wrong.

We should add that SQS can also replay failed messages from a dead letter queue (DLQ) by moving it back to the main queue via a Lambda for processing.

I think the difference of Kafka vs SQS really depends on the throughput and FIFO requirements instead of the cited ability to replay messages, for example, SQS can only support 300 messages/sec for a FIFO queue, whereas Kafka is much more scalable for high throughput message load.

Show more

9

![Arunprasaath S](https://lh3.googleusercontent.com/a/ACg8ocIsFb8OQWBCy7F3UjpYP8e_gwbRxgFsYc1706I-EQXYBt5CdwD5=s96-c)

Arunprasaath S

[• 1 year ago](#comment-cm6upjwhk01fv7oi9zuz4e8nk)

How about adding video upload/download & processing as a pattern. Services similar to dropbox, youtube, instagram all have this pattern.

For the Async job worker pool model you have added a data base is this used for managing the state of Job? or you have added it to store the output? . I feel having a database to manage the state of the job will be useful. This can help with Idempotencey, re-queuing of job runs or with reporting.

Show more

5

C

core2extremist

Top 5%

Top 5%

[• 1 month ago](#comment-cmnjgqkn70b2209adzgndm8bd)

My guess is this is covered largely by the Patterns section on the site, especially

*   multi-step processes: "durable workflow orchestrators" especially Temporal and Airflow, Temporal seems to be the best choice for having a durable workflow per request; Airflow seems more geared toward cronjob-like scheduling
*   managing long running tasks: immediate reply with id + work queue + polling for updates: job state tracking in a database, Kafka / SQS / RabbitMQ / etc. for workers, worker pool, etc.
*   handling large blobs: S3 and other bucket storage, presigned URLs and other directly-upload-to-storage-backend strategies, mitigating unstable connections by allowing resumable uploads such as S3's multipart uploads (retriable at the part level, parts are all-or-nothing) or Google Doc's byte-offset-based where you can query for the byte range the server sees and resume from there

Those are paywalled and I'm not a premium, but based on the publicly available top part of the article, and references elsewhere on the site, it seems reasonably straightforward to find more information about each pattern.

However I agree it would be nice to see a tailored video processing guide, a deep dive of the "design youtube" article with more detail about how to orchestrate processing. Do we use Temporal for all of it, and handle transcoding and other heavy processing activities with a dedicated temporal processing queue? Or do we have separate transcoding, caption generation, etc. services with the immediate reply + polling or callback hook pattern, and then just have the Temporal workflow initiate processing and await the callback? Both seem plausible but which one is better?

My personal guess: for smaller sites and teams absolute efficiency takes a backseat to devops and operational simplicity - there just aren't enough workers to delve into every side quest - so the Temporal + specific work queues makes the most sense. Use generic workers for lightweight processing and API requests, including third party AI models for transcription etc. For in-house heavy processing like transcoding use dedicated queues whose workers have GPUs and other specialized hardware.

For bigger companies and teams people can specialize, and 10% inefficiency can balloons from "this costs us an extra $1k/month, not worth hiring another engineer" (Hello Interview scale) to "this costs us an extra $1M/month, time to hire a whole team and buy our own hardware" (YouTube scale). Then it makes sense to deploy specialized alternatives to Temporal etc.

Show more

1

Show All Comments

###### The best mocks on the market.

Now up to 10% off

[Learn More](/mock/overview)

Reading Progress

On This Page

[

Pushing Realtime Updates

](#pushing-realtime-updates)[

Managing Long-Running Tasks

](#managing-long-running-tasks)[

Dealing with Contention

](#dealing-with-contention)[

Scaling Reads

](#scaling-reads)[

Scaling Writes

](#scaling-writes)[

Handling Large Blobs

](#handling-large-blobs)[

Multi-Step Processes

](#multi-step-processes)[

Proximity-Based Services

](#proximity-based-services)[

Pattern Selection

](#pattern-selection)

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