# Design a Metrics Monitoring Platform like Datadog | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/problem-breakdowns/metrics-monitoring

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

# Metrics Monitoring

Scaling Writes

Scaling Reads

By[Stefan Mai](https://www.linkedin.com/in/stefanmai/)·Published Feb 5, 2026·

hard

* * *

###### Try This Problem Yourself

Practice with guided hints and real-time feedback

Upgrade to Practice

[

Premium users can view this video once signed in

](/login)

## Understanding the Problem

**📊 What is a Metrics Monitoring Platform?** A metrics monitoring platform collects performance data (CPU, memory, throughput, latency) from servers and services, stores it as time-series data, visualizes it on dashboards, and triggers alerts when thresholds are breached. Think Datadog, Prometheus/Grafana, or AWS CloudWatch. This is infrastructure that engineers rely on to understand system health and respond to incidents.

### [Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#1-functional-requirements)

We'll start our discussion by trying to tease out from our interviewer what the system needs to be able to do. Even though a metrics monitoring system is simple at face-value (collect metrics, store them, query them, etc.) there's a lot of potential complexity here so we want to narrow things down.

**Core Requirements**

1.  The platform should be able to ingest metrics (CPU, memory, latency, custom counters) from services
2.  Users should be able to query and visualize metrics on dashboards with filters, aggregations, and time ranges
3.  Users should be able to define alert rules with thresholds over time windows (e.g., "alert if p99 latency > 500ms for 5 minutes")
4.  Users should receive notifications when alerts fire (email, Slack, PagerDuty)

**Below the line (out of scope):**

*   Log aggregation and full-text search (separate concern)
*   Distributed tracing (spans, traces)
*   Anomaly detection via ML

### [Non-Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#2-non-functional-requirements)

Metrics monitoring systems can range from a single team's services to a fleet of hundreds of thousands of servers. Getting a sense of the scale of the system is important because it will influence a bunch of the decisions we need to make.

We might ask our interviewer or they might tell us "we need to design for monitoring 500k servers". That's a big fleet. If each server emits 100 metric data points every 10 seconds, that's **5 million metrics per second** at peak. Each data point is small (timestamp, value, labels) at roughly 100-200 bytes, but at that volume we're looking at **1GB per second** of raw ingestion. That's the crux of the problem.

**Core Requirements**

1.  The system should scale to ingest 5M metrics per second from 500k servers
2.  Dashboard queries should return within seconds, even for queries spanning days or weeks
3.  Alerts should evaluate with low latency (< 1 minute from metric emission to alert firing)
4.  The system should be highly available. We can tolerate eventual consistency for dashboards, but alert evaluation should be reliable.
5.  The system should handle late or out-of-order data gracefully (network delays are common)

**Below the line (out of scope):**

*   Multi-region replication (would add complexity)
*   Strong consistency guarantees

Here's how your requirements section might look on your whiteboard:

Requirements

The requirement for alerts to fire in under a minute might seem slow to some readers. "Wouldn't we want to fire _as soon as the event happens_?" Yes and no. In most production systems, it's difficult to see an event until you've accumulated enough data. Oftentimes alerts are (sensibly) set on moving averages or trends over time.

When you do want to fire an alert as soon as possible, it often is constructed in a very particular way. Amazon detects order drops (their most important event!) by looking for breaches of the number of milliseconds since their last order. Since they have so many orders, this number is very stable and allows them to fire almost instantaneously when something happens.

Designing metrics like this is an art, but rarely the focus for an interview like this! While there may be interviewers who are insistent and want to build a streaming event system, that's not where we'll focus here.

## The Set Up

### Planning the Approach

### [Defining the Core Entities](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#core-entities-2-minutes)

### [Data Flow](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#optional-data-flow-5-minutes)

### [API or System Interface](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#api-or-system-interface-5-minutes)

## [High-Level Design](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#high-level-design-10-15-minutes)

### 1) The platform can ingest metrics from services

### 2) Users can query and visualize metrics on dashboards

### 3) Users can define alert rules with thresholds

### 4) Users receive notifications when alerts fire

## [Potential Deep Dives](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#deep-dives-10-minutes)

### 1) How do we serve low-latency dashboard queries over weeks of data?

### 2) How do we reduce alert latency below 1 minute?

### 3) How do we ensure high availability during spikes and failures?

### 4) How do we handle cardinality explosion?

## [What is Expected at Each Level?](https://www.hellointerview.com/blog/the-system-design-interview-what-is-expected-at-each-level)

### Mid-level

### Senior

### Staff+

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

Data Flow

](#data-flow)[

API or System Interface

](#api-or-system-interface)[

High-Level Design

](#high-level-design)[

1) The platform can ingest metrics from services

](#1-the-platform-can-ingest-metrics-from-services)[

2) Users can query and visualize metrics on dashboards

](#2-users-can-query-and-visualize-metrics-on-dashboards)[

3) Users can define alert rules with thresholds

](#3-users-can-define-alert-rules-with-thresholds)[

4) Users receive notifications when alerts fire

](#4-users-receive-notifications-when-alerts-fire)[

Potential Deep Dives

](#potential-deep-dives)[

1) How do we serve low-latency dashboard queries over weeks of data?

](#1-how-do-we-serve-low-latency-dashboard-queries-over-weeks-of-data)[

2) How do we reduce alert latency below 1 minute?

](#2-how-do-we-reduce-alert-latency-below-1-minute)[

3) How do we ensure high availability during spikes and failures?

](#3-how-do-we-ensure-high-availability-during-spikes-and-failures)[

4) How do we handle cardinality explosion?

](#4-how-do-we-handle-cardinality-explosion)[

What is Expected at Each Level?

](#what-is-expected-at-each-level)[

Mid-level

](#mid-level)[

Senior

](#senior)[

Staff+

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