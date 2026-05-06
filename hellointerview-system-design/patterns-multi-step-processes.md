# Multi-step Processes Pattern for System Design Interviews | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/patterns/multi-step-processes

[

Limited Time Offer:Up to 20% off Hello Interview Premium

Up to 20% off Hello Interview Premium 🎉



](/premium)

Search

⌘K

[Pricing](/pricing)[Become a Coach](/become-an-expert)

Tutor

Get Premium

###### Patterns

# Multi-step Processes

Learn about multi-step processes and how to handle them in your system design with sagas, workflow systems, and durable execution.

Multi-step Processes

* * *

⚙️ Real production systems must survive failures, retries, and long-running operations spanning hours or days. Often they take the form of multi-step processes or sagas which involve the coordination of multiple services and systems. This is a continual source of operational and design challenges for engineers, with a variety of different solutions.

## The Problem

Many real-world systems end up coordinating dozens or even hundreds of different services and systems in order to complete a user's request, but building reliable multi-step processes in distributed systems is startlingly hard. While clean systems like databases often get to deal with a single "write" or "read", real applications often need to talk to dozens of (flaky) services to do the user's bidding, and doing this quickly and reliably is a common challenge. Jimmy Bogard has a great talk about this titled ["Six Little Lines of Fail"](https://www.youtube.com/watch?v=VvUdvte1V3s) with the premise that distributed systems make even a simple sequence of steps like this surprisingly hard (if you haven't had to deal with systems like this before, it's a great watch).

Consider an e-commerce order fulfillment workflow: charge payment, reserve inventory, create shipping label, wait for a human to pick up the item, send confirmation email, and wait for pickup. Each step involves calling different services or waiting on humans, any of which might fail or timeout. Some steps require us to call out to external systems (like a payment gateway) and wait for them to complete. During the orchestration, your server might crash or be deployed to. And maybe you want to make a change to the ordering or nature of steps! The messy complexity of business needs and real-world infrastructure quickly breaks down our otherwise pure flow chart of steps.

Order Fulfillment Nightmare

There are, of course, patches we can organically make to processes like this. We can fortify each service to handle failures, add compensating actions (like refunds if we can't find the inventory) in every place, use delay queues and hooks to handle waits and human tasks, but overall each of these things makes the system more complex and brittle. We interweave system-level concerns (crashes, retries, failures) with business-level concerns (what happens if we can't find the item?). Not a great design!

Workflow systems and durable execution are the solutions to this problem, and they show up in many system design interviews, particularly when there is a lot of state and a lot of failure handling. Interviewers love to ask questions about this because it dominates the oncall rotation for many production teams and gets at the heart of what makes many distributed systems hard to build well. In this article, we'll cover what they are, how they work, and how to use them in your interviews.

###### Problem Breakdowns with Multi-step Processes Pattern

[Uber](/learn/system-design/problem-breakdowns/uber#multi-step-processes)

[Payment System](/learn/system-design/problem-breakdowns/payment-system#multi-step-processes)

## Solutions

### Single Server Orchestration

### Event Sourcing

### Workflows

#### Durable Execution Engines

#### Managed Workflow Systems

#### Implementations

## When to Use in Interviews

### Common interview scenarios

### When NOT to use it in an interview

## Common Deep Dives

### "How will you handle updates to the workflow?"

#### Workflow Versioning

#### Workflow Migrations

### "How do we keep the workflow state size in check?"

### "How do we deal with external events?"

### "How can we ensure X step runs exactly once?"

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

The Problem

](#the-problem)[

Solutions

](#solutions)[

Single Server Orchestration

](#single-server-orchestration)[

Event Sourcing

](#event-sourcing)[

Workflows

](#workflows)[

When to Use in Interviews

](#when-to-use-in-interviews)[

Common interview scenarios

](#common-interview-scenarios)[

When NOT to use it in an interview

](#when-not-to-use-it-in-an-interview)[

Common Deep Dives

](#common-deep-dives)[

"How will you handle updates to the workflow?"

](#how-will-you-handle-updates-to-the-workflow)[

"How do we keep the workflow state size in check?"

](#how-do-we-keep-the-workflow-state-size-in-check)[

"How do we deal with external events?"

](#how-do-we-deal-with-external-events)[

"How can we ensure X step runs exactly once?"

](#how-can-we-ensure-x-step-runs-exactly-once)[

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