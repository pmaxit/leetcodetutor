# Design a Distributed Job Scheduler Like Airflow | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/problem-breakdowns/job-scheduler

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

# Job Scheduler

By[Evan King](https://www.linkedin.com/in/evan-king-40072280/)·Updated Feb 14, 2026·

hard

·

Asked at:

![LinkedIn](https://files.hellointerview.com/build-assets/PRODUCTION/_next/static/media/linkedin.0qwozmii992x4.svg?dpl=a5eaff0b0b1e4190375aeda4ce53625448283294)

+11

* * *

###### Try This Problem Yourself

Practice with guided hints and real-time feedback

Upgrade to Practice

[

Premium users can view this video once signed in

](/login)

## Understanding the Problem

**⏰ What is a Job Scheduler** A job scheduler is a program that automatically schedules and executes jobs at specified times or intervals. It is used to automate repetitive tasks, run scheduled maintenance, or execute batch processes.

There are two key terms worth defining before we jump into solving the problem:

*   **Task**: A task is the abstract concept of work to be done. For example, "send an email". Tasks are reusable and can be executed multiple times by different jobs.
*   **Job**: A job is an instance of a task. It is made up of the task to be executed, the schedule for when the task should be executed, and parameters needed to execute the task. For example, if the task is "send an email" then a job could be "send an email to [john@example.com](mailto:john@example.com) at 10:00 AM Friday".

The main responsibility of a job scheduler is to take a set of jobs and execute them according to the schedule.

### [Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#1-functional-requirements-1)

**Core Requirements**

1.  Users should be able to schedule jobs to be executed immediately, at a future date, or on a recurring schedule (ie. "every day at 10:00 AM").
2.  Users should be able monitor the status of their jobs.

**Below the line (out of scope)**

*   Users should be able to cancel or reschedule jobs.

### [Non-Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#2-non-functional-requirements-1)

Now is a good time to ask about the scale of the system in your interview. If I were your interviewer, I would explain that the system should be able to execute 10k jobs per second.

## The Set Up

### Planning the Approach

### [Defining the Core Entities](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#core-entities-2-minutes)

### [The API](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#4-api-or-system-interface)

### [Data Flow](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#optional-data-flow-5-minutes)

## [High-Level Design](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#high-level-design-10-15-minutes-1)

### 1) Users should be able to schedule jobs to be executed immediately, at a future date, or on a recurring schedule

### 2) Users should be able monitor the status of their jobs.

## [Potential Deep Dives](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#deep-dives-10-minutes-1)

### 1) How can we ensure the system executes jobs within 2s of their scheduled time?

### 2) How can we ensure the system is scalable to support up to 10k jobs per second?

### 3) How can we ensure at-least-once execution of jobs?

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

1) Users should be able to schedule jobs to be executed immediately, at a future date, or on a recurring schedule

](#1-users-should-be-able-to-schedule-jobs-to-be-executed-immediately-at-a-future-date-or-on-a-recurring-schedule)[

2) Users should be able monitor the status of their jobs.

](#2-users-should-be-able-monitor-the-status-of-their-jobs)[

Potential Deep Dives

](#potential-deep-dives)[

1) How can we ensure the system executes jobs within 2s of their scheduled time?

](#1-how-can-we-ensure-the-system-executes-jobs-within-2s-of-their-scheduled-time)[

2) How can we ensure the system is scalable to support up to 10k jobs per second?

](#2-how-can-we-ensure-the-system-is-scalable-to-support-up-to-10k-jobs-per-second)[

3) How can we ensure at-least-once execution of jobs?

](#3-how-can-we-ensure-at-least-once-execution-of-jobs)[

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