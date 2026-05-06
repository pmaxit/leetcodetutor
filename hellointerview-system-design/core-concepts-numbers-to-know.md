# Numbers to Know for System Design Interviews | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/core-concepts/numbers-to-know

[

Limited Time Offer:Up to 20% off Hello Interview Premium

Up to 20% off Hello Interview Premium 🎉



](/premium)

Search

⌘K

[Pricing](/pricing)[Become a Coach](/become-an-expert)

Tutor

Get Premium

###### Core Concepts

# Numbers to Know

Learn about the numbers you need to know for system design interviews.

* * *

Our industry moves fast. The hardware we build systems on evolves constantly, which means even recent textbooks can become outdated quickly. A book published just a few years ago might be teaching patterns that still make sense, but quoting numbers that are off by orders of magnitude.

One of the biggest giveaways that a candidate has book knowledge but no hands-on experience during a system design interview is when they rely on outdated hardware constraints. They do scale calculations using numbers from 2015 (or even 2020!) that dramatically underestimate what modern systems can handle. You'll hear concerns about database sizes, memory limits, and storage costs that made sense then, but would lead to significantly over-engineered systems today.

This isn't the candidate's fault – they're doing the right thing by studying. But understanding modern hardware capabilities is crucial for making good system design decisions. When to shard a database, whether to cache aggressively, how to handle large objects – these choices all depend on having an accurate sense of what today's hardware can handle.

Let's look at the numbers that actually matter in 2026.

## Modern Hardware Limits

Modern servers pack serious computing power. An AWS [M6i.32xlarge](https://aws.amazon.com/ec2/instance-types/m6i/) comes with 512 GiB of memory and 128 vCPUs for general workloads. Memory-optimized instances go further: the [X1e.32xlarge](https://aws.amazon.com/ec2/instance-types/x1e/) provides 4 TB of RAM, while the [U-24tb1.metal](https://aws.amazon.com/blogs/aws/ec2-high-memory-update-new-18-tb-and-24-tb-instances/) reaches 24 TB of RAM. This shift matters because many applications that once required distributed systems can now run on a single machine.

Storage capacity has seen similar growth. Modern instances like AWS's [i3en.24xlarge](https://aws.amazon.com/ec2/instance-types/i3en/) provide 60 TB of local SSD storage. If you need more, the [D3en.12xlarge](https://aws.amazon.com/ec2/instance-types/d3/) offers 336 TB of HDD storage for data-heavy workloads. Object storage like [S3](https://aws.amazon.com/s3/) is effectively unlimited, handling petabyte-scale deployments as a standard practice. The days of storage being a primary constraint are largely behind us.

Network capabilities haven't stagnated either. Within a datacenter, 25 Gbps is common for standard instances, with high-performance instances supporting 50-100 Gbps or more. Cross-AZ bandwidth within a region is limited only by instance network capacity. Latency remains predictable: sub-1ms within an availability zone, 1-2ms across AZs in the same region, and 50-150ms cross-region. This consistent performance allows for reliable distributed system design.

These aren't just incremental improvements – they represent a step change in what's possible. When textbooks talk about splitting databases at 100GB or avoiding large objects in memory, they're working from outdated constraints. The hardware running our systems today would have been unimaginable a decade ago, and these capabilities fundamentally change how we approach system design.

## Applying These Numbers in System Design Interviews

Let's look at how these numbers impact specific components and the decisions we make when designing systems in an interview.

### Caching

### Databases

### Application Servers

### Message Queues

## Cheat Sheet

## Common Mistakes In Interviews

### Premature sharding

### Overestimating latency

### Over-engineering given a high write throughput

## What about costs?

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

Modern Hardware Limits

](#modern-hardware-limits)[

Applying These Numbers in System Design Interviews

](#applying-these-numbers-in-system-design-interviews)[

Caching

](#caching)[

Databases

](#databases)[

Application Servers

](#application-servers)[

Message Queues

](#message-queues)[

Cheat Sheet

](#cheat-sheet)[

Common Mistakes In Interviews

](#common-mistakes-in-interviews)[

Premature sharding

](#premature-sharding)[

Overestimating latency

](#overestimating-latency)[

Over-engineering given a high write throughput

](#over-engineering-given-a-high-write-throughput)[

What about costs?

](#what-about-costs)[

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