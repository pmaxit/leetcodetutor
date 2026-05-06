# Design a Distributed Cache Like Redis | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-cache

[

Limited Time Offer:Up to 20% off Hello Interview Premium

Up to 20% off Hello Interview Premium 🎉



](/premium)

Search

⌘K

[Pricing](/pricing)[Become a Coach](/become-an-expert)

Tutor

Get Premium

###### Common Problems

# Distributed Cache

Scaling Reads

By[Evan King](https://www.linkedin.com/in/evan-king-40072280/)·Published Jul 11, 2024·

hard

·

Asked at:

![Google](https://files.hellointerview.com/build-assets/PRODUCTION/_next/static/media/google-square.0v3n9d4108zfs.svg?dpl=a5eaff0b0b1e4190375aeda4ce53625448283294)

![Microsoft](https://files.hellointerview.com/build-assets/PRODUCTION/_next/static/media/microsoft.17j4k5_o3lv8a.svg?dpl=a5eaff0b0b1e4190375aeda4ce53625448283294)

![Amazon](https://files.hellointerview.com/build-assets/PRODUCTION/_next/static/media/amazon-icon.0u2y0dgp1rlnw.svg?dpl=a5eaff0b0b1e4190375aeda4ce53625448283294)

+1

* * *

###### Try This Problem Yourself

Practice with guided hints and real-time feedback

Upgrade to Practice

## Understanding the Problem

**💾 What is a Distributed Cache?** A distributed cache is a system that stores data as key-value pairs in memory across multiple machines in a network. Unlike single-node caches that are limited by the resources of one machine, distributed caches scale horizontally across many nodes to handle massive workloads. The cache cluster works together to partition and replicate data, ensuring high availability and fault tolerance when individual nodes fail.

### [Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#1-functional-requirements-1)

**Core Requirements**

1.  Users should be able to set, get, and delete key-value pairs.
2.  Users should be able to configure the expiration time for key-value pairs.
3.  Data should be evicted according to Least Recently Used (LRU) policy.

**Below the line (out of scope)**

*   Users should be able to configure the cache size.

We opted for an LRU eviction policy, but you'll want to ask your interviewer what they're looking for if they weren't explicitly upfront. There are, of course, other eviction policies you could implement, like LFU, FIFO, and custom policies.

### [Non-Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#2-non-functional-requirements-1)

At this point in the interview, you should ask the interviewer what sort of scale we are expecting. This will have a big impact on your design, starting with how you define the non-functional requirements.

If I were your interviewer, I would say we need to store up to 1TB of data and expect to handle a peak of up to 100k requests per second.

**Core Requirements**

1.  The system should be highly available. Eventual consistency is acceptable.
2.  The system should support low latency operations (< 10ms for get and set requests).
3.  The system should be scalable to support the expected 1TB of data and 100k requests per second.

**Below the line (out of scope)**

*   Durability (data persistence across restarts)
*   Strong consistency guarantees
*   Complex querying capabilities
*   Transaction support

Note that I'm making quite a few strong assumptions about what we care about here. Make sure you're confirming this with your interviewer. Chances are you've used a cache before, so you know the plethora of potential trade-offs. Some interviewers might care about durability, for example, just ask.

## The Set Up

### Planning the Approach

### [Defining the Core Entities](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#core-entities-2-minutes)

### [The API](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#4-api-or-system-interface)

## [High-Level Design](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#high-level-design-10-15-minutes-1)

### 1) Users should be able to set, get, and delete key-value pairs

### 2) Users should be able to configure the expiration time for key-value pairs

### 3) Data should be evicted according to LRU policy

## [Potential Deep Dives](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#deep-dives-10-minutes-1)

### 1) How do we ensure our cache is highly available and fault tolerant?

### 2) How do we ensure our cache is scalable?

### 3) How can we ensure an even distribution of keys across our nodes?

### 4) What happens if you have a hot key that is being read from a lot?

### 5) What happens if you have a hot key that is being written to a lot?

### 6) How do we ensure our cache is performant?

## Tying it all together

## [What is Expected at Each Level?](https://www.hellointerview.com/blog/the-system-design-interview-what-is-expected-at-each-level)

### Mid-level

### Senior

### Staff

### Purchase Premium to Keep Reading

###### Unlock this article and so much more with Hello Interview Premium

[Buy Premium](/premium/checkout)

###### The best mocks on the market.

Now up to 10% off

[Learn More](/mock/overview)

Reading Progress

On This Page

[

Understanding the Problem

](#understanding-the-problem)[

Functional Requirements

](#functional-requirements)[

Non-Functional Requirements

](#non-functional-requirements)[

The Set Up

](#the-set-up)[

Planning the Approach

](#planning-the-approach)[

Defining the Core Entities

](#defining-the-core-entities)[

The API

](#the-api)[

High-Level Design

](#high-level-design)[

1) Users should be able to set, get, and delete key-value pairs

](#1-users-should-be-able-to-set-get-and-delete-key-value-pairs)[

2) Users should be able to configure the expiration time for key-value pairs

](#2-users-should-be-able-to-configure-the-expiration-time-for-key-value-pairs)[

3) Data should be evicted according to LRU policy

](#3-data-should-be-evicted-according-to-lru-policy)[

Potential Deep Dives

](#potential-deep-dives)[

1) How do we ensure our cache is highly available and fault tolerant?

](#1-how-do-we-ensure-our-cache-is-highly-available-and-fault-tolerant)[

2) How do we ensure our cache is scalable?

](#2-how-do-we-ensure-our-cache-is-scalable)[

3) How can we ensure an even distribution of keys across our nodes?

](#3-how-can-we-ensure-an-even-distribution-of-keys-across-our-nodes)[

4) What happens if you have a hot key that is being read from a lot?

](#4-what-happens-if-you-have-a-hot-key-that-is-being-read-from-a-lot)[

5) What happens if you have a hot key that is being written to a lot?

](#5-what-happens-if-you-have-a-hot-key-that-is-being-written-to-a-lot)[

6) How do we ensure our cache is performant?

](#6-how-do-we-ensure-our-cache-is-performant)[

Tying it all together

](#tying-it-all-together)[

What is Expected at Each Level?

](#what-is-expected-at-each-level)[

Mid-level

](#mid-level)[

Senior

](#senior)[

Staff

](#staff)

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