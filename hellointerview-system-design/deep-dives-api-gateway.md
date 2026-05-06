# API Gateway Deep Dive for System Design Interviews | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/deep-dives/api-gateway

[

Limited Time Offer:Up to 20% off Hello Interview Premium

Up to 20% off Hello Interview Premium 🎉



](/premium)

Search

⌘K

[Pricing](/pricing)[Become a Coach](/become-an-expert)

Tutor

Get Premium

###### Key Technologies

# API Gateway

Learn when and how to effectively incorporate API Gateways into your system design interviews.

* * *

###### Watch Video Walkthrough

Watch the author walk through the problem step-by-step

###### Watch Video Walkthrough

Watch the author walk through the problem step-by-step

Watch Now

## What is an API Gateway?

There's a good chance you've interacted with an API Gateway today, even if you didn't realize it. They're a core component in modern architectures, especially with the rise of microservices.

Think of it as the front desk at a luxury hotel. Just as hotel guests don't need to know where the housekeeping office or maintenance room is located, clients shouldn't need to know about the internal structure of your microservices.

An API Gateway serves as a single entry point for all client requests, managing and routing them to appropriate backend services. Just as a hotel front desk handles check-ins, room assignments, and guest requests, an API Gateway manages centralized middleware like authentication, routing, and request handling.

The evolution of API Gateways parallels the rise of microservices architecture. As monolithic applications were broken down into smaller, specialized services, the need for a centralized point of control became evident. Without an API Gateway, clients would need to know about and communicate with multiple services directly – imagine hotel guests having to track down individual staff members for each request.

API gateways are thin, relatively simple components that serve a clear purpose. In this deep dive, we'll focus on what you need to know for system design interviews without overcomplicating things.

## Core Responsibilities

The gateway's primary function is request routing – determining which backend service should handle each incoming request. But this isn't all they do.

Funny enough, I'll often have candidates introduce a gateway in a system design interview and emphasize that it will do all this middleware stuff but never mention the core reason they need it -- request routing.

Nowadays, API gateways are also used to handle cross-cutting concerns or middleware like authentication, rate limiting, caching, SSL termination, and more.

### Tracing a Request

Let's walk through a request from start to finish. Incoming requests come into the API Gateway from clients, usually via HTTP but they can be gRPC or any other protocol. From there, the gateway will apply any middleware you've configured and then route the request to the appropriate backend service.

1.  Request validation
2.  API Gateway applies middleware (auth, rate limiting, etc.)
3.  API Gateway routes the request to the appropriate backend service
4.  Backend service processes the request and returns a response
5.  API Gateway transforms the response and returns it to the client
6.  Optionally cache the response for future requests

Let's take a closer look at each step.

API Gateway Request Flow

#### 1) Request Validation

Before doing anything else, the API Gateway checks if incoming requests are properly formatted and contain all the required information. This validation includes checking that the request URL is valid, required headers are present, and the request body (if any) matches the expected format.

This early validation is important because it helps catch obvious issues before they reach your backend services. For example, if a mobile app sends a malformed JSON payload or forgets to include a required API key, there's no point in routing that request further into your system. The gateway can quickly reject it and send back a helpful error message, saving your backend services from wasting time and resources on requests that were never going to succeed.

#### 2) Middleware

API Gateways can be configured to handle various middleware tasks. For example, you might want to:

*   Authenticate requests using JWT tokens
*   Limit request rates to prevent abuse
*   Terminate SSL connections
*   Log and monitor traffic
*   Compress responses
*   Handle CORS headers
*   Whitelist/blacklist IPs
*   Validate request sizes
*   Handle response timeouts
*   Version APIs
*   Throttle traffic
*   Integrate with service discovery

Of these, the most popular and relevant to system design interviews are authentication, rate limiting, and ip whitelisting/blacklisting. If you do opt to mention middleware, just make sure it's with a purpose and that you don't spend too much time here.

My suggestion when introducing a API Gateway to your design is to simply mention, "I'll add a API Gateway to handle routing and basic middleware" and move on.

#### 3) Routing

The gateway maintains a routing table that maps incoming requests to backend services. This mapping is typically based on a combination of:

*   URL paths (e.g., /users/\* routes to the user service)
*   HTTP methods (e.g., GET, POST, etc.)
*   Query parameters
*   Request headers

For example, a simple routing configuration might look like:

```
routes:
  - path: /users/*
    service: user-service
    port: 8080
  - path: /orders/*
    service: order-service
    port: 8081
  - path: /payments/*
    service: payment-service
    port: 8082
```

The gateway will quickly look up which backend service to send the request to based on the path, method, query parameters, and headers and send the request onward accordingly.

#### 4) Backend Communication

While most services communicate via HTTP, in some cases your backend services might use a different protocol like gRPC for internal communication. When this happens, the API Gateway can handle translating between protocols, though this is relatively uncommon in practice.

The gateway would, thus, transform the request into the appropriate protocol before sending it to the backend service. This is nice because it allows your services to use whatever protocol or format is most efficient without clients needing to know about it.

#### 5) Response Transformation

The gateway will transform the response from the backend service into the format requested by the client. This transformation layer allows your internal services to use whatever protocol or format is most efficient, while presenting a clean, consistent API to clients.

For example:

```
// Client sends a HTTP GET request
GET /users/123/profile

// API Gateway transforms this into an internal gRPC call
userService.getProfile({ userId: "123" })

// Gateway transforms the gRPC response into JSON and returns it to the client over HTTP
{
  "userId": "123",
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### 6) Caching

Before sending the response back to the client, the gateway can optionally cache the response. This is useful for frequently accessed data that doesn't change often and, importantly, is not user specific. If your expectation is that a given API request will return the same result for a given input, caching it makes sense.

The API Gateway can implement various caching strategies too. For example:

1.  **Full Response Caching**: Cache entire responses for frequently accessed endpoints
2.  **Partial Caching**: Cache specific parts of responses that change infrequently
3.  **Cache Invalidation**: Use TTL or event-based invalidation

In each case, you can either cache the response in memory or in a distributed cache like Redis.

## Scaling an API Gateway

When discussing API Gateway scaling in interviews, there are two main dimensions to consider: handling increased load and managing global distribution.

### Horizontal Scaling

The most straightforward approach to handling increased load is horizontal scaling. API Gateways are typically stateless, making them ideal candidates for horizontal scaling. You can add more gateway instances behind a load balancer to distribute incoming requests.

While API Gateways are primarily known for routing and middleware functionality, they often include load balancing capabilities. However, it's important to understand the distinction:

*   **Client-to-Gateway Load Balancing**: This is typically handled by a dedicated load balancer in front of your API Gateway instances (like AWS ELB or NGINX).
*   **Gateway-to-Service Load Balancing**: The API Gateway itself can perform load balancing across multiple instances of backend services.

This can typically be abstracted away during an interview. Drawing a single box to handle "API Gateway and Load Balancer" is usually sufficient. You don't want to get bogged down in the details of your entry points as they're more likely to be a distraction from the core functionality of your system.

### Global Distribution

Another option that works well particularly for large applications with users spread across the globe is to deploy API Gateways closer to your users, similar to how you would deploy a CDN. This typically involves:

1.  **Regional Deployments**: Deploy gateway instances in multiple geographic regions
2.  **DNS-based Routing**: Use GeoDNS to route users to the nearest gateway
3.  **Configuration Synchronization**: Ensure routing rules and policies are consistent across regions

## Popular API Gateways

Let's take a look at some of the most popular API Gateways.

### Managed Services

Cloud providers offer fully managed API Gateway solutions that integrate well with their ecosystems. This is by far the easiest option but also the most expensive.

1.  **[AWS API Gateway](https://aws.amazon.com/api-gateway/)**
    
    *   Seamless integration with AWS services
    *   Supports REST and WebSocket APIs
    *   Built-in features like:
        *   Request throttling
        *   API keys and usage plans
        *   AWS Lambda integration
        *   CloudWatch monitoring
2.  **[Azure API Management](https://azure.microsoft.com/en-us/products/api-management/)**
    
    *   Strong OAuth and OpenID Connect support
    *   Policy-based configuration
    *   Developer portal for API documentation
3.  **[Google Cloud Endpoints](https://cloud.google.com/endpoints)**
    
    *   Deep integration with GCP services
    *   Strong gRPC support
    *   Automatic OpenAPI documentation

### Open Source Solutions

For teams wanting more control or running on-premises:

1.  **[Kong](https://konghq.com/)**
    
    *   Built on NGINX
    *   Extensive plugin ecosystem
    *   Supports both traditional and service mesh deployments
2.  **[Tyk](https://tyk.io/)**
    
    *   Native support for GraphQL
    *   Built-in API analytics
    *   Multi-data center capabilities
3.  **[Express Gateway](https://www.express-gateway.io/)**
    
    *   JavaScript/Node.js based
    *   Lightweight and developer-friendly
    *   Good for Node.js microservices

## When to Propose an API Gateway

Ok cool, but when should you use an API Gateway in your interview?

The TLDR is: use it when you have a microservices architecture and don't use it when you have a simple client-server architecture.

With a microservices architecture, an API Gateway becomes almost essential. Without one, clients would need to know about and communicate with multiple services directly, leading to tighter coupling and more complex client code. The gateway provides a clean separation between your internal service architecture and your external API surface.

However, it's equally important to recognize when an API Gateway might be overkill. For simple monolithic applications or systems with a single client type, introducing an API Gateway adds unnecessary complexity.

I've mentioned this throughout, but I want it to be super clear. While it's important to understand every component you introduce into your design, the API Gateway is not the most interesting. There is a far greater chance that you are making a mistake by spending too much time on it than not enough.

Get it down, say it will handle routing and middleware, and move on.

###### Test Your Knowledge

Take a quick 15 question quiz to test what you've learned.

Start Quiz

Login to track your progress

[Next: Cassandra](/learn/system-design/deep-dives/cassandra)

How would you rate the quality of this article?

0.5 Stars1 Star1.5 Stars2 Stars2.5 Stars3 Stars3.5 Stars4 Stars4.5 Stars5 StarsEmpty

## Comments

(51)

Login to Join the Discussion

Your account is free and you can post anonymously if you choose.

​

Sort By

Popular

Sort By

![Tushar Goyal](https://lh3.googleusercontent.com/a/ACg8ocJD51wkHAkTT_0-_ouIFSTgzOw0944Y2mISMAIXndvFH16VNg=s96-c)

Tushar Goyal

Top 10%

Top 10%

[• 1 year ago](#comment-cm4mwyv9h00do10hbrin3i0eo)

I really liked the practicality of the article with end note that it's good to understand what is an API Gateway but there's no need to spend more than 30s on it in the interview. It's perfectly okay to say that we will need an API Gateway and write down the steps in brief it is going to perform such as routing, load balancing, rate limiting, etc. The interviewers almost never want to dive deep more on this topic.

Show more

38

![Evan King](https://hellointerview-files.s3.us-west-2.amazonaws.com/public-media/evan-headshot_100.png)

Evan King

Admin

Admin

[• 1 year ago](#comment-cm4mz2gye00ekgejmbso5saig)

100%! Get it down and move on :)

Show more

11

![Faizan Patel](https://lh3.googleusercontent.com/a/ACg8ocJzbM5WMdnK5hEBHONftRLfrlwaFUWrHxe92nFVjf0lGURw7Q=s96-c)

Faizan Patel

Top 10%

Top 10%

[• 1 year ago](#comment-cm9mykvjq00s3ad08m3yr139b)

I think this article should be part of "core concepts" and not the key technologies as it discuss a genral concept of API gateway rather than a specific gateway technology. Either way, great article!

Show more

21

![Sachin Naik](https://lh3.googleusercontent.com/a/ACg8ocJx_bMCqWbxqR1dVkIdl6qkS9hBJdZf_Ybg4-WP-UFafyK_Gg5L=s96-c)

Sachin Naik

[• 1 year ago](#comment-cm9023bo600qtad08k6rxcpd6)

Just a suggestion, .. in place of Whitelist/blacklist; Allowlist/Denylist IP's wording may be better

Show more

19

![Jagrit](https://lh3.googleusercontent.com/a/ACg8ocLVQF2_4KCJMgtZ0FF2xVqiW2qacI3u57liReHgnXzKXfc-iOwX=s96-c)

Jagrit

[• 1 year ago](#comment-cm4g2c8py05az1i3r2yqne33f)

Great Article, In my interviews, whenever there is a microservices architecture which is the case 90% of time, First I discuss the problem as like we need to have traffic control or routing thing and then introduce api gateway. This way it is always easy to correlate the usecase and the solution. Also another good analogy I have read about apigw is that it is very similar to Road Traffic Police like as they manage the directions of cars, etc. Your hotel desk example is pretty cool as well!

Thanks once again!

Show more

7

![Evan King](https://hellointerview-files.s3.us-west-2.amazonaws.com/public-media/evan-headshot_100.png)

Evan King

Admin

Admin

[• 1 year ago](#comment-cm4gisbub00k88jlr9lx0blxq)

Spot on!

Show more

2

B

bb9895

Premium

Premium

[• 5 months ago](#comment-cmilrk4y0016q08ady9ozf3vs)

> 1.  **[Express Gateway](https://www.express-gateway.io/)**
>     
>     *   JavaScript/Node.js based
>     *   Lightweight and developer-friendly
>     *   Good for Node.js microservices

I've checked that Express-Gateway is not maintained for about 5-6 years. It can still be an example but wanted to notify

Show more

3

Show All Comments

###### The best mocks on the market.

Now up to 10% off

[Learn More](/mock/overview)

Reading Progress

On This Page

[

What is an API Gateway?

](#what-is-an-api-gateway)[

Core Responsibilities

](#core-responsibilities)[

Tracing a Request

](#tracing-a-request)[

Scaling an API Gateway

](#scaling-an-api-gateway)[

Horizontal Scaling

](#horizontal-scaling)[

Global Distribution

](#global-distribution)[

Popular API Gateways

](#popular-api-gateways)[

Managed Services

](#managed-services)[

Open Source Solutions

](#open-source-solutions)[

When to Propose an API Gateway

](#when-to-propose-an-api-gateway)

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