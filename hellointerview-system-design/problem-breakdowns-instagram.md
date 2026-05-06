# Design a Photo Sharing App Like Instagram | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/problem-breakdowns/instagram

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

# Instagram

Scaling Reads

Managing Long Running Tasks

Handling Large Blobs

By[Evan King](https://www.linkedin.com/in/evan-king-40072280/)·Published Feb 25, 2025·

hard

·

Asked at:

![Amazon](https://files.hellointerview.com/build-assets/PRODUCTION/_next/static/media/amazon-icon.0u2y0dgp1rlnw.svg?dpl=a5eaff0b0b1e4190375aeda4ce53625448283294)

+5

* * *

###### Try This Problem Yourself

Practice with guided hints and real-time feedback

Upgrade to Practice

[

Premium users can view this video once signed in

](/login)

## Understanding the Problem

**📸 What is [Instagram](https://www.instagram.com/)?** Instagram is a social media platform primarily focused on visual content, allowing users to share photos and videos with their followers.

Designing Instagram is one of the most common system design interview questions asked not just at Meta, but across all FAANG and FAANG-adjacent companies. It has a lot of similarities with our breakdowns of [FB News Feed](https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-news-feed) and [Dropbox](https://www.hellointerview.com/learn/system-design/problem-breakdowns/dropbox), but given the popularity and demand, we decided this warranted its own breakdown.

### [Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#1-functional-requirements)

**Core Requirements**

1.  Users should be able to create posts featuring photos, videos, and a simple caption.
2.  Users should be able to follow other users.
3.  Users should be able to see a chronological feed of posts from the users they follow.

**Below the line (out of scope):**

*   Users should be able to like and comment on posts.
*   Users should be able to search for users, hashtags, or locations.
*   Users should be able to create and view stories (ephemeral content).
*   Users should be able to go live (real-time video streaming).

### [Non-Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#2-non-functional-requirements)

If you're someone who often struggles to come up with your non-functional requirements, take a look at this list of [common non-functional requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#2-non-functional-requirements) that should be considered. Just remember, most systems are all these things (fault tolerant, scalable, etc) but your goal is to identify the unique characteristics that make this system challenging or unique.

Before defining your non-functional requirements in an interview, it's wise to inquire about the scale of the system as this will have a meaningful impact on your design. In this case, we'll be looking at a system with 500M DAU with 100M posts per day.

## The Set Up

### [Defining the Core Entities](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#core-entities-2-minutes)

### [API or System Interface](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#api-or-system-interface-5-minutes)

## [High-Level Design](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#high-level-design-10-15-minutes)

### 1) Users should be able to create posts featuring photos, videos, and a simple caption

### 2) Users should be able to follow other users

### 3) Users should be able to see a chronological feed of posts from the users they follow

## [Potential Deep Dives](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#deep-dives-10-minutes)

### 1) The system should deliver feed content with low latency (< 500ms )

### 2) The system should render photos and videos instantly, supporting photos up to 8mb and videos up to 4GB

### 3) The system should be scalable to support 500M DAU

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

Defining the Core Entities

](#defining-the-core-entities)[

API or System Interface

](#api-or-system-interface)[

High-Level Design

](#high-level-design)[

1) Users should be able to create posts featuring photos, videos, and a simple caption

](#1-users-should-be-able-to-create-posts-featuring-photos-videos-and-a-simple-caption)[

2) Users should be able to follow other users

](#2-users-should-be-able-to-follow-other-users)[

3) Users should be able to see a chronological feed of posts from the users they follow

](#3-users-should-be-able-to-see-a-chronological-feed-of-posts-from-the-users-they-follow)[

Potential Deep Dives

](#potential-deep-dives)[

1) The system should deliver feed content with low latency (< 500ms )

](#1-the-system-should-deliver-feed-content-with-low-latency-500ms)[

2) The system should render photos and videos instantly, supporting photos up to 8mb and videos up to 4GB

](#2-the-system-should-render-photos-and-videos-instantly-supporting-photos-up-to-8mb-and-videos-up-to-4gb)[

3) The system should be scalable to support 500M DAU

](#3-the-system-should-be-scalable-to-support-500m-dau)[

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