# Design a Local Business Review Site Like Yelp | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/problem-breakdowns/yelp

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

# Yelp

Scaling Reads

By[Evan King](https://www.linkedin.com/in/evan-king-40072280/)·Published Jul 15, 2024·

medium

·

Asked at:

* * *

###### Try This Problem Yourself

Practice with guided hints and real-time feedback

Upgrade to Practice

[

Premium users can view this video once signed in

](/login)

## Understanding the Problem

**🍽️ What is [Yelp](https://www.yelp.com/)?** Yelp is an online platform that allows users to search for and review local businesses, restaurants, and services.

### [Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#1-functional-requirements)

Some interviewers will start the interview by outlining the core functional requirements for you. Other times, you'll be tasked with coming up with them yourself. If you've used the product before, this should be relatively straight forward. However, if you haven't, it's a good idea to ask some questions of your interviewer to better understand the system.

Here is the set of functional requirements we'll focus on in this breakdown (this is also the set of requirements I lead candidates to when asking this question in an interview)

**Core Requirements**

1.  Users should be able to search for businesses by name, location (lat/long), and category
2.  Users should be able to view businesses (and their reviews)
3.  Users should be able to leave reviews on businesses (mandatory 1-5 star rating and optional text)

**Below the line (out of scope):**

*   Admins should be able to add, update, and remove businesses (we will focus just on the user)
*   Users should be able to view businesses on a map
*   Users should be recommended businesses relevant to them

### [Non-Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#2-non-functional-requirements)

**Core Requirements**

1.  The system should have low latency for search operations (< 500ms)
2.  The system should be highly available, eventual consistency is fine
3.  The system should be scalable to handle 100M daily users and 10M businesses

**Below the line (out of scope):**

*   The system should protect user data and adhere to GDPR
*   The system should be fault tolerant
*   The system should protect against spam and abuse

If you're someone who often struggles to come up with your non-functional requirements, take a look at this list of [common non-functional requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#2-non-functional-requirements) that should be considered. Just remember, most systems are all these things (fault tolerant, scalable, etc) but your goal is to identify the unique characteristics that make this system challenging or unique.

Here is what you might write on the whiteboard:

Yelp Non-Functional Requirements

### Constraints

## The Set Up

### [Defining the Core Entities](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#core-entities-2-minutes)

### [The API](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#4-api-or-system-interface)

## [High-Level Design](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#high-level-design-10-15-minutes)

### 1) Users should be able to search for businesses

### 2) Users should be able to view businesses

### 3) Users should be able to leave reviews on businesses

## [Potential Deep Dives](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#deep-dives-10-minutes)

### 1) How would you efficiently calculate and update the average rating for businesses to ensure it's readily available in search results?

### 2) How would you modify your system to ensure that a user can only leave one review per business?

### 3) How can you improve search to handle complex queries more efficiently?

### 4) How would you modify your system to allow searching by predefined location names such as cities or neighborhoods?

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

Constraints

](#constraints)[

The Set Up

](#the-set-up)[

Defining the Core Entities

](#defining-the-core-entities)[

The API

](#the-api)[

High-Level Design

](#high-level-design)[

1) Users should be able to search for businesses

](#1-users-should-be-able-to-search-for-businesses)[

2) Users should be able to view businesses

](#2-users-should-be-able-to-view-businesses)[

3) Users should be able to leave reviews on businesses

](#3-users-should-be-able-to-leave-reviews-on-businesses)[

Potential Deep Dives

](#potential-deep-dives)[

1) How would you efficiently calculate and update the average rating for businesses to ensure it's readily available in search results?

](#1-how-would-you-efficiently-calculate-and-update-the-average-rating-for-businesses-to-ensure-it-s-readily-available-in-search-results)[

2) How would you modify your system to ensure that a user can only leave one review per business?

](#2-how-would-you-modify-your-system-to-ensure-that-a-user-can-only-leave-one-review-per-business)[

3) How can you improve search to handle complex queries more efficiently?

](#3-how-can-you-improve-search-to-handle-complex-queries-more-efficiently)[

4) How would you modify your system to allow searching by predefined location names such as cities or neighborhoods?

](#4-how-would-you-modify-your-system-to-allow-searching-by-predefined-location-names-such-as-cities-or-neighborhoods)[

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