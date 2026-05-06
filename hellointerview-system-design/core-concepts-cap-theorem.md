# CAP Theorem for System Design Interviews | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/core-concepts/cap-theorem

[

Limited Time Offer:Up to 20% off Hello Interview Premium

Up to 20% off Hello Interview Premium 🎉



](/premium)

Search

⌘K

[Pricing](/pricing)[Become a Coach](/become-an-expert)

Tutor

Get Premium

###### Core Concepts

# CAP Theorem

Master the fundamental tradeoffs between consistency and availability in distributed systems.

* * *

###### Watch Video Walkthrough

Watch the author walk through the problem step-by-step

###### Watch Video Walkthrough

Watch the author walk through the problem step-by-step

Watch Now

CAP theorem is routinely a point of confusion for candidates, but it is foundational to how you approach your design in an interview.

We'll explain what it is, how it works, and the practical tradeoffs you need to make when considering CAP theorem during the non-functional requirements phase of a system design interview.

## What is CAP Theorem?

At its core, CAP theorem states that in a distributed system, you can only have two out of three of the following properties:

*   **Consistency**: All nodes see the same data at the same time. When a write is made to one node, all subsequent reads from any node will return that updated value.
*   **Availability**: Every request to a non-failing node receives a response, without the guarantee that it contains the most recent version of the data.
*   **Partition Tolerance**: The system continues to operate despite arbitrary message loss or failure of part of the system (i.e., network partitions between nodes).

Note that consistency in the context of the CAP theorem is quite different from the consistency guaranteed by ACID databases. Confusing, I know.

Here's the key insight that makes CAP theorem much simpler to reason about in interviews: In any distributed system, partition tolerance is a must. Network failures will happen, and your system needs to handle them.

This means that in practice, CAP theorem really boils down to a single choice: Do you prioritize consistency or availability when a network partition occurs?

Let's explore what this means through a practical example.

## Understanding CAP Theorem Through an Example

Imagine you're running a website with two servers - one in the USA and one in Europe. When a user updates their public profile (let's say their display name), here's what happens:

1.  User A connects to their closest server (USA) and updates their name
2.  This update is replicated to the server in Europe
3.  When User B in Europe views User A's profile, they see the updated name

Basic Replication

Everything works smoothly until we encounter a network partition - the connection between our USA and Europe servers goes down. Now we have a critical decision to make:

When User B tries to view User A's profile, should we:

*   Option A: Return an error because we can't guarantee the data is up-to-date (choosing consistency)
*   Option B: Show potentially stale data (choosing availability)

Network Partition

This is where CAP theorem becomes practical - we must choose between consistency and availability.

In the case, the answer is rather clear: we would rather show a user in Europe the old name of User A, rather than show an error. Seeing a stale name is better than seeing no name at all.

Let's look at some other real-world examples of this choice:

### When to Choose Consistency

Some systems absolutely require consistency, even at the cost of availability:

1.  **Ticket Booking Systems**: Imagine if User A booked seat 6A on a flight, but due to a network partition, User B sees the seat as available and books it too. You'd have two people showing up for the same seat!
2.  **E-commerce Inventory**: If Amazon has one toothbrush left and the system shows it as available to multiple users during a network partition, they could oversell their inventory.
3.  **Financial Systems**: Stock trading platforms need to show accurate, up-to-date order books. Showing stale data could lead to trades at incorrect prices.

### When to Choose Availability

The majority of systems can tolerate some inconsistency and should prioritize availability. In these cases, eventual consistency is fine. Meaning, the system will eventually become consistent, but it may take a few seconds or minutes.

1.  **Social Media**: If User A updates their profile picture, it's perfectly fine if User B sees the old picture for a few minutes.
2.  **Content Platforms (like Netflix)**: If someone updates a movie description, showing the old description temporarily to some users isn't catastrophic.
3.  **Review Sites (like Yelp)**: If a restaurant updates their hours, showing slightly outdated information briefly is better than showing no information at all.

The key question to ask yourself is: "Would it be catastrophic if users briefly saw inconsistent data?" If the answer is yes, choose consistency. If not, choose availability.

## CAP Theorem in System Design Interviews

Understanding CAP theorem matters because it should be one of the first things you discuss in a system design interview as it will have a meaningful impact on how you design your system.

In a system design interview, you typically begin by:

1.  Aligning on functional requirements (features)
2.  Defining non-functional requirements (system qualities)

When discussing non-functional requirements, CAP theorem should be your starting point. You need to ask the all important question: "Does this system need to prioritize consistency or availability?"

If you prioritize consistency, your design might include:

*   **Distributed Transactions**: Ensuring multiple data stores (like cache and database) remain in sync through two-phase commit protocols. This adds complexity but guarantees consistency across all nodes. This means users will likely experience higher latency as the system ensures data is consistent across all nodes.
*   **Single-Node Solutions**: Using a single database instance to avoid propagation issues entirely. While this limits scalability, it eliminates consistency challenges by having a single source of truth.
*   **Technology Choices**:
    *   Traditional RDBMSs ([PostgreSQL](https://www.hellointerview.com/learn/system-design/deep-dives/postgres), MySQL)
    *   Google Spanner
    *   [DynamoDB](https://www.hellointerview.com/learn/system-design/deep-dives/dynamodb) (in strong consistency mode)

On the other hand, if you prioritize availability, your design can include:

*   **Multiple Replicas**: Scaling to additional read replicas with asynchronous replication, allowing reads to be served from any replica even if it's slightly behind. This improves read performance and availability at the cost of potential staleness.
*   **Change Data Capture (CDC)**: Using CDC to track changes in the primary database and propagate them asynchronously to replicas, caches, and other systems. This allows the primary system to remain available while updates flow through the system eventually.
*   **Technology Choices**:
    *   [Cassandra](https://www.hellointerview.com/learn/system-design/deep-dives/cassandra)
    *   [DynamoDB](https://www.hellointerview.com/learn/system-design/deep-dives/dynamodb) (in multiple availability zone configuration)
    *   [Redis](https://www.hellointerview.com/learn/system-design/deep-dives/redis) clusters

Most modern distributed databases offer configuration options for both consistency and availability. The key is understanding which to choose for your use case.

## Advanced CAP Theorem Considerations

If you're a junior or mid-level candidate, the previous sections are sufficient for most interviews. The following section covers more advanced concepts that might be relevant for senior and staff-level discussions.

As systems grow in complexity, the choice between consistency and availability isn't always binary. Modern distributed systems often require nuanced approaches that vary by feature and use case. Let's explore these advanced considerations.

Real-world systems frequently need both availability and consistency - just for different features. Let's look at two examples:

#### Example 1: Ticketmaster

[Ticketmaster](https://www.hellointerview.com/learn/system-design/problem-breakdowns/ticketmaster) needs different consistency models for different features within the same system:

*   **Booking a seat at an event**: Requires strong consistency to prevent double-booking as we discussed in the previous section.
*   **Viewing event details**: Can prioritize availability (showing slightly outdated event descriptions is acceptable)

In an interview, you might say: "For this ticketing system, I'll prioritize consistency for booking transactions but optimize for availability when users are browsing and viewing events."

#### Example 2: Tinder

Similarly, [Tinder](https://www.hellointerview.com/learn/system-design/problem-breakdowns/tinder) has mixed requirements:

*   **Matching**: Needs consistency. If both users swipe right at about the same time, they should both see the match immediately.
*   **Viewing a users profile**: Can prioritize availability. Seeing a slightly outdated profile picture is acceptable if a user just updated their image.

In an interview, you might say: "For this dating app, I'll prioritize consistency for matching but optimize for availability when users are viewing profiles."

### Different Levels of Consistency

When discussing consistency in CAP theorem, people usually mean strong consistency - where all reads reflect the most recent write. However, understanding the spectrum of consistency models can help you make more nuanced design decisions:

**Strong Consistency**: All reads reflect the most recent write. This is the most expensive consistency model in terms of performance, but is necessary for systems that require absolute accuracy like bank account balances. This is what we have been discussing so far.

**Causal Consistency**: Related events appear in the same order to all users. This ensures logical ordering of dependent actions, such as ensuring comments on a post must appear after the post itself.

**Read-your-own-writes Consistency**: Users always see their own updates immediately, though other users might see older versions. This is commonly used in social media platforms where users expect to see their own profile updates right away.

**Eventual Consistency**: The system will become consistent over time but may temporarily have inconsistencies. This is the most relaxed form of consistency and is often used in systems like DNS where temporary inconsistencies are acceptable. This is the default behavior of most distributed databases and what we are implicitly choosing when we prioritize availability.

## Conclusion

CAP theorem is important. It sets the stage for how you approach your design in an interview and should not be overlooked.

But it doesn't need to be complicated. Just ask yourself: "Does every read need to read the most recent write?" If the answer is yes, you need to prioritize consistency. If the answer is no, you can prioritize availability.

###### Test Your Knowledge

Take a quick 15 question quiz to test what you've learned.

Start Quiz

Login to track your progress

[Next: Database Indexing](/learn/system-design/core-concepts/db-indexing)

How would you rate the quality of this article?

0.5 Stars1 Star1.5 Stars2 Stars2.5 Stars3 Stars3.5 Stars4 Stars4.5 Stars5 StarsEmpty

## Comments

(44)

Login to Join the Discussion

Your account is free and you can post anonymously if you choose.

​

Sort By

Popular

Sort By

![Hari Prasanna](https://lh3.googleusercontent.com/a/ACg8ocLOlh0dVn8ZUzYAU9x99ZoKhRlMceS7OdoWT2CXdgKOaNl7SOIO=s96-c)

Hari Prasanna

Top 5%

Top 5%

[• 8 months ago](#comment-cmeu7uvrk00doad08hm4f0ubz)

The basic definition of partition tolerance could have been a little more detailed. For those who've come to comments before searching about it. Partition tolerance refers to the functioning of a cluster even if there is a "partition" (communication break) between two nodes (both nodes are up, but can't communicate).

Show more

81

![vinay s](https://lh3.googleusercontent.com/a/ACg8ocLNDarOUjp4Ekz33oMrfHo-ZmXU22dTzC7FVVXP2dFwFKOyJmWa=s96-c)

vinay s

Top 10%

Top 10%

[• 1 year ago](#comment-cm9gxb7360306ad08a6qcpct8)

So I am trying to understand the difference in the way we understand consistency for "Event booking in ticketMaster" vs "2nd user getting matched in Tinder".

So this is my understanding for event booking in ticketMaster: If a user is booking a ticket or booked a ticket , then 2nd user should not be able to book the same event. Specific event ticket being referred to as resource and we should ensure that it modified by only one person and that modification should be applicable for all users after that.

When it comes to Tinder Matching, I feel its a bit different. I mean its a mutual sharing of data between 2 users via tinder platform. I am unable to see this through the eyes of "consistency" because if 2nd user swipes right and he/she unable to see that its exact match but later get a notification or chats section in both users are enabled to show user match, it is still okay..

So can anyone help me understand the "consistency" concept incase of Tinder matching!

I feel tinder matching example for consistency is a bit ambiguous or forced..

Show more

17

C

CooperativeRedAntelope278

Top 5%

Top 5%

[• 9 months ago](#comment-cmd0mt3mz0143ad09thjiq45o)

You are right, tinder matching is forced just for the sake of an example. Remember, we aren't designing real world systems here. We're just doing an interview. An interviewer might throw a wrench in your design just to see if you know what to do.

In the real world, tinder does not have strong consistency for matching, it's eventually consistent.

Show more

7

A

AvailableJadeCattle348

Top 5%

Top 5%

[• 9 months ago](#comment-cmdpdvoa7010yad0908puudmo)

I get that perspective but at the same time, couldn't it be argued that a better example should be there then? There's a lot of applications that he could talk about instead of potentially stretching it to make it about Tinder.

Show more

3

S

schebruch

Premium

Premium

[• 7 months ago](#comment-cmfoy9lvg03tc08adgbbx8j1v)

I think it's that if user A swipes right, but user B swipes right before the right swipe was updated for user A, then user B's client might think that user A swiped left and not match. This is not a good customer experience.

Show more

1

![Harshil Raval](https://lh3.googleusercontent.com/a/ACg8ocLwD_q-9xoC8tyQVA9gMgdYfHcUgfUQah2qWPjyRmbQ6DZv5iRR=s96-c)

Harshil Raval

[• 9 months ago](#comment-cmdo36kuu04hyad08monqs0pb)

Agree with this. In other words - if interviewer dictates non functional requirement that "matching requires to be shown immediately" then it's a clue for consistency.

Show more

1

F

FashionableAzureAlpaca705

[• 1 year ago](#comment-cm8ezb2mb01ud40wj94jiwj9i)

You mention "If you prioritize consistency, your design might include: Single-Node Solutions." Doesn't that take away from the partition tolerance part of CAP since if we are using a single node then our system is not partitioned/distributed?

Show more

12

![NDS](https://lh3.googleusercontent.com/a/ACg8ocLvQRhXDsFjcBm0dA3kf8oLgZtm7CwQKbXhef877DVo047pCqex=s96-c)

NDS

[• 1 year ago](#comment-cm9skrvzx00ovad08tjpkzk7p)

I believe by partition he referred to servers. and by single node he referred to the database.

Show more

5

A

AbstractAmberGopher993

Premium

Premium

[• 10 months ago](#comment-cmbvtq6ts03et08adzz7mlzx7)

Can you add some details about PACELC

Show more

10

![Arin](https://lh3.googleusercontent.com/a/ACg8ocJRoF_fweAsQTDPHatZiBz_s3nKORBDzli-MZFZ5J4MOTLt4Z4f=s96-c)

Arin

Premium

Premium

[• 7 months ago](#comment-cmfxb8w0g04qk07adogwr10n7)

The way I remember consistency vs availability is: If it's a money transaction -> Consistency. If there's no money transaction needed -> availability.

Show more

7

Show All Comments

###### The best mocks on the market.

Now up to 10% off

[Learn More](/mock/overview)

Reading Progress

On This Page

[

What is CAP Theorem?

](#what-is-cap-theorem)[

Understanding CAP Theorem Through an Example

](#understanding-cap-theorem-through-an-example)[

When to Choose Consistency

](#when-to-choose-consistency)[

When to Choose Availability

](#when-to-choose-availability)[

CAP Theorem in System Design Interviews

](#cap-theorem-in-system-design-interviews)[

Advanced CAP Theorem Considerations

](#advanced-cap-theorem-considerations)[

Different Levels of Consistency

](#different-levels-of-consistency)[

Conclusion

](#conclusion)

![CTA](/_next/image?url=https%3A%2F%2Ffiles.hellointerview.com%2Fbuild-assets%2FPRODUCTION%2F_next%2Fstatic%2Fmedia%2Fcta.0pmyxoc9fn9ja.png%3Fdpl%3Da5eaff0b0b1e4190375aeda4ce53625448283294&w=3840&q=75)

#### Schedule a mock interview

Meet with a FAANG senior+ engineer or manager and learn exactly what it takes to get the job.

[Schedule a Mock Interview](/mock/schedule?focus=true)

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