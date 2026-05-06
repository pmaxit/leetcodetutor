# Design a Local Delivery Service like Gopuff | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/problem-breakdowns/gopuff

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

# Local Delivery Service

Scaling Reads

By[Stefan Mai](https://www.linkedin.com/in/stefanmai/)·Published Jan 7, 2024·

easy

* * *

###### Try This Problem Yourself

Practice with guided hints and real-time feedback

Start Practice

## Understanding the Problem

**‍💨 What is [Gopuff](https://www.gopuff.com)?** Gopuff delivers goods typically found in a convenience store via rapid delivery and 500+ micro distribution centers (DCs).

### [Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#1-functional-requirements)

We'll start by asking our interviewer about the extent of the functionality we need to build. Our goal for this section is to produce a concise set of functionalities that the system needs to support. In this case, we need to be able to query availability of items in our Distribution Centers (DCs) and place orders.

**Core Requirements**

1.  Customers should be able to query availability of items, deliverable in 1 hour, by location (i.e. the effective availability is the union of all inventory nearby DCs).
2.  Customers should be able to order multiple items at the same time.

**Below the line (out of scope)**

*   Handling payments/purchases.
*   Handling driver routing and deliveries.
*   Search functionality and catalog APIs. (The system is strictly concerned with availability and ordering).
*   Cancellations and returns.

For this problem, the emphasis is on aggregating availability of items across local distribution centers and allowing users to place orders without double booking. In other problems you may be more concerned with the product catalog, search functionality, etc.

### [Non-Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#2-non-functional-requirements)

**Core Requirements**

1.  Availability requests should be fast (<100ms) to support use-cases like search.
2.  Ordering should be strongly consistent: two customers should not be able to purchase the same physical product.
3.  System should be able to support 10k DCs and 100k items in the catalog across DCs.
4.  Order volume will be O(10m orders/day)

**Below the line (out of scope)**

*   Privacy and security.
*   Disaster recovery.

Here's how these might be shorthanded in an interview. Note that out-of-scope requirements usually stem from questions like "do we need to handle privacy?". Interviewers are usually comfortable with you making assertions "I'm going to leave privacy out of scope for the start" and will correct you if needed.

Requirements

## Set Up

### Planning the Approach

Before we go forward with designing the system, we'll think briefly through the approach we'll take.

For this problem, our requirements are fairly straightforward, so we'll take our default approach. We'll start by designing a system which simply supports our functional requirements without much concern for scale or our non-functional requirements. Then, in our deep-dives, we'll bring back those concerns one by one.

To do this we'll start by enumerating the "nouns" of our system, build out an API, and then start drawing our boxes.

### [Defining the Core Entities](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#core-entities-2-minutes)

Core entities are the high level "nouns" for the system. We're not (yet) designing a full data model - for that, we'll need to have a better idea of how the system fits together overall. But by figuring out the entities we'll have the right blocks to build the rest of the system. Getting the right entities is particularly important for designing a good REST API as resources are the central anchor point for a REST API - which are very tightly related to our core entities.

Core Entities

One important thing to note for this problem is the distinction between Item and Inventory. You might think of this like the difference between a Class and an Instance in object-oriented programming. While our API consumers are strictly concerned with items that they might see in a catalog (e.g. Cheetos), we need to keep track of where the **physical** items are actually located. Our Inventory entity is a physical item at a specific location.

The remaining entities should be more obvious: we need DistributionCenter to keep up with where our inventory is physically located and and Order entity to keep track of the items being ordered.

*   **Inventory**: A physical instance of an item, located at a DC. We'll sum up Inventory to determine the quantity available to a specific user for a specific Item.
*   **Item**: A type of item, e.g. Cheetos. These are what our customers will actually care about.
*   **DistributionCenter**: A physical location where items are stored. We'll use these to determine which items are available to a user. Inventory are stored in DCs.
*   **Order**: A collection of Inventory which have been ordered by a user (and shipping/billing information).

Particularly in product design, outlining the **identity** of the entities in your system is important. By starting with the most concrete physical or business entities (e.g. items, users, etc.) and working your way up to more abstract entities (e.g. orders, carts, etc.) you can ensure that you don't miss any important entities.

### Defining the API

Next, we can start with the APIs we need to satisfy, which should track closely to our functional requirements. There are a lot of extraneous details we could shove into these APIs, but we're going to start simple to avoid burning unnecessary time in the interview (a common mistake in practice!).

To meet our requirements we only need two APIs: the first API allows us to get availability of items given a location (and maybe a keyword), and the second API allows us to place an order. We'll include pagination in our availability API to avoid overwhelming the client with more data than it needs.

API

Note here that we're passing our location to both APIs: before the order can be processed by the backend we'll need to confirm the inventory is available close enough to the user's location to deliver within 1 hour.

## [High-Level Design](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#high-level-design-10-15-minutes)

### 1) Customers should be able to query availability of items

Let's move to the first requirement: customers should be able to query availability of items by location.

To do this, we have two steps. First, we need to find the DCs that are close enough to deliver in 1 hour. All of our inventory _lives_ in a DC, so we can shortcut having to check every item in our system. Next, once we have the list of serviceable DCs, we can check the inventory of them and return the union to the user. We need each step to be reasonably fast since our end-to-end latency should be less than 100ms.

To find nearby DCs, we can build a simple internal API which takes a LAT and LONG and returns a list of DCs within 1 hour. Let's assume we have a table of DCs with their lat/long. Crudely, we can measure the distance to the user's input with some simple math. A very basic version might use Euclidean distance while a more sophisticated example might use the Haversine formula to take into account the curvature of the Earth. Taking a simple threshold on this query would give us DCs within X distance as the crow flies. This isn't quite satisfying our functional requirement, but we'll come back to this in our deep dive.

Primitive Nearby Service

Next we need to check the inventory of the DCs we found. We can do this by querying our Inventory table and Items table. Let's assume we're using a Postgres database for these tables which will allow us to join this inventory table with our Item table to get the item name and description before returning with the quantity.

In many e-commerce systems the "Catalog" is stored separately from the inventory because of the different consumers and workloads. We'll store them in the same database here to make our job easier and to adhere to our requirements, but we might note to our interviewer that we'd ideally separate these, add a search index (like Elasticsearch) to allow searching the catalog, etc.

Inventory Lookup

We now have:

1.  **Availability Service** handles requests from our users for availability given a specific location.
2.  **Nearby Service** syncs with the database of nearby DCs and uses an external "Travel Time Service" to calculate travel times from DCs (potentially including traffic).
3.  **Inventory Table** a replicated SQL database table which returns the inventory available for each item and DC.

Putting it all together we have:

All Together

When a user makes a request to get availability for items A, B, and C from latitude X and longitude Y, here's what happens:

1.  We make a request to the **Availability Service** with the user's location X and Y and any relevant filters.
2.  The availability service fires a request to the **Nearby Service** with the user's location X and Y.
3.  The nearby service returns us a list of DCs that can deliver to our location.
4.  With the DCs available, the availability service query our database with those DC IDs.
5.  We sum up the results and return them to our client.

Great! Our availability requirement is (mostly) satisfied.

### 2) Customers should be able to order items.

The last thing we need to complete our requirements is for us to enable placing orders. For this, we require _strong consistency_ to make sure two users aren't ordering the same item. To do this we need to check inventory, record the order, and update the inventory together atomically.

While latency is not a big concern here (our users will tolerate more latency here than they will on the reads), we definitely want to make sure we're not promising the same inventory to two users. How do we do this?

This idea of ensuring we're not "double booking" is a common one across system design problems. To ensure we don't allow two users to order the same inventory, we need some form of locking. The idea being that we need to "lock" the inventory while we're checking it and recording the order in a such a way that only one user can hold the lock at a time.

### 

Good Solution: Two data stores with a distributed lock

###### Approach

We can have separate databases for orders and inventory. When an order to placed we'll lock the relevant inventory records, create the order record, decrement the inventory, and release the lock.

This is a good solution because it allows us to use the best data store for each use case. For example, we can use a key-value store for inventory and a relational database for orders. But ...

###### Challenges

It has some nasty failure modes!

*   What if our service crashes after we created the order but before we decremented the inventory? A subsequent user might order the inventory we had promised to the first user. We'll need to sweep for these failures and reverse them.
*   What if two orders have overlapping inventory requirements? We might deadlock if both User1 and User2 are trying to buy A and B, but User1 has the lock for A and User2 has the lock for B - neither can proceed.

If you go this route you'll need to be able to address each of these failure modes.

### 

Great Solution: Singular Postgres transaction

###### Approach

By putting both orders and inventory in the same database, we can take advantage of the ACID properties of our Postgres database. Using a singular transaction with isolation level SERIALIZABLE we can ensure that the entire transaction is atomic. This means that if two users try to order the same item at the same time, one of them will be rejected. This is because the transaction will fail to commit if the inventory is not available.

Singular Postgres Transaction

###### Challenges

While consolidating our data down to a single database has a lot of benefits, it's not without drawbacks. We're partly coupling the scaling of inventory and orders and we can't take advantage of the best data store for each use case.

When atomicity of transactions is a requirement, it's helpful to have your data colocated in an ACID data store. While it's possible to manage transactions across multiple data stores (and you may want this for other reasons), the additional complexity and overhead to support it is not what we want to focus on during this interview.

By choosing the "great" option and leaning in to our existing Postgres database we can keep our system simple and still meet our requirements. For an order, the process looks like this:

1.  The user makes a request to the **Orders Service** to place an order for items A, B, and C.
2.  The **Orders Service** makes creates a singular transaction which we submit to our Postgres leader. This transaction: a. Checks the inventory for items A, B, and C > 0. b. If any of the items are out of stock, the transaction fails. c. If all items are in stock, the transaction records the order and updates the status for inventory items A, B, and C to "ordered". d. A new row is created in the Orders table (and OrderItems table) recording the order for A, B, and C. e. The transaction is committed.
3.  If the transaction succeeds, we return the order to the user.

There are some downsides to this setup. In particular, if any of the items become unavailable in the users order the entire order fails. We'll want to return a more meaningful error message to the user in this case, but this is preferable to succeeding in an order that might not make sense (e.g. a device and its battery).

### Putting it all Together

With the two approaches listed, we can now pull everything together for a solution to our problem:

Initial Solution

We have three services, one for Availability requests, one for Orders, and a shared service for Nearby DCs. Both our Availability and Orders service use the Nearby service to look up DCs that are close enough to the user. We have a singular Postgres database for inventory and orders, partitioned by region. Our Availability service reads via read replicas, our Orders service writes to the leader using atomic transactions to avoid double writes. A great foundation!

## Deep Dives

### 1) Make availability lookups incorporate traffic and drive time

So far our system is only determining nearby DCs based on a simple distance calculation. But if our DC is over a river, or a border, it may be close in miles but not close in drive time. Further, traffic might influence the travel times. Since our functional requirements mandate 1 hour of drive time, we'll need something more sophisticated. What can we do?

### 

Bad Solution: Simple SQL Distance

###### Approach

We can put all the lat/long of our DC into a table, then measure the distance to the user’s input with some simple math. A very basic version might use Euclidean distance while a more sophisticated example might use the Haversine formula to take into account the curvature of the Earth. Taking a simple threshold on this query would give us DCs within X as the crow flies.

Simple SQL Distance

###### Challenges

*   This is a very simple approach which doesn’t take into account traffic, road conditions, etc. It also doesn’t take into account the fact that we might have multiple DCs in the same city.

### 

Bad Solution: Use a Travel Time Estimation Service Against all DCs

###### Approach

Since our DCs are rarely going to change (they're buildings!), we can sync periodically (like every 5 minutes) from a DC table to memory of our service. We can use a travel time estimation service to find the travel times from our input location to each of our DCs by iterating over all of them.

Travel Time Estimation Service

###### Challenges

We're making far too many queries to the travel time estimation service. Most of the DCs we're querying aren't close enough to ever plausibly be delivered in 1 hour.

### 

Great Solution: Use a Travel Time Estimation Service Against Nearby DCs

We build on the previous solution to sync periodically (like every 5 minutes) from a DC table to memory of our service. When an input comes in, we can prune down the "candidate" DCs by taking a fixed radius (say 60 miles, the most optimistic distance we could drive over in 1 hour) and limiting ourselves to only evaluating those. We'll take these restricted candidates and then pass to the external travel time service to create our final estimate.

Travel Time Against Nearby DCs

### 2) Make availability lookups fast and scalable

Currently, once we have nearby DCs we use those DCs to look up availability directly from our database. This introduces a lot of load onto our database. Let's briefly detour into some estimates to figure out how much throughput we might expect.

Using quantitative estimation where you've spotted a potential bottleneck can significantly improve your interview performance. It gives you and your interviewer a common set of data from which to weigh tradeoffs and it shows you're able to make reasonable assumptions about the system.

To figure out how many queries for availability we might have, we'll back in from our orders/day requirement which we set at 10m orders per day. All-in, we might estimate that each user will look at 10 pages across search, the homepage, etc. before purchasing 1 item. In addition, maybe only 5% of these users will end up buying where the rest are just shopping.

```
Queries: 10M orders/day / (100k seconds/day) * 10 / 0.05 = 20k queries/second
```

This is pretty sizeable number of queries per second. We clearly need to think about how we can scale this. What do we do?

###### Pattern: Scaling Reads

Local delivery services like Gopuff demonstrate classic **scaling reads** patterns where inventory queries vastly outnumber actual purchases. With 20k queries/second for availability checks but only occasional inventory updates, aggressive caching with short TTLs becomes critical.

[Learn This Pattern](/learn/system-design/patterns/scaling-reads)

### 

Great Solution: Query Inventory Through Cache

##### Approach

We can add a Redis instance to our setup. Our availability service can query the cache for a given set of inputs and, if the cache hits, return that result. If the cache misses we'll do a lookup on the underlying database and then write the results into the cache. Setting a low TTL (e.g. 1 minute) ensures that these results are fresh.

Inventory Through Cache

##### Challenges

We need to ensure that the cache is always up to date with the inventory table. Our Order Service will need to expire affected cache entries when it writes to the inventory table.

### 

Great Solution: Postgres Read Replicas and Partitioning

##### Approach

Since we only ever read inventory from a nearby collection of DC’s, we can group them together with a region ID using the first 3 digits of their zipcode. Then we can partition our inventory based on this region IDs. This means all queries will go to mostly 1 or 2 partitions rather than the entire inventory dataset.

We can also use read replicas for availability since we can tolerate a small amount of inconsistency. Our orders need to be strongly consistent, so those transactions need to be sent to the Postgres leader, but our availability queries can go to our read replicas.

Postgres Read Replicas and Partitioning

##### Challenges

We'll need to manage the sizing of our replicas to balance with traffic. We'll also need to manage the partitioning of our data to ensure that we're not overloading any one replica.

By choosing the "great" solutions for both challenges we net out with a solution that looks something like this:

Final Nearby Service

## [What is Expected at Each Level?](https://www.hellointerview.com/blog/the-system-design-interview-what-is-expected-at-each-level)

Your interviewer may even have you go deeper on specific sections, or ask follow-up questions. What might you expect in an actual assessment?

### Mid-Level

**Breadth vs. Depth**: A mid-level candidate will be mostly focused on breadth. As an approximation, you’ll show 80% breadth and 20% depth in your knowledge. You should be able to craft a high-level design that meets the functional requirements you've defined, but the optimality of your solution will be icing on top rather than the focus. **Probing the Basics**: Your interviewer spend some time probing the basics to confirm that you know what each component in your system does. For example, if you use DynamoDB, expect to be asked about the indexes available to you. Your interviewer will not be taking anything for granted with respect to your knowledge. **Mixture of Driving and Taking the Backseat**: You should drive the early stages of the interview in particular, but your interviewer won't necessarily expect that you are able to proactively recognize problems in your design with high precision. Because of this, it’s reasonable that they take over and drive the later stages of the interview while probing your design. **The Bar for GoPuff**: For this question, interviewers expect a mid-level candidate to have clearly defined the API endpoints and data model, and created both routes: availability and orders. In instances where the candidate uses a “Bad” solution, the interviewer will expect a good discussion but not that the candidate immediately jumps to a great (or sometimes even good) solution.

### Senior

**Depth of Expertise**: As a senior candidate, your interviewer expects a shift towards more in-depth knowledge — about 60% breadth and 40% depth. This means you should be able to go into technical details in areas where you have hands-on experience. **Advanced System Design**: You should be familiar with advanced system design principles. Certain aspects of this problem should jump out to experienced engineers (read volume, trivial partitioning) and your interviewer will be expecting you to have reasonable solutions. **Articulating Architectural Decisions**: Your interviewer will want you to clearly articulate the pros and cons of different architectural choices, especially how they impact scalability, performance, and maintainability. You should be able to justify your decisions and explain the trade-offs involved in your design choices. **Problem-Solving and Proactivity**: You should demonstrate strong problem-solving skills and a proactive approach. This includes anticipating potential challenges in your designs and suggesting improvements. You need to be adept at identifying and addressing bottlenecks, optimizing performance, and ensuring system reliability. **The Bar for GoPuff**: For this question, a senior candidate is expected to speed through the initial high level design so we can spend time discussing, in detail, how to optimize the critical paths. Senior candidates would be expected to have optimized solutions for both the atomic transactions of the orders service as well as the scaling of the availability service.

### Staff+

**Emphasis on Depth**: As a staff+ candidate, the expectation is a deep dive into the nuances of system design — the interviewer is looking for about 40% breadth and 60% depth in your understanding. This level is all about demonstrating that "been there, done that" expertise. You should know which technologies to use, not just in theory but in practice, and be able to draw from your past experiences to explain how they’d be applied to solve specific problems effectively. Your interviewer knows you know the small stuff (REST API, data normalization, etc) so you can breeze through that at a high level so we have time to get into what is interesting. **High Degree of Proactivity**: At this level, your interviewer expects an exceptional degree of proactivity. You should be able to identify and solve issues independently, demonstrating a strong ability to recognize and address the core challenges in system design. This involves not just responding to problems as they arise but anticipating them and implementing preemptive solutions. **Practical Application of Technology**: You should be well-versed in the practical application of various technologies. Your experience should guide the conversation, showing a clear understanding of how different tools and systems can be configured in real-world scenarios to meet specific requirements. **Complex Problem-Solving and Decision-Making**: Your problem-solving skills should be top-notch. This means not only being able to tackle complex technical challenges but also making informed decisions that consider various factors such as scalability, performance, reliability, and maintenance. **Advanced System Design and Scalability**: Your approach to system design should be advanced, focusing on scalability and reliability, especially under high load conditions. This includes a thorough understanding of distributed systems, load balancing, caching strategies, and other advanced concepts necessary for building robust, scalable systems. **The Bar for GoPuff**: For a staff+ candidate, expectations are set high regarding depth and quality of solutions, particularly for the complex scenarios discussed earlier. Your interviewer will be looking for you to be diving deep into at least 2-3 key areas, showcasing not just proficiency but also innovative thinking and optimal solution-finding abilities. They should show unique insights for at least a couple follow-up questions of increasing difficulty. A crucial indicator of a staff+ candidate's caliber is the level of insight and knowledge they bring to the table. A good measure for this is if the interviewer comes away from the discussion having gained new understanding or perspectives.

###### Test Your Knowledge

Take a quick 15 question quiz to test what you've learned.

Start Quiz

Login to track your progress

[Next: Ticketmaster](/learn/system-design/problem-breakdowns/ticketmaster)

How would you rate the quality of this article?

0.5 Stars1 Star1.5 Stars2 Stars2.5 Stars3 Stars3.5 Stars4 Stars4.5 Stars5 StarsEmpty

## Comments

(284)

Login to Join the Discussion

Your account is free and you can post anonymously if you choose.

​

Sort By

Popular

Sort By

![Aleksey Klintsevich](https://lh3.googleusercontent.com/a/ACg8ocL0px7VPQXZNEr2_xkgRSVls_QCeW-wbucIiICgpKJklg=s96-c)

Aleksey Klintsevich

Top 5%

Top 5%

[• 2 years ago](#comment-clu3appwv00k2mmkqod4w8eav)

I think it might be worth it to mention the Saga pattern, when you're ordering the items, as a possible solution

Show more

64

A

ApparentTomatoOx647

Top 10%

Top 10%

[• 1 year ago](#comment-cm8aic32500t6o5ihxyxxgf44)

+1 We can utilize Change Data Capture (CDC) or Outbox pattern on the Order table using pglogical, allowing us to track changes in order status (Ordered, Confirmed, or Failed). By adding the Order table to a replication set via pglogical.replication\_set\_add\_table, we can capture and process these updates in near real time.

When a new order is placed, it is initially recorded with the status "Ordered". These changes can be then streamed by Postgres trigger + separate Kafka producer to a Kafka message broker, where a consumer group of worker processes listens for updates. Each worker independently processes incoming order events and attempts to update the Inventory table, ensuring consistency through row-level locking (fine-grained locking).

If a worker successfully deducts the required quantities from inventory, the order status is updated to "Confirmed". If the inventory update fails due to insufficient stock, the order is marked as "Failed" (reconciliation step), and the customer is notified.

Although customers must wait briefly for their order status to be confirmed, this event-driven architecture greatly enhances scalability by decoupling the Order and Inventory systems. This means that both databases can reside on separate hosts, reducing contention and improving overall system performance while it increases the system complexity.

Show more

31

![slrparser](https://lh3.googleusercontent.com/a/ACg8ocLLbKx6uTUUix2p61_dH87ndDylMI8q4vNfIV6ZyuSVWW08syTF=s96-c)

slrparser

Top 5%

Top 5%

[• 11 months ago](#comment-cmbc8vn2a01qrad07alrmxgdi)

It feels very overengineered to me, tbh.

Show more

64

![udit agrawal](https://lh3.googleusercontent.com/a/ACg8ocLEGap_XwS1Mcu4vZkpJXuJxMhH6Ely6OgAoxbvOhxGeRkRQzQD=s96-c)

udit agrawal

Top 10%

Top 10%

[• 9 months ago](#comment-cmdbxz2az09read098gthklj2)

With the intention to partition inventory table by region\_id, it makes sense to keep order table in a separate database maybe sharded by userid(to fetch all the orders of a user), above event driven architecture makes much more sense.

Show more

0

![Max](https://lh3.googleusercontent.com/a/ACg8ocIUvlTresLlFdhYUqgnu2ZU821cX5jMqqQ-k6yHUJhQeRJFWUg=s96-c)

Max

Premium

Premium

[• 11 months ago](#comment-cmb7cechm00fcad08kcdzu7d6)

I think it's very redundant to add CDC with Kafka, Kafka Connect to reduce transaction by this: "quantity = quantity - 1".

Show more

10

![Nguyen Tran Trung](https://lh3.googleusercontent.com/a/ACg8ocIw7A-V4IvZqAplAMyxAYHmty6uN1X5bfi-9H4Cuo6uaCtFnkE-nQ=s96-c)

Nguyen Tran Trung

[• 5 months ago](#comment-cmit4nos0025d08ad5yhcgerc)

Yes agreed. The most important part is the compensation flow. You would Saga: 1) ReserveOrder(itemId, dcId, amount) on the Inventory table and 2) INSERT INTO orders. If the first step fails then great. If second step fails, in case the service is alive, we can RPC ReturnOrder(itemId, dcId, amount) (this API must be idempotent, we will discuss right later). Harder stuff is when the Saga coordinator (Order Service) crashes during INSERT or during compensation, then we never calls ReturnOrder. A good approach here is we can run scheduler service periodically to compensate failed orders. Since we failed the INSERT, we never knew which failed, so let's refactor the order flow by 1) INSERT INTO orders (state, expires) VALUES (InProgress, 1 hours); 2) the second Saga step be UPDATE orders SET state = Success. Then we can always know which order is expired and stuck in InProgress to compensate (CREATE INDEX idx\_orders\_state (expires, state) and run this query in read-only slave to speed things up).

To make ReturnOrder idempotent - simply have a "compensated\_reservation" table (orderId, amount) and check if the compensation is completed before adding amount to the items table during a transaction. This table can be vacuumed periodically during off hours (it's very small!)

This design allows decoupling orders and items/inventory table and shard them freely.

This is what I could came up with, any suggestions/simplification?

Show more

2

P

Pulak

Premium

Premium

[• 1 month ago](#comment-cmnldx02708zy08adjjlw6n98)

yes but handling distributed transactions will be complex considering the volume and management. Just curious, what are the challenges faced implementing Saga?

Show more

0

N

NecessaryMoccasinEchidna420

Top 5%

Top 5%

[• 2 years ago](#comment-cluvumkwo001914j8goo77g4a)

The whole inventory reservation thing feels more like an engineers' solution than a business goals solution.

Of course if the interviewer says you must _never_ ever let someone place an order if you aren't 100% sure that you have stock, that's fine. Do it.

But if you're at a senior+ level and expected to show some business thinking beyond technical implementation and come up with that as one of the most important above-the-line requirements on your own... is it really? What business goal are we fulfilling?

The business goal is to get people to spend money.

If you block them from checking out with 20 other items because a bag of chips in their cart went out of stock before they hit the "Place Order" button... if a 100ms latency increase on Amazon triggers a 1% drop in sales, what's the drop going to be for refusing to accept the order? The business will see the analytics funnel and tell you to remove this feature immediately.

The real-world business solution on these apps for items which _might_ be out stock, but we don't know because of concurrency and also just-in-time supply chains is to give the customer a choice of substitution (preferable!) or refund _for that one item_.

Show more

45

N

NecessaryMoccasinEchidna420

Top 5%

Top 5%

[• 2 years ago](#comment-cluvvkia7001s14j8vv5qc85b)

> Good Solution: Use Redis to "lock" items Great Solution: Use a new status flag

Isn't this basically identical to the Ticketmaster ticket inventory solution, where the DB-based status lock with cron-process to release locks was considered sub-optimal and the Redis-based lock with TTL was considered "great"?

One last comment: this solution looks a lot more like a hotel reservation system than a grocery app, to be honest.

Although in real-life hotels and airlines allow overbooking, as business-wise to be "optimistic" and sell as much inventory as possible and disappoint some customers.

Show more

9

C

ChemicalCopperIguana997

Top 10%

Top 10%

[• 11 months ago](#comment-cmakh4jqa03d1ad08ekjh5i9k)

In grocery apps, most SKUs are mass-quantity items, so the chance of inventory going to zero between "add to cart" and "checkout" is low. Retailers accept the small trade-off of occasional stock-outs at checkout in exchange for system simplicity and performance. Fulfillment can often be adjusted using substitution logic (e.g., offering a different brand of milk if one is unavailable), which keeps the customer experience smooth.

In contrast, systems like Ticketmaster or hotel booking platforms deal with scarce, uniquely identifiable resources (e.g., a specific concert seat or hotel room). In these cases, losing a booking due to concurrency issues is unacceptable to users. That's why these systems require strict lock management, race condition prevention, and mechanisms like Redis-based locks with TTL or DB row locking to ensure fairness and consistency.

Show more

31

![Neethi Elizabeth Joseph](https://lh3.googleusercontent.com/a/ACg8ocLIqiNynRHkg9PC0UkreWCVi72f6mjE7RD_OChkeHFEOi7NF4Y=s96-c)

Neethi Elizabeth Joseph

[• 1 year ago](#comment-clxfr8ru2004blua4mftnd17k)

I wanted to ask about the same thing: TicketMaster vs GoPuff The Distributed Lock is not considered great here. I think leveraging the powers of the RDBMS is being prioritized here and we are leaning further into using RDBMS. I hope interviewers accept it.

Show more

4

![Kevin Blast](https://lh3.googleusercontent.com/a/ACg8ocKbAl1I5518z1qD6xNjaCfhblGupR5vI_16MyUWvUQoZc_M6HcS=s96-c)

Kevin Blast

[• 1 year ago](#comment-clyb2o202004oqpccg5glyl88)

I think the difference is the ticketMaster locks down an unique resource (a ticket with unique seat) vs the inventory is a shared resource. Locking the inventory item isn't appropriate.

Show more

6

![Abhishek Agrawal](https://lh3.googleusercontent.com/a/ACg8ocLbochCXg3eFE50gZtepWgs73NQoARCra_MTgjJBRxLJo98ac_r=s96-c)

Abhishek Agrawal

[• 1 year ago](#comment-cm1e4fhcc00mk119gma076kpu)

but we could be locking inventoryInstance. so yes, would be great to understand why Redis based lock with TTL is not great here.

Show more

1

I

InstitutionalPurpleMollusk746

[• 1 year ago](#comment-cm1qz9h7u00ecwm786ao8p3mx)

I have same question here.. why is redis lock solution not considered a great solution here? Hope Stefan sees these comments and reply the reasoning.

Show more

1

I

InstitutionalPurpleMollusk746

[• 1 year ago](#comment-cm23w9w82007d5dn0v4vhrlks)

Unlike Ticketmaster, when a user places an item for reservation in this application, they are more likely to complete the order rather than abandon the cart, since grocery items are typically needed sooner and the amount of money involved is smaller compared to ticket purchases. Therefore, periodic jobs to clean up the database for items with a 'reserved' status, allowing for some lag, are not a significant issue.

Additionally, unlike the singular quantity of a specific seat in Ticketmaster, this application usually deals with multiple quantities of item instances. As a result, if the count of item instances isn’t perfectly accurate (e.g., 9 instead of 10), it won’t matter as much to the user as long as there is more than 1 in stock. In contrast, for Ticketmaster, it's a binary situation where the seat is either available (1) or not (0).

Considering these trade-offs and the cost of maintaining Redis, I believe the second approach is better in this case.

Hope my reasoning makes sense!

Show more

4

![Tommy Loalbo](https://lh3.googleusercontent.com/a/ACg8ocKJIn8OPXYOxiFFjMUkH5UDjWWCbOFuGt2Srsu9sGECWCgexFCq=s96-c)

Tommy Loalbo

[• 1 year ago](#comment-cm6artm2w00vhsagcykevj7c5)

I see your point about multiple in the inventory but potentially seeing something is out of or on hold by someone else or just lower in stock because of that could increase the scarcity effect and potentially drive up sales. I feel like it depends on the analytics.

Show more

0

E

EasyCopperOtter704

[• 1 year ago](#comment-cm96a1u7803kgad08ndikc1rk)

I had the same question. Maybe it is because inventory is usually not low (near zero) most of the time? You do not want double bookings, but it does not make sense to reserve items as your inventory is not low. Contrast that to the Ticketmaster problem where each event has only a few hundred tickets, and many people tend to book the same seats that they consider "best"

Show more

0

A

AliveJadeAntelope452

[• 1 year ago](#comment-cm5edsk6o00mz31am9jprt4ea)

I was going to say the same thing about the similarities between this and hotel booking systems. Based on my understanding, they are roughly 90% the same, with only a few key differences: 1.Date Range: A hotel system query will always include a date range. Ensuring inventory item availability within a date range requires adjustments to the design. The inventory table will differ. Instead of handling multiple items per order, we primarily deal with one item per order, but with an associated date range. A significant challenge is maintaining consistent room availability throughout the booked dates (i.e., preventing users from changing rooms during their stay). 2. Location/nearby service requirements is different. Hotel booking systems typically involve searching for remote locations, often by location name, rather than using the user's current lat/lng coordinates. Determining the correct location presents a unique challenge. However, we don't need to consider how current traffic impacts commute time. 3.Traffic and Concurrency: Hotel booking systems often exhibit much higher spike ratios. Traffic can surge significantly near vacation seasons. High concurrency is also common for "hot items" (certain hotels on specific dates). This may necessitate infrastructure changes to handle the increased demand, such as implementing booking queues.

Show more

3

![Stefan Mai](https://hellointerview-files.s3.us-west-2.amazonaws.com/public-media/stefan-headshot_100.png)

Stefan Mai

Admin

Admin

[• 2 years ago](#comment-cluvvc92l001f14j8l0n7eu2w)

Ha, this is a fair point. Most interviews are going to be synthetic in nature, you only have 1 hour after all. But if you were designing this in the real world you're right, you'd probably want to design some partial checkout functionality.

Show more

3

N

NecessaryMoccasinEchidna420

Top 5%

Top 5%

[• 2 years ago](#comment-cluvvyyma001y14j8jm5ho9t0)

Yep, that makes sense. Tbh, if I were an interviewer and someone used this prompt as an opportunity to show how they would design a real-time inventory system, it's probably fine.

But as someone who has a Meta interview coming up in a couple of weeks for E6, this blog post makes me mildly anxious wondering if an interviewer who asks this particular question would ding me because I only designed a "best effort" stock system and prioritized other goals

Show more

1

![Stefan Mai](https://hellointerview-files.s3.us-west-2.amazonaws.com/public-media/stefan-headshot_100.png)

Stefan Mai

Admin

Admin

[• 2 years ago](#comment-cluvw3jqo002214j8n3qn2gej)

System design questions don't have 1 right answer: the important piece is you being able to demonstrate that you can think on your feet, use your body of experience to make tradeoffs, and creatively build a solution.

This question isn't appropriate for an E6 interview, FWIW. Keep in mind that for E6 you'll want to go deeper than most of the guides on this site cover.

Show more

2

![Stefan Mai](https://hellointerview-files.s3.us-west-2.amazonaws.com/public-media/stefan-headshot_100.png)

Stefan Mai

Admin

Admin

[• 2 years ago](#comment-cluvxb5ay002e14j8sqy1wrmi)

We'll have to work on that next. Much smaller audience!

Show more

4

N

NecessaryMoccasinEchidna420

Top 5%

Top 5%

[• 2 years ago](#comment-cluvx9k1e002c14j8ukm2nlk5)

True, but then most prep material is focused at a lower level, it's very hard to find good examples of staff-level system design that's also digestible as a refresher within a limited time window! I haven't interviewed in 5 years at this point. I read through DDIA and some of its references to get a bit more depth. Still feel pretty unprepared though.

Show more

2

C

core2extremist

Top 5%

Top 5%

[• 1 month ago](#comment-cmnin1l8508zx0eadeqdqu03k)

I like this suggestion, good thinking that high level candidates should be willing to push back on requirements. In fact I can see where a "requirement" like this would be imposed for the express purpose of seeing if the candidate has the insight and backbone to suggest changes.

It seems reasonable to "confirm" an order with recent inventory values in lieu of strongly consistent locking. To minimize chances of double-booking the service skip the cache and query availability directly as the order is placed, on the review page just before the submitting the order. Then asynchronously (after confirmation) try locking items. If items are not available then the workflow can try to mitigate it. For example if we planned to reserve 20 bananas from center A and 10 from B, but A no longer has 20 bananas, then we can increase the bananas we reserve from B to compensate.

That matches my experience with Whole Foods delivery during covid. They frequently "confirmed" the order, but then about 1/15 items would be out of stock anyway. In fact this was planned: the order interface let you specify for each item if you want to skip the item or accept a substitution for each in case it's not available. So clearly they weren't doing strongly consistent locking - or it was unreliable.

And now that I think about it: items get lost, damaged, miscounted, wrong pallet contents, etc. at the warehouse side all the time. So even with strongly consistent locking we would _still_ have cases where the items that are supposed to be available just aren't. So it makes sense given that reality to back off on strongly consistent locking, and instead accept an order 1% chance 90% of the items will be available instead of 100%.

Show more

0

L

LooseCopperConstrictor421

[• 1 year ago](#comment-cm0txbg2p008qy976myj1x0rn)

I think best effort solution makes sense here because of the delivery constraint of 1 hour. Had it been like amazon where its a matter of couple of days or a week in some cases, overbooking makes sense.

Show more

0

N

NecessaryMoccasinEchidna420

Top 5%

Top 5%

[• 2 years ago](#comment-cluvuu1es001b14j825q0fclu)

Also am I reading the design correctly that we have a ItemInstance row in the database for each individual item? If we have 1 million packs of gum in inventory we have 1 million rows?

Show more

0

![Dota Warning](https://lh3.googleusercontent.com/a/ACg8ocKjjBxCeyfvgSIxLvf2azBI4yHmVF8eKcXmUMNEEk5eyaAD2Q=s96-c)

Dota Warning

[• 1 year ago](#comment-cm5ejohn80039shby0xubmter)

If one row signifies one item, why do we have quantity in inventory schema?

Show more

6

![Stefan Mai](https://hellointerview-files.s3.us-west-2.amazonaws.com/public-media/stefan-headshot_100.png)

Stefan Mai

Admin

Admin

[• 2 years ago](#comment-cluvvcdpp001h14j89m6og2qz)

Yes.

Show more

0

E

EquivalentPurpleMarmoset761

Premium

Premium

[• 1 year ago](#comment-clx0k2wvn005qep4ijsymign1)

Why not using a quantity field for each item instance?

Show more

1

![Sheraz Khan](https://lh3.googleusercontent.com/a/ACg8ocJCd5z18_6ehx6HwgWapXqLLCx3zTE0_a_U3oGOEwTPtuxvFg=s96-c)

Sheraz Khan

[• 1 year ago](#comment-cly7toz610096e4zveyt3ay88)

If I understand your proposal correctly, you are saying to have a table say "Reservation" which will hold a row per item that is added to cart. While the item is added in this reservation table, inventory is reduced by same quantity. Once the order is confirmed, we remove the row from reservation table and insert in Order table. If order is cancelled, we remove row reservation table and update inventory table. That's what I first thought when I read the article.

Show more

0

![Wang lei](https://lh3.googleusercontent.com/a/ACg8ocIBwcYDZiesH-WGea9evEz-VtPcpOiYrYCCdqZM0uHbfMdpWw=s96-c)

Wang lei

[• 1 year ago](#comment-cm1skdkjh001yffpkrendhxgr)

It is not scalable then, if they are not sold, they are waste of space then just with a quantity. Per my experience, we can delay its creation when it is purchased.

Show more

0

E

ExtraAmaranthDuck389

Top 10%

Top 10%

[• 11 months ago](#comment-cmahpnm7r007zad08xr4hkfdl)

This feels a bit too high level.

1.  Should all items be available/ordered from a single DC? Once the neabyService provides a list of DC\_ID, are we checking if all items are available in any single DC or across DCs?
    
2.  For available, how do we cache in Redis?
    
3.  How are we syncing DC data from DB to our application server in-memory cache?
    
4.  Partition: IIUC, the DC\_ID will contain a prefix of Zip Code. And we partition our table on that.
    

Let's say there is a single application server which can server 20K search qps. But DB can only do like 5K. So then we will have 4 partitions based on zip code. Then the single application server will call the DB and the DB has the knowledge of which of the 4 partition to call?

1.  Replicas: Can you go in more detail how replication works in this case? How many replicas to use? How long does it take for the replicas to be updated with the master? How do we check if they are actually getting updated?

Show more

24

R

RightBlueHippopotamus746

[• 6 months ago](#comment-cmh0xvct800aj08ads0k5rsnk)

> Should all items be available/ordered from a single DC? Once the neabyService provides a list of DC\_ID, are we checking if all items are available in any single DC or across DCs?

Seems like a requirements clarification question, which you should align with your interviewer based on the problem focus.

> For available, how do we cache in Redis?

The article has been updated with the flow: -Check cache for availability. -If unavailable, check DB and write to cache. -Cache items with a TTL of 1 min to keep them fresh. -Revoke cache items when Order updates inventory values.

> How are we syncing DC data from DB to our application server in-memory cache?

The app servers can periodically read the values from the DB, and update the in memory cache.

> Let's say there is a single application server which can server 20K search qps. But DB can only do like 5K. So then we will have 4 partitions based on zip code. Then the single application server will call the DB and the DB has the knowledge of which of the 4 partition to call?

\-Why do you have 4 partitions based on zip code? Assuming a zip code prefix of the first three digits, you can have 1000 unique values. If you hash the first three digits, then you can reduce them to a reasonable number of partitions. -Each app server first checks the cache, else checks the db. The DB routes the app request to the correct partition based on hashing the first three digits of the zip code.

Show more

1

A

akakhilkumbar

[• 1 year ago](#comment-cma3go9970111ad07bqfk6m1t)

need a back to top button, Please

Show more

12

G

GothicCopperPanther728

[• 8 months ago](#comment-cmf4w9faa02n307adxohc2cnl)

Command + up arrow

Show more

5

![Adil Hussain](https://lh3.googleusercontent.com/a/ACg8ocLgEgxGa6vEGn_yzDY6BGW4VlcJyLc8Clf0TuKVtfANZrrzRA=s96-c)

Adil Hussain

[• 4 months ago](#comment-cmjcfl7l901yx08ad811ir3r4)

For mobile readers this won’t work.

Show more

0

C

CivicBlackAsp163

[• 1 year ago](#comment-clxsx57d500bc10o2sdsp61d0)

Why not use a queue like Kafka or SQS? The order processing can be async, and it will just have more logic as time goes on.

Show more

7

![Abhishek singh](https://lh3.googleusercontent.com/a/ACg8ocIjdntANLbhTNXX8hGbI17JPl7oeTbId3meVApmXmKA81WDpvNs=s96-c)

Abhishek singh

Premium

Premium

[• 3 months ago• edited 3 months ago](#comment-cmkefcdnn003f08adp3dqjvsn)

I think order processing should not be async as customer will like to know instantly that the order is placed or not . Almost all the quick commerce apps I have seen till now show the order is placed or not right away

Show more

2

C

core2extremist

Top 5%

Top 5%

[• 1 month ago](#comment-cmnilgyoo07xx09advjibshlt)

Typically ordering is synchronous, or at least looks that way to the user:

1.  user clicks "order now" button
2.  they expect a page the says something like "just a moment, placing your order..."
3.  then within ~5 seconds they expect "Thanks for your order! Here's your order ID and an invoice"

There are two major ways to accomplish this:

*   the /order endpoint is truly synchronous: client sends the request, waits for a success or failure reply
*   the /order endpoint is actually async and the client uses polling
    *   /order endpoint returns immediately with an order\_id
    *   client (browser, app) sends GETs to /orders/{order\_id}/status every ~1 second
*   technically an SSE solution is possible but it seems complicated

The "looks sync but is actually async + polling" is actually quite common, it can be simpler to implement if using the saga pattern (see below) or otherwise coordinating among services.

You could use Kafka / SQS (although SQS is limited to ~300 messages/second which might be too slow at peak times) in the backend for the async + polling version.

But I think an easier solution for the async version is to use Temporal or similar orchestration system with the saga pattern. See [https://www.hellointerview.com/learn/system-design/patterns/multi-step-processes](https://www.hellointerview.com/learn/system-design/patterns/multi-step-processes) for details - their example is basically the exactly this ecommerce problem starting from the order step, reserve inventory, authorize payment, etc.

Show more

0

Show All Comments

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

1) Customers should be able to query availability of items

](#1-customers-should-be-able-to-query-availability-of-items)[

2) Customers should be able to order items.

](#2-customers-should-be-able-to-order-items)[

Putting it all Together

](#putting-it-all-together)[

Deep Dives

](#deep-dives)[

1) Make availability lookups incorporate traffic and drive time

](#1-make-availability-lookups-incorporate-traffic-and-drive-time)[

2) Make availability lookups fast and scalable

](#2-make-availability-lookups-fast-and-scalable)[

What is Expected at Each Level?

](#what-is-expected-at-each-level)[

Mid-Level

](#mid-level)[

Senior

](#senior)[

Staff+

](#staff)

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