# Dealing with Contention Pattern for System Design Interviews | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/patterns/dealing-with-contention

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

# Dealing with Contention

Learn about how to deal with high contention in your system design interview.

Dealing with Contention

* * *

🔒 **Contention** occurs when multiple processes compete for the same resource simultaneously. This could be booking the last concert ticket, bidding on an auction item, or any similar scenario. Without proper handling, you get race conditions, double-bookings, and inconsistent state. This pattern walks you through solutions from simple database transactions to more complex distributed coordination, showing when optimistic concurrency beats pessimistic locking and how to scale beyond single-node constraints.

## The Problem

Consider buying concert tickets online. There's 1 seat left for The Weeknd concert. Alice and Bob both want this last seat and click "Buy Now" at exactly the same moment. Without proper coordination, here's what happens:

1.  Alice's request reads: "1 seat available"
2.  Bob's request reads: "1 seat available" (both reads happen before either write)
3.  Alice's request checks if 1 ≥ 1 (yes, there is a seat available), proceeds to payment
4.  Bob's request checks if 1 ≥ 1 (yes, there is a seat available), proceeds to payment
5.  Alice gets charged $500, seat count decremented to 0
6.  Bob gets charged $500, seat count decremented to -1

Both Alice and Bob receive confirmation emails with the exact same seat number. They both show up to the concert thinking they own Row 5, Seat 12. One of them is getting kicked out, and the venue has to issue a refund while dealing with two very angry customers.

Race Condition Timeline

## The Solution

### Single Node Solutions

#### Atomicity

#### Pessimistic Locking

#### Isolation Levels

#### Optimistic Concurrency Control

### Multiple Nodes

#### Two-Phase Commit (2PC)

#### Distributed Locks

#### Saga Pattern

## Choosing the Right Approach

## When to Use in Interviews

### Recognition Signals

### Common Interview Scenarios

### When NOT to overcomplicate

## Common Deep Dives

### "How do you prevent deadlocks with pessimistic locking?"

### "What if your coordinator service crashes during a distributed transaction?"

### "How do you handle the ABA problem with optimistic concurrency?"

### "What about performance when everyone wants the same resource?"

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

The Solution

](#the-solution)[

Single Node Solutions

](#single-node-solutions)[

Multiple Nodes

](#multiple-nodes)[

Choosing the Right Approach

](#choosing-the-right-approach)[

When to Use in Interviews

](#when-to-use-in-interviews)[

Recognition Signals

](#recognition-signals)[

Common Interview Scenarios

](#common-interview-scenarios)[

When NOT to overcomplicate

](#when-not-to-overcomplicate)[

Common Deep Dives

](#common-deep-dives)[

"How do you prevent deadlocks with pessimistic locking?"

](#how-do-you-prevent-deadlocks-with-pessimistic-locking)[

"What if your coordinator service crashes during a distributed transaction?"

](#what-if-your-coordinator-service-crashes-during-a-distributed-transaction)[

"How do you handle the ABA problem with optimistic concurrency?"

](#how-do-you-handle-the-aba-problem-with-optimistic-concurrency)[

"What about performance when everyone wants the same resource?"

](#what-about-performance-when-everyone-wants-the-same-resource)[

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