# Real-time Updates Pattern for System Design Interviews | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/patterns/realtime-updates

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

# Real-time Updates

Learn about methods for triggering real-time updates in your system design

Real-time Updates

* * *

[

Premium users can view this video once signed in

](/login)

**⚡ Real-time Updates** addresses the challenge of delivering immediate notifications and data changes from servers to clients as events occur. From chat applications where messages need instant delivery to live dashboards showing real-time metrics, users expect to be notified the moment something happens. This pattern covers the architectural approaches to enable low-latency, bidirectional communication.

## The Problem

Consider a collaborative document editor like Google Docs. When one user types a character, all other users viewing the document need to see that change within milliseconds. In apps like this you can't have every user constantly polling the server for updates every few milliseconds without crushing your infrastructure.

The core challenge is establishing efficient, persistent communication channels between clients and servers. Standard HTTP follows a request-response model: clients ask for data, servers respond, then the connection closes. This works great for traditional web browsing but breaks down when you need servers to proactively push updates to clients.

Unfortunately for many candidates, these problems (if they are faced at all) are often solved once by a specialized team. This means that many design challenges will require you to cross a bridge you may not have had the opportunity to build (I've spoken with dozens of candidates with 10+ years of experience for whom this was the case). Don't worry though, in this pattern we'll cover the important things you need to know to be able to make great decisions in your interview. And who knows, maybe one day you'll be the one building these pieces of your next project!

###### Problem Breakdowns with Real-time Updates Pattern

[Ticketmaster](/learn/system-design/problem-breakdowns/ticketmaster#realtime-updates)

[Uber](/learn/system-design/problem-breakdowns/uber#realtime-updates)

[WhatsApp](/learn/system-design/problem-breakdowns/whatsapp#realtime-updates)

[Robinhood](/learn/system-design/problem-breakdowns/robinhood#realtime-updates)

[Google Docs](/learn/system-design/problem-breakdowns/google-docs#realtime-updates)

[Strava](/learn/system-design/problem-breakdowns/strava#realtime-updates)

[Online Auction](/learn/system-design/problem-breakdowns/online-auction#realtime-updates)

[FB Live Comments](/learn/system-design/problem-breakdowns/fb-live-comments#realtime-updates)

## The Solution

When systems require real-time updates, push notifications, etc, the solution requires two distinct pieces:

1.  The first "hop": how do we get updates from the server to the client?
2.  The second "hop": how do we get updates from the source to the server?

Two Hops for Real-time Updates

We'll break down each hop separately as they involve different trade-offs which work together.

### Client-Server Connection Protocols

The first "hop" is establishing efficient communication channels between clients and servers. While traditional HTTP request-response works for a startling number of use-cases, real-time systems frequently need persistent connections or clever polling strategies to enable servers to **push** updates to clients. This is where we get into the nitty-gritty of networking.

#### Networking 101

Before diving into the different protocols for facilitating real-time updates, it's helpful to understand a bit about how networking works — in some sense the problems we're talking about here are just networking problems! Networks are built on a layered architecture (the so-called ["OSI model"](https://en.wikipedia.org/wiki/OSI_model)) which greatly simplifies the world for us application developers who sit on top of it.

##### Networking Layers

In networks, each layer builds on the **abstractions** of the previous one. This way, when you're requesting a webpage, you don't need to know which voltages represent a 1 or a 0 on the network wire - you just need to know how to use the next layer down the stack. While the full networking stack is fascinating, there are three key layers that come up most often in system design interviews:

*   **Network Layer (Layer 3):** At this layer is IP, the protocol that handles routing and addressing. It's responsible for breaking the data into packets, handling packet forwarding between networks, and providing best-effort delivery to any destination IP address on the network. However, there are no guarantees: packets can get lost, duplicated, or reordered along the way.
*   **Transport Layer (Layer 4):** At this layer, we have TCP and UDP, which provide end-to-end communication services:
    *   TCP is a **connection-oriented** protocol: before you can send data, you need to establish a connection with the other side. Once the connection is established, it ensures that the data is delivered correctly and in order. This is a great guarantee to have but it also means that TCP connections take time to establish, resources to maintain, and bandwidth to use.
    *   UDP is a **connectionless** protocol: you can send data to any other IP address on the network without any prior setup. It does not ensure that the data is delivered correctly or in order. Spray and pray!
*   **Application Layer (Layer 7):** At the final layer are the application protocols like DNS, HTTP, Websockets, WebRTC. These are common protocols that build on top of TCP to provide a layer of abstraction for different types of data typically associated with web applications. We'll get into them in a bit!

These layers work together to enable all our network communications. To see how they interact in practice, let's walk through a concrete example of how a simple web request works.

##### Request Lifecycle

When you type a URL into your browser, several layers of networking protocols spring into action. Let's break down how these layers work together to retrieve a simple web page over HTTP. First, we use DNS to convert a human-readable domain name like hellointerview.com into an IP address like 32.42.52.62. Then, a series of carefully orchestrated steps begins:

Simple HTTP Request

#### Simple Polling: The Baseline

#### Long Polling: The Easy Solution

#### Server-Sent Events (SSE): The Efficient One-Way Street

#### Websockets: The Full-Duplex Champion

#### WebRTC: The Peer-to-Peer Solution

#### Overview

### Server-Side Push/pull

#### Pulling with Simple Polling

#### Pushing via Consistent Hashes

#### Pushing via Pub/Sub

## When to Use in Interviews

### Common Interview Scenarios

### When NOT to Use

## Common Deep Dives

### "How do you handle connection failures and reconnection?"

### "What happens when a single user has millions of followers who all need the same update?"

### "How do you maintain message ordering across distributed servers?"

## Conclusion

## Footnotes

1.  DNS technically can run over TCP or UDP, but we'll exclude that for simplicity in this illustration. [↩](#user-content-fnref-dns)
    
2.  We use SSE extensively for Hello Interview and the amount of time we've spent dealing with networking edge cases is mind boggling. [↩](#user-content-fnref-sse)
    

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

Client-Server Connection Protocols

](#client-server-connection-protocols)[

Server-Side Push/pull

](#server-side-push-pull)[

When to Use in Interviews

](#when-to-use-in-interviews)[

Common Interview Scenarios

](#common-interview-scenarios)[

When NOT to Use

](#when-not-to-use)[

Common Deep Dives

](#common-deep-dives)[

"How do you handle connection failures and reconnection?"

](#how-do-you-handle-connection-failures-and-reconnection)[

"What happens when a single user has millions of followers who all need the same update?"

](#what-happens-when-a-single-user-has-millions-of-followers-who-all-need-the-same-update)[

"How do you maintain message ordering across distributed servers?"

](#how-do-you-maintain-message-ordering-across-distributed-servers)[

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