# Design a Payment System like Stripe | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/problem-breakdowns/payment-system

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

# Payment System

Multi-step Processes

By[Evan King](https://www.linkedin.com/in/evan-king-40072280/)·Updated Jul 10, 2025·

hard

·

Asked at:

A

![Amazon](https://files.hellointerview.com/build-assets/PRODUCTION/_next/static/media/amazon-icon.0u2y0dgp1rlnw.svg?dpl=a5eaff0b0b1e4190375aeda4ce53625448283294)

C

+1

* * *

###### Try This Problem Yourself

Practice with guided hints and real-time feedback

Upgrade to Practice

[

Premium users can view this video once signed in

](/login)

## Understanding the Problem

**📸 What is [Stripe](https://www.stripe.com/)?** Payment processing systems like Stripe allow business (referred to throughout this breakdown as merchants) to accept payment from customers, without having to build their own payment processing infrastructure. Customer input their payment details on the merchant's website, and the merchant sends the payment details to Stripe. Stripe then processes the payment and returns the result to the merchant.

### [Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#1-functional-requirements)

**Core Requirements**

1.  Merchants should be able to initiate payment requests (charge a customer for a specific amount).
2.  Users should be able to pay for products with credit/debit cards.
3.  Merchants should be able to view status updates for payments (e.g., pending, success, failed).

**Below the line (out of scope):**

*   Customers should be able to save payment methods for future use.
*   Merchants should be able to issue full or partial refunds.
*   Merchants should be able to view transaction history and reports.
*   Support for alternative payment methods (e.g., bank transfers, digital wallets).
*   Handling recurring payments (subscriptions).
*   Payouts to merchants.

### [Non-Functional Requirements](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#2-non-functional-requirements)

Before defining your non-functional requirements in an interview, it's wise to inquire about the scale of the system as this will have a meaningful impact on your design. In this case, we'll be looking at a system handling about 10,000 transactions per second (TPS) at peak load.

## The Set Up

### [Defining the Core Entities](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#core-entities-2-minutes)

### [API or System Interface](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#api-or-system-interface-5-minutes)

## [High-Level Design](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#high-level-design-10-15-minutes)

### 1) Merchants should be able to initiate payment requests

### 2) Users should be able to pay for products with credit/debit cards.

### 3) The system should provide status updates for payments

## [Potential Deep Dives](https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery#deep-dives-10-minutes)

### 1) The system should be highly secure

### 2) The system should guarantee durability and auditability with no transaction data ever being lost, even in case of failures.

### 3) The system should guarantee transaction safety and financial integrity despite the inherently asynchronous nature of external payment networks

### 4) The system should be scalable to handle high transaction volume (10,000+ TPS)

#### Servers

#### Kafka

#### Database

## Bonus Deep Dives

### 1) How can we expand the design to support Webhooks?

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

Defining the Core Entities

](#defining-the-core-entities)[

API or System Interface

](#api-or-system-interface)[

High-Level Design

](#high-level-design)[

1) Merchants should be able to initiate payment requests

](#1-merchants-should-be-able-to-initiate-payment-requests)[

2) Users should be able to pay for products with credit/debit cards.

](#2-users-should-be-able-to-pay-for-products-with-credit-debit-cards)[

3) The system should provide status updates for payments

](#3-the-system-should-provide-status-updates-for-payments)[

Potential Deep Dives

](#potential-deep-dives)[

1) The system should be highly secure

](#1-the-system-should-be-highly-secure)[

2) The system should guarantee durability and auditability with no transaction data ever being lost, even in case of failures.

](#2-the-system-should-guarantee-durability-and-auditability-with-no-transaction-data-ever-being-lost-even-in-case-of-failures)[

3) The system should guarantee transaction safety and financial integrity despite the inherently asynchronous nature of external payment networks

](#3-the-system-should-guarantee-transaction-safety-and-financial-integrity-despite-the-inherently-asynchronous-nature-of-external-payment-networks)[

4) The system should be scalable to handle high transaction volume (10,000+ TPS)

](#4-the-system-should-be-scalable-to-handle-high-transaction-volume-10-000-tps)[

Bonus Deep Dives

](#bonus-deep-dives)[

1) How can we expand the design to support Webhooks?

](#1-how-can-we-expand-the-design-to-support-webhooks)[

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