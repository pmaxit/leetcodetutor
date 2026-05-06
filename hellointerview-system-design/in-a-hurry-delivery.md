# System Design Delivery Framework | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery

[

Limited Time Offer:Up to 20% off Hello Interview Premium

Up to 20% off Hello Interview Premium 🎉



](/premium)

Search

⌘K

[Pricing](/pricing)[Become a Coach](/become-an-expert)

Tutor

Get Premium

###### System Design in a Hurry

# Delivery Framework

The best way to structure your system design interviews to structure your thoughts and focus on the most important aspects, built by FAANG managers and staff engineers.

* * *

The easiest way to sabotage your chances of getting an offer in your system design interview is to fail to deliver a working system. This is the most common reason that mid-level candidates fail these interviews and it often manifests as the opaque "time management". This issue isn't (always) that you need to work twice as fast — many times you just need to focus on the right things.

Overall Structure

Our delivery framework is a sequence of steps and timings we recommend for your interview. By structuring your interview in this way, you'll stay focused on the bits that are most important to your interviewer. An added benefit is that you'll have a clear path to fall back if you're overwhelmed. Many candidates are (understandably!) nervous in their interview. It's easy to get lost if you aren't building up a solution in a linear way.

While a firm structure to your approach is important and your interviewer is not trained specifically to assess you on your delivery (often this gets bucketed into "communication"), in practice we've seen many candidates that perform significantly better by following a structure which both keeps them from getting stuck and ensures they deliver a working system.

Here's the framework!

Recommended system design interview structure

## Requirements (~5 minutes)

The goal of the requirements section is to get a clear understanding of the system that you are being asked to design. To do this, we suggest you break your requirements into two sections.

### 1) Functional Requirements

Functional requirements are your "Users/Clients should be able to..." statements. These are the core features of your system and should be the first thing you discuss with your interviewer. Oftentimes this is a back and forth with your interviewer. Ask targeted questions as if you were talking to a client, customer, or product manager ("does the system need to do X?", "what would happen if Y?") to arrive at a prioritized list of core features.

For example, if you were designing a system like Twitter, you might have the following functional requirements:

*   Users should be able to post tweets
*   Users should be able to follow other users
*   Users should be able to see tweets from users they follow

A cache meanwhile might have requirements like:

*   Clients should be able to insert items
*   Clients should be able to set expirations
*   Clients should be able to read items

Keep your requirements targeted! The main objective in the remaining part of the interview is to develop a system that meets the requirements you've identified -- so it's crucial to be strategic in your prioritization. Many of these systems have hundreds of features, but it's your job to identify and prioritize the top 3. Having a long list of requirements will hurt you more than it will help you and many top FAANGs directly evaluate you on your ability to focus on what matters.

### 2) Non-functional Requirements

Non-functional requirements are statements about the system qualities that are important to your users. These can be phrased as "The system should be able to..." or "The system should be..." statements.

For example, if you were designing a system like Twitter, you might have the following non-functional requirements:

*   The system should be highly available, prioritizing availability over consistency
*   The system should be able to scale to support 100M+ DAU (Daily Active Users)
*   The system should be low latency, rendering feeds in under 200ms

It's important that non-functional requirements are put in the context of the system and, where possible, are quantified. For example, "the system should be low latency" is obvious and not very meaningful—nearly all systems should be low latency. "The system should have low latency search, < 500ms," is much more useful as it identifies the part of the system that most needs to be low latency and provides a target.

Coming up with non-functional requirements can be challenging, especially if you're not familiar with the domain. Here is a checklist of things to consider that might help you identify the most important non-functional requirements for your system. You'll want to identify the top 3-5 that are most relevant to your system.

1.  **CAP Theorem**: Should your system prioritize consistency or availability? Note, partition tolerance is a given in distributed systems.
2.  **Environment Constraints**: Are there any constraints on the environment in which your system will run? For example, are you running on a mobile device with limited battery life? Running on devices with limited memory or limited bandwidth (e.g. streaming video on 3G)?
3.  **Scalability**: All systems need to scale, but does this system have unique scaling requirements? For example, does it have bursty traffic at a specific time of day? Are there events, like holidays, that will cause a significant increase in traffic? Also consider the read vs write ratio here. Does your system need to scale reads or writes more?
4.  **Latency**: How quickly does the system need to respond to user requests? Specifically consider any requests that require meaningful computation. For example, low latency search when designing Yelp.
5.  **Durability**: How important is it that the data in your system is not lost? For example, a social network might be able to tolerate some data loss, but a banking system cannot.
6.  **Security**: How secure does the system need to be? Consider data protection, access control, and compliance with regulations.
7.  **Fault Tolerance**: How well does the system need to handle failures? Consider redundancy, failover, and recovery mechanisms.
8.  **Compliance**: Are there legal or regulatory requirements the system needs to meet? Consider industry standards, data protection laws, and other regulations.

### 3) Capacity Estimation

Many guides you've read will suggest doing back-of-the-envelope calculations at this stage. We believe this is _often_ unnecessary. Instead, perform calculations only if they will directly influence your design. In most scenarios, you're dealing with a large, distributed system – and it's reasonable to assume as much. Many candidates will calculate storage, DAU, and QPS, only to conclude, "ok, so it's a lot. Got it." As interviewers, we gain nothing from this except that you can perform basic arithmetic.

Our suggestion is to explain to the interviewer that you would like to skip on estimations upfront and that you will do math while designing when/if necessary. When would it be necessary? Imagine you are designing a TopK system for trending topics in FB posts. You would want to estimate the number of topics you would expect to see, as this will influence whether you can use a single instance of a data structure like a min-heap or if you need to shard it across multiple instances, which will have a big impact on your design.

Regardless of how you end up using it in the interview, [learning to estimate relevant quantities quickly](/blog/mastering-estimation) will help you quickly reason through design trade-offs in your design. Don't worry if you're not good at mental arithmetic under pressure, most people aren't.

## Core Entities (~2 minutes)

Next you should take a moment to identify and list the core entities of your system. This helps you to define terms, understand the data central to your design, and gives you a foundation to build on. These are the core entities that your API will exchange and that your system will persist in a Data Model. In the actual interview, this is as simple as jotting down a bulleted list and explaining this is your first draft to the interviewer.

Why not list the entire data model at this point? Because you don't know what you don't know. As you design your system, you'll discover new entities and relationships that you didn't anticipate. By starting with a small list, you can quickly iterate and add to it as you go. Once you get into the high level design and have a clearer sense of exactly what state needs to update upon each request you can start to build out the list of relevant columns/fields for each entity.

For our Twitter example, our core entities are rather simple:

*   User
*   Tweet
*   Follow

A couple useful questions to ask yourself to help identify core entities:

*   Who are the actors in the system? Are they overlapping?
*   What are the nouns or resources necessary to satisfy the functional requirements?

Aim to choose good names for your entities. While most problems are small enough that you could probably sub in foo and bar for any entity in your system, some interviewers use this as an opportunity to see whether you're any good at one of the [hardest problems in computer science](https://www.martinfowler.com/bliki/TwoHardThings.html).

## API or System Interface (~5 minutes)

Before you get into the high-level design, you'll want to define the contract between your system and its users. Oftentimes, especially for full product style interviews, this maps directly to the functional requirements you've already identified (but not always!). You will use this contract to guide your high-level design and to ensure that you're meeting the requirements you've identified.

You have a quick decision to make here -- which API protocol should you use?

**REST (Representational State Transfer)**: Uses HTTP verbs (GET, POST, PUT, DELETE) to perform CRUD operations on resources. This should be your default choice for most interviews.

**GraphQL**: Allows clients to specify exactly what data they want to receive, avoiding over-fetching and under-fetching. Choose this when you have diverse clients with different data needs.

**RPC (Remote Procedure Call)**: Action-oriented protocol (like gRPC) that's faster than REST for service-to-service communication. Use for internal APIs when performance is critical.

Don't overthink this. Default to REST unless you have a specific reason not to. For real-time features, you'll also need WebSockets or Server-Sent Events, but design your core API first.

For Twitter, we would choose REST and design our endpoints using our core entities as resources. Resources should be plural nouns that represent things in your system:

```
POST /v1/tweets
body: {
  "text": string
}

GET /v1/tweets/{tweetId} -> Tweet

POST /v1/follows
body: {
  "followee_id": string
}

GET /v1/feed -> Tweet[]
```

Notice how we use plural resource names (tweets, not tweet). The current user is derived from the authentication token in the request header, not from request bodies or path parameters.

Never rely on sensitive information like user IDs from request bodies when they should come from authentication. Always authenticate requests and derive the current user from the auth token, not from user input.

## \[Optional\] Data Flow (~5 minutes)

For some backend systems, especially data-processing systems, it can be helpful to describe the high level sequence of actions or processes that the system performs on the inputs to produce the desired outputs. If your system doesn't involve a long sequence of actions, skip this!

We usually define the data flow via a simple list. You'll use this flow to inform your high-level design in the next section.

For a web crawler, this might look like:

1.  Fetch seed URLs
2.  Parse HTML
3.  Extract URLs
4.  Store data
5.  Repeat

## High Level Design (~10-15 minutes)

Now that you have a clear understanding of the requirements, entities, and API of your system, you can start to design the high-level architecture. This consists of drawing boxes and arrows to represent the different components of your system and how they interact. Components are basic building blocks like servers, databases, caches, etc. This can be done either in person on a whiteboard or virtually using whiteboarding software like [Excalidraw](https://excalidraw.com/). The [Key Technologies](/learn/system-design/in-a-hurry/key-technologies) section will give you a good sense of the most common components you'll need to know.

Ask your recruiter what software you'll be using for your interview and practice with it ahead of time. You don't want to be fumbling with the software during your interview.

Don't over think this! Your primary goal is to design an architecture that satisfies the API you've designed and, thus, the requirements you've identified. In most cases, you can even go one-by-one through your API endpoints and build up your design sequentially to satisfy each one.

Stay focused! It's incredibly common for candidates to start layering on complexity too early, resulting in them never arriving at a complete solution. Focus on a relatively simple design that meets the core functional requirements, and then layer on complexity to satisfy the non-functional requirements in your deep dives section. It's natural to identify areas where you can add complexity, like caches or message queues, while in the high-level design. We encourage you to note these areas with a simple verbal callout and written note, and then move on.

As you're drawing your design, you should be talking through your thought process with your interviewer. Be explicit about how data flows through the system and what state (either in databases, caches, message queues, etc.) changes with each request, starting from API requests and ending with the response. When your request reaches your database or persistence layer, it's a great time to start documenting the relevant columns/fields for each entity. You can do this directly next to your database visually. This helps keep it close to the relevant components and makes it easy to evolve as you iterate on your design. No need to worry too much about types here, your interviewer can infer and they'll only slow you down.

Don't waste your time documenting every column/field in your schema. For example, your interviewer knows that a User table has a name, email, and password hash so you don't need to write these down. Instead, focus on the columns/fields that are particularly relevant to your design.

For our simple Twitter example, here is how you might build up your design, one endpoint at a time:

High Level Design (~10-15 minutes)

## Deep Dives (~10 minutes)

Astute readers probably noticed that our simple, high-level design of Twitter is going to be woefully inefficient when it comes to fetching users' feeds. No problem! That's exactly the sort of thing you'll iterate on in the deep dives section. Now that you have a high-level design in place you're going to use the remaining 10 or so minutes of the interview to harden your design by:

*   Ensuring it meets all of your non-functional requirements
*   Addressing edge cases
*   Identifying and addressing issues and bottlenecks
*   Improving the design based on probes from your interviewer.

The degree to which you're proactive in leading deep dives is a function of your seniority. More junior candidates can expect the interviewer to jump in here and point out places where the design could be improved. More senior candidates should be able to identify these places themselves and lead the discussion.

So for example, one of our non-functional requirements for Twitter was that our system needs to scale to >100M DAU. We could then lead a discussion oriented around horizontal scaling, the introduction of caches, and database sharding -- updating our design as we go. Another was that feeds need to be fetched with low latency. In the case of Twitter, this is actually the most interesting problem. We'd lead a discussion about fanout-on-read vs fanout-on-write and the use of caches.

A common mistake candidates make is that they try to talk over their interviewer here. There is a lot to talk about, sure, and for senior candidates being proactive is important, however, it's a balance. Make sure you give your interviewer room to ask questions and probe your design. Chances are they have specific signals they want to get from you and you're going to miss it if you're too busy talking. Plus, you'll hurt your evaluation on communication and collaboration.

Login to track your progress

[Next: Core Concepts](/learn/system-design/in-a-hurry/core-concepts)

How would you rate the quality of this article?

0.5 Stars1 Star1.5 Stars2 Stars2.5 Stars3 Stars3.5 Stars4 Stars4.5 Stars5 StarsEmpty

## Comments

(224)

Login to Join the Discussion

Your account is free and you can post anonymously if you choose.

​

Sort By

Popular

Sort By

R

RivalCrimsonHedgehog225

Top 1%

Top 1%

[• 8 months ago](#comment-cmecybms200epad090adf9z42)

I had a hard time remembering all the criteria for nonfunctional requirements when doing practice problems, so I came up with this acronym. Hope it helps! Pilots use lots of acronyms, which is where the idea came from!

FCC + SLEDS: F ault Tolerance C AP C ompliance

S calability L atency E nvironment D urability S ecurity

Show more

333

![shobhit mishra](https://lh3.googleusercontent.com/a/ACg8ocKKu_05psPPza54wwI-1lpWFMgP0t75nty4f26x5q6xoD3lgfZl=s96-c)

shobhit mishra

Top 5%

Top 5%

[• 6 months ago](#comment-cmgjr643v00tp09adjrvvckrx)

Here is one by ChatGPT “Furry Cats Climb Steep Ledges Every Day Securely.”

Furry → Fault Tolerance

Cats → CAP

Climb → Compliance

Steep → Scalability

Ledges → Latency

Every → Environment

Day → Durability

Securely → Security

Show more

70

![AJ7](https://lh3.googleusercontent.com/a/ACg8ocK_Zs0RQsjbEzN60O7V6byEEbp8qFB1uPnca3CAvhzy3LNu8g=s96-c)

AJ7

Top 1%

Top 1%

[• 6 months ago](#comment-cmgwrwexd00tk08adb50xtxzr)

This one is even more easy to memorize.

"Cats Eat Sweet Lemons, Drinking Sugar-Free Coffee"

C – CAP Theorem E – Environment S – Scalability L – Latency D – Durability S – Security F – Fault Tolerance C – Compliance

Show more

155

S

SleepyScarletCrocodile649

Top 1%

Top 1%

[• 4 months ago](#comment-cmjjzoiq8004e07ad589wd137)

"SCALE For Cloud DesignS"

S- Scalability CA - CAP Theorem L - Latency E - Environment Constraints. F - Fault Tolerance C - Compliance D - Durability S - Security

Show more

142

L

LowMagentaClownfish675

Premium

Premium

[• 4 months ago](#comment-cmjow4y68009108adhijekbrg)

I like how the acronyms is tied to the context :)

Show more

10

![itsmesav](https://lh3.googleusercontent.com/a/ACg8ocK2ZygOtE6QSwf5OORdyzOSU7NQZa-cltSkfJ7kly8FoQbmBw=s96-c)

itsmesav

Premium

Premium

[• 4 months ago](#comment-cmjvrjj95016207adztb0y7dt)

+1 to this.

Show more

2

M

MammothApricotBarracuda750

Top 5%

Top 5%

[• 4 months ago](#comment-cmj0k46w901qv08ad14h6x7t3)

This is from Gemini.  
**C**lean **L**ogic **S**aves **D**ata **F**rom **E**very **C**omplex **S**ystem

Show more

44

![Coding Maniac](https://lh3.googleusercontent.com/a/ACg8ocItKwcnOcgMMpMWT-I62ZXzs8QI3aFGDlgo-rYrp8CjqjMfvA=s96-c)

Coding Maniac

Premium

Premium

[• 3 months ago](#comment-cmku894wz13n208adnfgrj7is)

I love this one! Thanks I'll use this!!

Show more

0

![Deepak Gupta](https://lh3.googleusercontent.com/a/ACg8ocLud_6n-j4h0d2vxnvHUafaU_UGw1qMuQvZ_trvqt9MXisIG2N5Ng=s96-c)

Deepak Gupta

[• 6 months ago](#comment-cmgr0zt0u003708adt6jiryey)

I this is this is more easy "C-CDEF-SS"

Show more

9

![Sagar Mishra](https://lh3.googleusercontent.com/a/ACg8ocIajSR0rYkwzxE4v91JU0W-a8DC5_4yaM5PPJXLXCQqQ6qzdwk=s96-c)

Sagar Mishra

Premium

Premium

[• 6 months ago](#comment-cmhkmf3l8053108adn85es4hm)

"L" for Latency is missing here, make it SSL (like the certificate).

Show more

4

![Stefan Mai](https://hellointerview-files.s3.us-west-2.amazonaws.com/public-media/stefan-headshot_100.png)

Stefan Mai

Admin

Admin

[• 8 months ago](#comment-cmed0a1wn0118ad08s45ttjck)

I like this! Sometimes the most interesting non-functional requirements don't map to these. But it's amazing to have good coverage, which other acronyms did you try?

Show more

7

E

ElectronicFuchsiaCoral964

Top 10%

Top 10%

[• 5 months ago](#comment-cmidfw3ph00j709ad8msf727h)

SCALE-FDC is my fav.

Scalability CAP Latency Environment Fault Durability Compliance.

Show more

32

![Praful Prasad](https://lh3.googleusercontent.com/a/ACg8ocKf703nhKYLdOZKCHuhLevIL5S7rxVYaFZD6jIAh0jAszug9DqICQ=s96-c)

Praful Prasad

[• 4 months ago](#comment-cmj976pcg02pl08adveye3ane)

I've come up with FLECCSSD and somehow I am able to remember it still so works for me for now

Show more

1

T

TenseIvoryTern492

Premium

Premium

[• 8 months ago](#comment-cmeqbxvo2057dad07ibpq4cun)

That's useful, thank you.

Show more

0

![Michael Shao](https://lh3.googleusercontent.com/a/ACg8ocLBGcMSvuc6h5dmesYs2wZC_RZK0lfz7exQl4d1YwcUzeYhSPjgdg=s96-c)

Michael Shao

Top 1%

Top 1%

[• 1 year ago](#comment-cm78ryyus030w4nd58fbgna56)

Would also highly recommend adding "metrics" and "monitoring" into the "deep dives" discussion. Too often I see candidates assume their entire design just "works", but never walks me through HOW they would know it works, and WHAT they would do to ensure that they understood or could validate where performance bottlenecks existed.

Show more

186

![Pusic](https://lh3.googleusercontent.com/a/ACg8ocI9IwYJrPkR2BFHMGb4KDB2uQJhX4-reD1haz4FRRqOWh2C2Pc=s96-c)

Pusic

Top 5%

Top 5%

[• 6 months ago](#comment-cmh3a7igq03il08adq65jhdfw)

I have a question. I’ve been giving system design interviews recently, and sometimes the focus shifts partway through the discussion based on the interviewer’s interest.

For example, if the problem is to design WhatsApp, once I reach the high-level design (HLD) stage and start drawing the overall architecture, the interviewer says, “Let’s focus on the one-to-one chat flow.” From there, the discussion often goes deeper into Kafka internals : how partitions are defined, how to handle users going offline and coming back online, how to scale Kafka, and so on.

As a result, the entire interview time ends up being spent on that one deep dive, and I often feel I didn’t get a chance to cover the full set of functional requirements or complete the overall HLD.

I sometimes feel I should politely tell the interviewer, “Let me first complete the functional requirements, and then we can dive deeper,” but I’m hesitant to do so because I’m afraid it might create a negative impression.

Do you have any suggestions on how to handle this situation effectively?

Show more

39

![VANDANA NAIR](https://lh3.googleusercontent.com/a/ACg8ocJxq5MEByEeZTylGx_OhQMRw9rjoaSVrPVECNxnGlC-7_p8UQ=s96-c)

VANDANA NAIR

Premium

Premium

[• 4 months ago](#comment-cmj9iy6nv06kp08adu66eeei9)

+1 on this question.

Show more

2

MM

Mr. M

[• 20 days ago](#comment-cmnyyxeov16tn07adritx2h89)

From my experience as an interviewer, your main goal in an interview is to convince the interviewer that you can design; finishing the design is secondary. The interviewer’s job is to assess the candidate’s depth and breadth of knowledge, often steering the discussion as needed. They usually recommend focusing on a single use case (like one-on-one chat) if the candidate starts jumping between scenarios or going off-track. They may also dive deeper into specifics (such as Kafka partitions) to gauge technical depth.

In short, aim to return to and complete the system design, but only after satisfying the interviewer’s questions.

Show more

1

![Anton Ushakov](https://lh3.googleusercontent.com/a/ACg8ocI81pWSMOXkQ-lhHDlxCnW3dqkFSlwiIYr3yj-NTdgVNNPfXQ=s96-c)

Anton Ushakov

Premium

Premium

[• 2 months ago](#comment-cmlwfx6000cf008adak09h9af)

the same here. Recently I was asked to design the Instagram, after I have dropped a few boxes, and started describing an upload/processing flow, the interviewer turned it to a deep dive and we were talking about this flow till the very end. my commentService box remained orphan. and this way went almost all my interviews. Never have I been let draw a full diagram (( For upcoming interview I am thinking to interrupt the interviewer's deep dive if see that only 5 mins left, and walk thought entire flow explaining how we scale, partition, and fail.

Show more

1

![Aditya Maliyan](https://lh3.googleusercontent.com/a/ACg8ocJGJvvILhMR2HMtjRqU6BnZEGpkOrZAVYo1qUlowjZLcd1aXw=s96-c)

Aditya Maliyan

Premium

Premium

[• 2 months ago](#comment-cmm5h7zb700nh07ad8hhlo9s6)

what was the outcome? :\\

Show more

1

![ravi bansal](https://lh3.googleusercontent.com/a/ACg8ocL7LpaS7n_MuXK6ch56iKB-sHP1eKFvf20jJQJFy1BqaeI=s96-c)

ravi bansal

Top 10%

Top 10%

[• 2 years ago](#comment-clv2wy1cu001c73piq80yb8pb)

when we agree on non functional requirements with some metrics for example , "the search should return in 100ms" , how do we justify that our final design is going to actually meet latency requirement ?

Show more

38

![Stefan Mai](https://hellointerview-files.s3.us-west-2.amazonaws.com/public-media/stefan-headshot_100.png)

Stefan Mai

Admin

Admin

[• 2 years ago](#comment-clv2x1dky001e73piqzokjouo)

That's part of the art! Where you do insert some estimates it's intended to show you've worked on systems like this in the past and have a general idea of how they perform. Some thoughts on this topic here: [https://www.hellointerview.com/blog/mastering-estimation](https://www.hellointerview.com/blog/mastering-estimation) and here [https://www.hellointerview.com/learn/system-design/deep-dives/numbers-to-know](https://www.hellointerview.com/learn/system-design/deep-dives/numbers-to-know)

Generally speaking, your cache will probably return in single digit ms, a relational database in 30-50ms (for simple queries), a web server in 10-20ms (for simple requests) - so if you're not doing heavy processing you're probably inside that 100ms window.

Show more

101

W

WillingOliveSwordfish412

Premium

Premium

[• 1 year ago](#comment-cm7ycoplq022ktvyjq3ymffld)

I have to read the estimation guide but these number are additive right? For e.g., if I have client <-> lb <-> ws <-> my\_service <-> db. Then, I have to add the round trip time of individual component and over the wire latencies.

Show more

5

![Idk 123](https://lh3.googleusercontent.com/a/ACg8ocI40eE3SxyARIg52WITX0_AMI5YFbiAbYIms5env_iMoy0OJmQ=s96-c)

Idk 123

[• 7 months ago](#comment-cmfb9br6n05bt07adjsgcaxnx)

Yes, as they are sequential it must be additive, that is the reason he mentioned under ~100 ms estimate.

Show more

1

C

CapitalistBeigeSwallow979

Premium

Premium

[• 1 year ago](#comment-cm4a0lcg6006vk9acnnu9dwcs)

I recently tried this and after I got through the core entities the interviewer asked “what database would you use” this of course threw me off. He wouldn’t let me cover APIs or even high level design…every time I would add a box he would want to go deep, I kept insisting that I’d like to get end to end covered first and happy to dive into the interesting bits but he wouldn’t have it. Despite asking me to drive he wouldn’t allow it and I basically got nothing done and of course he failed me. Was this just awful luck/bad interviewer? Could this have been salvaged? Thinking about this it seems to be more the norm and would love to discuss some potential strategies.

Show more

17

![Kaustav Saha](https://lh3.googleusercontent.com/a/ACg8ocIvxQiqNHRph3Xi2UVdbM1WcOuMLxBaJaOAhRPZJ_5auqb_0aCT=s96-c)

Kaustav Saha

Top 10%

Top 10%

[• 6 months ago](#comment-cmgihgilk01cz08adzfgny0jh)

I think a fair response in such cases is to give out either a neutral or an educated guess, something like "I haven't actually thought about the choice yet, apart from the fact that I would definitely need a persistent store that would store structured/unstructured/key-value (choose depending on the use case) data. May be I would be better able to dive deeper into this choice when I have a more holistic high-level view of the entire system. Let me note this down as this definitely is a critical part of this whole architecture".

Show more

35

W

WeeOrangeLeopon734

[• 1 year ago](#comment-cm76huij303cbalw23f2znrpn)

My suggestion would be to not contradict the interviewer and to answer direct questions when they are asked, even when they are doing a poor job themselves.

It sounds like you would have needed to have been extremely flexible and pin-ponged between satisfying the interviewer's arbitrary rubric and recovering your high-level train of thought to get a passing mark.

Show more

19

Show All Comments

###### The best mocks on the market.

Now up to 10% off

[Learn More](/mock/overview)

Reading Progress

On This Page

[

Requirements (~5 minutes)

](#requirements-5-minutes)[

1) Functional Requirements

](#1-functional-requirements)[

2) Non-functional Requirements

](#2-non-functional-requirements)[

3) Capacity Estimation

](#3-capacity-estimation)[

Core Entities (~2 minutes)

](#core-entities-2-minutes)[

API or System Interface (~5 minutes)

](#api-or-system-interface-5-minutes)[

\[Optional\] Data Flow (~5 minutes)

](#optional-data-flow-5-minutes)[

High Level Design (~10-15 minutes)

](#high-level-design-10-15-minutes)[

Deep Dives (~10 minutes)

](#deep-dives-10-minutes)

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