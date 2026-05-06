# Design an Online Auction Platform Like eBay | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/problem-breakdowns/online-auction

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

# Online Auction

Dealing with Contention

Real-time Updates

By[Evan King](https://www.linkedin.com/in/evan-king-40072280/)·Updated Feb 14, 2026·

medium

·

Asked at:

A

* * *

###### Try This Problem Yourself

Practice with guided hints and real-time feedback

Upgrade to Practice

[

Premium users can view this video once signed in

](/login)

## Understanding the Problem

**🛍️ What is an online auction?** An online auction service lets users list items for sale while others compete to purchase them by placing increasingly higher bids until the auction ends, with the highest bidder winning the item.

As is the case with all of our common question breakdowns, we'll walk through this problem step by step, using the [Hello Interview System Design Framework](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery) as our guide. Note that I go into more detail here than would be required or possible in an interview, but I think the added detail is helpful for teaching concepts and deepening understanding.

### [Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#1-functional-requirements)

**Core Requirements**

1.  Users should be able to post an item for auction with a starting price and end date.
2.  Users should be able to bid on an item. Where bids are accepted if they are higher than the current highest bid.
3.  Users should be able to view an auction, including the current highest bid.

**Below the line (out of scope):**

*   Users should be able to search for items.
*   Users should be able to filter items by category.
*   Users should be able to sort items by price.
*   Users should be able to view the auction history of an item.

### [Non-Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#2-non-functional-requirements)

Before diving into the non-functional requirements, ask your interviewer about the expected scale of the system. Understanding the scale requirements early will help inform key architectural decisions throughout your design.

## The Set Up

### [Defining the Core Entities](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#core-entities-2-minutes)

### [API or System Interface](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#api-or-system-interface-5-minutes)

## [High-Level Design](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#high-level-design-10-15-minutes)

### 1) Users should be able to post an item for auction with a starting price and end date.

### 2) Users should be able to bid on an item. Where bids are accepted if they are higher than the current highest bid.

### 3) Users should be able to view an auction, including the current highest bid.

## [Potential Deep Dives](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#deep-dives-10-minutes)

### 1) How can we ensure strong consistency for bids?

### 2) How can we ensure that the system is fault tolerant and durable?

### 3) How can we ensure that the system displays the current highest bid in real-time?

### 4) How can we ensure that the system scales to support 10M concurrent auctions?

### Some additional deep dives you might consider

## [What is Expected at Each Level?](https://www.hellointerview.com/blog/the-system-design-interview-what-is-expected-at-each-level)

### Mid-level

### Senior

### Staff

###### Test Your Knowledge

Take a quick 15 question quiz to test what you've learned.

Start Quiz

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

Defining the Core Entities

](#defining-the-core-entities)[

API or System Interface

](#api-or-system-interface)[

High-Level Design

](#high-level-design)[

1) Users should be able to post an item for auction with a starting price and end date.

](#1-users-should-be-able-to-post-an-item-for-auction-with-a-starting-price-and-end-date)[

2) Users should be able to bid on an item. Where bids are accepted if they are higher than the current highest bid.

](#2-users-should-be-able-to-bid-on-an-item-where-bids-are-accepted-if-they-are-higher-than-the-current-highest-bid)[

3) Users should be able to view an auction, including the current highest bid.

](#3-users-should-be-able-to-view-an-auction-including-the-current-highest-bid)[

Potential Deep Dives

](#potential-deep-dives)[

1) How can we ensure strong consistency for bids?

](#1-how-can-we-ensure-strong-consistency-for-bids)[

2) How can we ensure that the system is fault tolerant and durable?

](#2-how-can-we-ensure-that-the-system-is-fault-tolerant-and-durable)[

3) How can we ensure that the system displays the current highest bid in real-time?

](#3-how-can-we-ensure-that-the-system-displays-the-current-highest-bid-in-real-time)[

4) How can we ensure that the system scales to support 10M concurrent auctions?

](#4-how-can-we-ensure-that-the-system-scales-to-support-10m-concurrent-auctions)[

Some additional deep dives you might consider

](#some-additional-deep-dives-you-might-consider)[

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