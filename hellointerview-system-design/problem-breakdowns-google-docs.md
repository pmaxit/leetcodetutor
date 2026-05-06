# Design a Collaborative Document Editor Like Google Docs | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/problem-breakdowns/google-docs

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

# Google Docs

Real-time Updates

By[Stefan Mai](https://www.linkedin.com/in/stefanmai/)·Published Jul 13, 2024·

hard

·

Asked at:

![Amazon](https://files.hellointerview.com/build-assets/PRODUCTION/_next/static/media/amazon-icon.0u2y0dgp1rlnw.svg?dpl=a5eaff0b0b1e4190375aeda4ce53625448283294)

![Fountain](https://files.hellointerview.com/build-assets/PRODUCTION/_next/static/media/fountain.0eak1gw3_12y7.svg?dpl=a5eaff0b0b1e4190375aeda4ce53625448283294)

+4

* * *

###### Try This Problem Yourself

Practice with guided hints and real-time feedback

Upgrade to Practice

[

Premium users can view this video once signed in

](/login)

## Understanding the Problem

**📄 What is [Google Docs](https://docs.google.com)?** Google Docs is a browser-based collaborative document editor. Users can create rich text documents and collaborate with others in real-time.

In this writeup we'll design a system that supports the core functionality of Google Docs, dipping into websockets and collaborative editing systems. We'll start with the requirements (like a real interview), then move on to complete the design following our [Delivery Framework](/learn/system-design/in-a-hurry/delivery).

### [Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#1-functional-requirements)

**Core Requirements**

1.  Users should be able to create new documents.
2.  Multiple users should be able to edit the same document concurrently.
3.  Users should be able to view each other's changes in real-time.
4.  Users should be able to see the cursor position and presence of other users.

**Below the line (out of scope)**

1.  Sophisticated document structure. We'll assume a simple text editor.
2.  Permissions and collaboration levels (e.g. who has access to a document).
3.  Document history and versioning.

### [Non-Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#2-non-functional-requirements)

## Set Up

### Planning the Approach

### [Defining the Core Entities](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#core-entities-2-minutes)

### Defining the API

## [High-Level Design](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#high-level-design-10-15-minutes)

### 1) Users should be able to create new documents.

### 2) Multiple users should be able to edit the same document concurrently.

#### Collaborative Edits Breakdown

### 3) Users should be able to view each other's changes in real-time.

#### When the Document is Loaded

#### When Updates Happen

### 4) Users should be able to see the cursor position and presence of other users.

## [Potential Deep Dives](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#deep-dives-10-minutes)

### 1) How do we scale to millions of websocket connections?

### 2) How do we keep storage under control?

### Some additional deep dives you might consider

## [What is Expected at Each Level?](https://www.hellointerview.com/blog/the-system-design-interview-what-is-expected-at-each-level)

### Mid-level

### Senior

### Staff

## References

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

Set Up

](#set-up)[

Planning the Approach

](#planning-the-approach)[

Defining the Core Entities

](#defining-the-core-entities)[

Defining the API

](#defining-the-api)[

High-Level Design

](#high-level-design)[

1) Users should be able to create new documents.

](#1-users-should-be-able-to-create-new-documents)[

2) Multiple users should be able to edit the same document concurrently.

](#2-multiple-users-should-be-able-to-edit-the-same-document-concurrently)[

3) Users should be able to view each other's changes in real-time.

](#3-users-should-be-able-to-view-each-other-s-changes-in-real-time)[

4) Users should be able to see the cursor position and presence of other users.

](#4-users-should-be-able-to-see-the-cursor-position-and-presence-of-other-users)[

Potential Deep Dives

](#potential-deep-dives)[

1) How do we scale to millions of websocket connections?

](#1-how-do-we-scale-to-millions-of-websocket-connections)[

2) How do we keep storage under control?

](#2-how-do-we-keep-storage-under-control)[

Some additional deep dives you might consider

](#some-additional-deep-dives-you-might-consider)[

What is Expected at Each Level?

](#what-is-expected-at-each-level)[

Mid-level

](#mid-level)[

Senior

](#senior)[

Staff

](#staff)[

References

](#references)

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