# Design a Price Tracking Service like CamelCamelCamel | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/problem-breakdowns/camelcamelcamel

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

# Price Tracking Service

By[Evan King](https://www.linkedin.com/in/evan-king-40072280/)·Published Jun 3, 2025·

medium

·

Asked at:

B

![Amazon](https://files.hellointerview.com/build-assets/PRODUCTION/_next/static/media/amazon-icon.0u2y0dgp1rlnw.svg?dpl=a5eaff0b0b1e4190375aeda4ce53625448283294)

+1

* * *

###### Try This Problem Yourself

Practice with guided hints and real-time feedback

Upgrade to Practice

[

Premium users can view this video once signed in

](/login)

## Understanding the Problem

**📈 What is [CamelCamelCamel](https://camelcamelcamel.com)?** CamelCamelCamel is a price tracking service that monitors Amazon product prices over time and alerts users when prices drop below their specified thresholds. It also has a popular Chrome extension with 1 million active users that displays price history directly on Amazon product pages, allowing for one-click subscription to price drop notifications without needing to leave the Amazon product page.

### [Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#1-functional-requirements)

**Core Requirements**

1.  Users should be able to view price history for Amazon products (via website or Chrome extension)
2.  Users should be able to subscribe to price drop notifications with thresholds (via website or Chrome extension)

CamelCamelCamel has a popular Chrome extension with 1 million active users that displays price history directly on Amazon product pages, allowing for one-click subscription to price drop notifications without needing to leave the Amazon product page.

**Below the line (out of scope):**

*   Search and discover products on the platform
*   Price comparison across multiple retailers
*   Product reviews and ratings integration

### [Non-Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#2-non-functional-requirements)

The scale and performance requirements for CamelCamelCamel are driven by Amazon's massive product catalog and the need for timely price notifications.

**Core Requirements**

1.  The system should prioritize availability over consistency (eventual consistency acceptable)
2.  The system should handle 500 million Amazon products at scale
3.  The system should provide price history queries with < 500ms latency
4.  The system should deliver price drop notifications within 1 hour of price change

**Below the line (out of scope):**

*   Strong consistency for price data
*   Real-time price updates (sub-minute)

We're building a system that must be "polite" to Amazon while providing valuable price tracking to millions of users. This creates interesting technical challenges around data collection, storage efficiency, and notification delivery that we'll address in our deep dives.

Here is how your requirements might look on the whiteboard:

CamelCamelCamel Requirements

## The Set Up

### Planning the Approach

### [Defining the Core Entities](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#core-entities-2-minutes)

### [The API](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#4-api-or-system-interface)

### [Data Flow](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#optional-data-flow-5-minutes)

## [High-Level Design](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#high-level-design-10-15-minutes)

### 1) Users should be able to view price history for Amazon products (via website or Chrome extension)

### 2) Users should be able to subscribe to price drop notifications with thresholds (via website or Chrome extension)

## [Potential Deep Dives](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#deep-dives-10-minutes)

### 1) How do we efficiently discover and track 500 million Amazon products?

### 2) How do we handle potentially malicious price updates from Chrome extension users?

### 3) How do we efficiently process price changes and notify subscribed users?

### 4) How do we serve fast price history queries for chart generation?

## Final Design

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

The API

](#the-api)[

Data Flow

](#data-flow)[

High-Level Design

](#high-level-design)[

1) Users should be able to view price history for Amazon products (via website or Chrome extension)

](#1-users-should-be-able-to-view-price-history-for-amazon-products-via-website-or-chrome-extension)[

2) Users should be able to subscribe to price drop notifications with thresholds (via website or Chrome extension)

](#2-users-should-be-able-to-subscribe-to-price-drop-notifications-with-thresholds-via-website-or-chrome-extension)[

Potential Deep Dives

](#potential-deep-dives)[

1) How do we efficiently discover and track 500 million Amazon products?

](#1-how-do-we-efficiently-discover-and-track-500-million-amazon-products)[

2) How do we handle potentially malicious price updates from Chrome extension users?

](#2-how-do-we-handle-potentially-malicious-price-updates-from-chrome-extension-users)[

3) How do we efficiently process price changes and notify subscribed users?

](#3-how-do-we-efficiently-process-price-changes-and-notify-subscribed-users)[

4) How do we serve fast price history queries for chart generation?

](#4-how-do-we-serve-fast-price-history-queries-for-chart-generation)[

Final Design

](#final-design)[

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