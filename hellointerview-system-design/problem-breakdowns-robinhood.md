# Design a Stock Trading Platform Like Robinhood | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/problem-breakdowns/robinhood

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

# Robinhood

Real-time Updates

By[Joseph Antonakakis](https://www.linkedin.com/in/joseph-antonakakis-323b92a8/)·Published Jul 14, 2024·

hard

·

Asked at:

* * *

###### Try This Problem Yourself

Practice with guided hints and real-time feedback

Upgrade to Practice

## Understanding the Problem

**📈 What is [Robinhood](https://robinhood.com/)?** Robinhood is a commission-free trading platform for stocks, ETFs, options, and cryptocurrencies. It features real-time market data and basic order management. Robinhood isn't an exchange in its own right, but rather a stock broker; it routes trades through market makers ("exchanges") and is compensated by those exchanges via [payment for order flow](https://en.wikipedia.org/wiki/Payment_for_order_flow).

### Background: Financial Markets

There's some basic financial terms to understand before jumping into this design:

*   **Symbol**: An abbreviation used to uniquely identify a stock (e.g. META, AAPL). Also known as a "ticker".
*   **Order**: An order to buy or sell a stock. Can be a _market order_ or a _limit order_.
*   **Market Order**: An order to trigger immediate purchase or sale of a stock at the current market price. Has no price target and just specifies a number of shares.
*   **Limit Order**: An order to purchase or sell a stock at a specified price. Specifies a number of shares and a target price, and can sit on an exchange waiting to be filled or cancelled by the original creator of the order.

Outside of the above financial details, it's worth understanding the responsibilities of Robinhood as a business / system. **Robinhood is a brokerage and interfaces with external entities that actually manage order filling / cancellation.** This means that we're building a brokerage system that facilitates customer orders and provides a customer stock data. _We are not building an exchange._

For the purposes of this problem, we can assume Robinhood is interfacing with an "exchange" that has the following capabilities:

*   **Order Processing**: Synchronously places orders and cancels orders via request/response API.
*   **Trade Feed**: Offers subscribing to a trade feed for symbols. "Pushes" data to the client every time a trade occurs, including the symbol, price per share, number of shares, and the orderId.

For this interview, the interviewer is offering up an external API (the exchange) to aid in building the system. As a candidate, it's in your best interest to briefly clarify the exchange interface (APIs, both synchronous and asynchronous) so you have an idea of the tools at your disposal. Typically, the assumptions you make about the interface have broad consequences in your design, so it's a good idea to align with the interviewer on the details.

### [Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#1-functional-requirements)

**Core Requirements**

1.  Users can see live prices of stocks.
2.  Users can manage orders for stocks (market / limit orders, create / cancel orders).

**Below the line (out of scope)**

*   Users can trade outside of market hours.
*   Users can trade ETFs, options, crypto.
*   Users can see the [order book](https://www.investopedia.com/terms/o/order-book.asp) in real time.

This question focuses on stock viewing and ordering. It excludes advanced trading behaviors and doesn't primarily involve viewing historical stock or portfolio data. If you're unsure what features to focus on for a feature-rich app like Robinhood or similar, have some brief back and forth with the interviewer to figure out what part of the system they care the most about.

### [Non-Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#2-non-functional-requirements)

## The Set Up

### Planning the Approach

### [Defining the Core Entities](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#core-entities-2-minutes)

### [The API](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#api-design-5-minutes)

## [High-Level Design](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#high-level-design-10-15-minutes)

### 1) Users can see live prices of stocks

### 2) Users can manage orders for stocks

## [Potential Deep Dives](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#deep-dives-10-minutes)

### 1) How can the system scale up live price updates?

### 2) How does the system track order updates?

### 3) How does the system manage order consistency?

### Some additional deep dives you might consider

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

Background: Financial Markets

](#background-financial-markets)[

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

High-Level Design

](#high-level-design)[

1) Users can see live prices of stocks

](#1-users-can-see-live-prices-of-stocks)[

2) Users can manage orders for stocks

](#2-users-can-manage-orders-for-stocks)[

Potential Deep Dives

](#potential-deep-dives)[

1) How can the system scale up live price updates?

](#1-how-can-the-system-scale-up-live-price-updates)[

2) How does the system track order updates?

](#2-how-does-the-system-track-order-updates)[

3) How does the system manage order consistency?

](#3-how-does-the-system-manage-order-consistency)[

Some additional deep dives you might consider

](#some-additional-deep-dives-you-might-consider)[

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