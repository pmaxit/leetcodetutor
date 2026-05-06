# How to scale writes in your system design interview | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/patterns/scaling-writes

[

Limited Time Offer:Up to 20% off Hello Interview Premium

Up to 20% off Hello Interview Premium 🎉



](/premium)

Search

⌘K

[Pricing](/pricing)[Become a Coach](/become-an-expert)

Tutor

Get Premium

###### Patterns

# Scaling Writes

Learn about how to scale writes in your system design interview.

Scaling Writes

* * *

**📈 Scaling Writes** addresses the challenge of handling high-volume write operations when a single database or single server becomes the bottleneck. As your application grows from hundreds to millions of writes per second, individual components hit hard limits on disk I/O, CPU, and network bandwidth and interviewers love to probe these bottlenecks.

## The Challenge

Many system design problems start with modest scaling requirements before the interviewer throws down the gauntlet: "how does it scale?" While you might be familiar with tools to handle the read side of the equation (e.g. read replicas, caching, etc.) the write side is often a much bigger challenge.

Bursty, high-throughput writes with lots of contention can be a nightmare to build around and there are a bunch of different choices you can make to handle them or make them worse. Interviewers love to probe bottlenecks in your solution to see how you would react to the runaway success of their next product (whether that's realistic or not is a separate discussion!).

Write Challenges

In this pattern we're going to walk through the various scenarios and challenges you should expect to see in a system design interview, and talk about the strategies you can use to scale your system.

###### Problem Breakdowns with Scaling Writes Pattern

[YouTube Top K](/learn/system-design/problem-breakdowns/top-k#scaling-writes)

[Strava](/learn/system-design/problem-breakdowns/strava#scaling-writes)

[Rate Limiter](/learn/system-design/problem-breakdowns/distributed-rate-limiter#scaling-writes)

[Ad Click Aggregator](/learn/system-design/problem-breakdowns/ad-click-aggregator#scaling-writes)

[FB Post Search](/learn/system-design/problem-breakdowns/fb-post-search#scaling-writes)

[Metrics Monitoring](/learn/system-design/problem-breakdowns/metrics-monitoring#scaling-writes)

## The Solution

Write scaling isn't (only) about throwing more hardware at the problem, there's a bunch of architectural choices we can make which improve the system's ability to scale. A combination of four strategies will allow you to scale writes beyond what a single, unoptimized database or server can handle:

1.  Vertical Scaling and Database Choices
2.  Sharding and Partitioning
3.  Handling Bursts with Queues and Load Shedding
4.  Batching and Hierarchical Aggregation

Let's first talk about how we can scale while staying safely in a single-server, single-database architecture before we start to throw more hardware at the problem!

### Vertical Scaling and Write Optimization

#### Vertical Scaling

#### Database Choices

### [Sharding](/learn/system-design/core-concepts/sharding) and Partitioning

#### Horizontal Sharding

#### Vertical Partitioning

### Handling Bursts with Queues and Load Shedding

#### Write Queues for Burst Handling

#### Load Shedding Strategies

### Batching and Hierarchical Aggregation

#### Batching

#### Hierarchical Aggregation

## When to Use in Interviews

### Common Interview Scenarios

### When NOT to Use in Interviews

## Common Deep Dives

### "How do you handle resharding when you need to add more shards?"

### "What happens when you have a hot key that's too popular for even a single shard?"

#### Split All Keys

#### Split Hot Keys Dynamically

## Conclusion

### Purchase Premium to Keep Reading

###### Unlock this article and so much more with Hello Interview Premium

[Buy Premium](/premium/checkout)

###### The best mocks on the market.

Now up to 10% off

[Learn More](/mock/overview)

Reading Progress

On This Page

[

The Challenge

](#the-challenge)[

The Solution

](#the-solution)[

Vertical Scaling and Write Optimization

](#vertical-scaling-and-write-optimization)[

Sharding and Partitioning

](#sharding-and-partitioning)[

Handling Bursts with Queues and Load Shedding

](#handling-bursts-with-queues-and-load-shedding)[

Batching and Hierarchical Aggregation

](#batching-and-hierarchical-aggregation)[

When to Use in Interviews

](#when-to-use-in-interviews)[

Common Interview Scenarios

](#common-interview-scenarios)[

When NOT to Use in Interviews

](#when-not-to-use-in-interviews)[

Common Deep Dives

](#common-deep-dives)[

"How do you handle resharding when you need to add more shards?"

](#how-do-you-handle-resharding-when-you-need-to-add-more-shards)[

"What happens when you have a hot key that's too popular for even a single shard?"

](#what-happens-when-you-have-a-hot-key-that-s-too-popular-for-even-a-single-shard)[

Conclusion

](#conclusion)

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