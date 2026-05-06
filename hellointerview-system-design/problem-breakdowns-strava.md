# Design a Fitness Tracking App Like Strava | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/problem-breakdowns/strava

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

# Strava

Scaling Writes

Real-time Updates

By[Evan King](https://www.linkedin.com/in/evan-king-40072280/)·Published Jul 12, 2024·

medium

·

Asked at:

* * *

###### Try This Problem Yourself

Practice with guided hints and real-time feedback

Upgrade to Practice

## Understanding the Problem

**🏃‍♂️🚴‍♀️ What is [Strava](https://www.strava.com/)?** Strava is a fitness tracking application that allows users to record and share their physical activities, primarily focusing on running and cycling, with their network. It provides detailed analytics on performance, routes, and allows social interactions among users.

While Strava supports a wide variety of activities, we'll focus on running and cycling for this question.

### [Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#1-functional-requirements)

**Core Requirements**

1.  Users should be able to start, pause, stop, and save their runs and rides.
2.  While running or cycling, users should be able to view activity data, including route, distance, and time.
3.  Users should be able to view details about their own completed activities as well as the activities of their friends.

**Below the Line (Out of Scope)**

*   Adding or deleting friends (friend management).
*   Authentication and authorization.
*   Commenting or liking runs.

### [Non-Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#2-non-functional-requirements)

**Core Requirements**

1.  The system should be highly available (availability >> consistency).
2.  The app should function in remote areas without network connectivity.
3.  The app should provide the athlete with accurate and up-to-date local statistics during the run/ride.
4.  The system should scale to support 10 million concurrent activities.

## The Set Up

### [Defining the Core Entities](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#core-entities-2-minutes)

### [The API](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#4-api-or-system-interface)

## [High-Level Design](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#high-level-design-10-15-minutes)

### 1) Users should be able to start, pause, stop, and save their runs and rides.

### 2) While running or cycling, users should be able to view activity data, including route, distance, and time.

### 3) Users should be able to view details about their own completed activities as well as the activities of their friends.

## [Potential Deep Dives](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#deep-dives-10-minutes)

### 1) How can we support tracking activities while offline?

### 2) How can we scale to support 10 million concurrent activities?

### 3) How can we support realtime sharing of activities with friends?

### 4) How can we expose a leaderboard of top athletes?

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

The API

](#the-api)[

High-Level Design

](#high-level-design)[

1) Users should be able to start, pause, stop, and save their runs and rides.

](#1-users-should-be-able-to-start-pause-stop-and-save-their-runs-and-rides)[

2) While running or cycling, users should be able to view activity data, including route, distance, and time.

](#2-while-running-or-cycling-users-should-be-able-to-view-activity-data-including-route-distance-and-time)[

3) Users should be able to view details about their own completed activities as well as the activities of their friends.

](#3-users-should-be-able-to-view-details-about-their-own-completed-activities-as-well-as-the-activities-of-their-friends)[

Potential Deep Dives

](#potential-deep-dives)[

1) How can we support tracking activities while offline?

](#1-how-can-we-support-tracking-activities-while-offline)[

2) How can we scale to support 10 million concurrent activities?

](#2-how-can-we-scale-to-support-10-million-concurrent-activities)[

3) How can we support realtime sharing of activities with friends?

](#3-how-can-we-support-realtime-sharing-of-activities-with-friends)[

4) How can we expose a leaderboard of top athletes?

](#4-how-can-we-expose-a-leaderboard-of-top-athletes)

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