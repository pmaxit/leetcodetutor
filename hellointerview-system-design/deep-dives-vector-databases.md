# Vector Databases Deep Dive for System Design Interviews | Hello Interview System Design in a Hurry

URL: https://www.hellointerview.com/learn/system-design/deep-dives/vector-databases

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

# Vector Databases

Learn how vector databases power similarity search, recommendations, and AI applications in system design.

* * *

If you've been paying attention to anything in tech over the past few years, you've noticed "embeddings" everywhere. Search engines that actually understand what you mean. Recommendation systems that surface eerily relevant content. Chatbots that can retrieve information from massive document collections. All of these rely on the same underlying primitive: finding things that are _similar_ to other things, fast.

This isn't actually a new concept. Vector databases and their related techniques have been around for a long time in recommendation systems. But the power of vector databases has been amplified by the rise of new machine learning techniques and it unlocks a cool new set of infra applications.

Traditional databases are great at exact lookups. Give me the user with ID 12345. Find all orders placed on January 1st. But ask a traditional database "find me documents similar to this one" and you're in trouble. That's where vector databases come in.

This deep dive will cover what vector databases are, how they work under the hood, and most importantly, how to use them effectively in a system design interview. We'll go deep on the indexing algorithms that make similarity search fast, but we'll also be practical about when you actually need a dedicated vector database versus when a simple extension to your existing database will do the job.

If the detail here is frightening to you, skip to the applications section at the end and work backwards. Most system design interviews won't cover vector databases. Those that do often don't care that you know the internals of vector databases as much as they care about you knowing how and where to use them.

## What's a Vector Anyway?

Before we talk about databases that store vectors, we need to understand what we're actually storing.

A **vector** (or **embedding**) is just an array of numbers that represents something. That "something" could be a word, a sentence, an image, a user, a product, or really anything you can feed into a machine learning model. The magic is that similar things end up with similar vectors.

```
// Two sentences that mean similar things
"The cat sat on the mat"   → [0.12, -0.34, 0.78, ..., 0.45]  // 1536 numbers
"A feline rested on a rug" → [0.11, -0.32, 0.79, ..., 0.44]  // very similar!

// A sentence with different meaning
"The stock market crashed" → [-0.89, 0.12, -0.45, ..., 0.23] // very different
```

The typical embedding has somewhere between 128 and 1536 dimensions (OpenAI's text-embedding-3-large uses 3072). Each dimension captures some aspect of the meaning, though the individual dimensions aren't usually interpretable by humans. What matters is that the geometric relationships between vectors reflect semantic relationships between the things they represent.

Vector Similarity with just 2 dimensions for visualization (real embeddings have many more!)

Note we're being a bit hand-wavey about "similarity" here. Does similar mean the same color? Or excerpts from the same book? Or a similar concept? Well, that actually depends a bit on the embedding model you're using.

Many applications will use a pre-trained embedding model. For text, this might be something like OpenAI's embedding API, Sentence Transformers, or BERT. For images, models like CLIP or ResNet. These models are trained on diverse tasks such that the notion of similarity you care about is _probably_ captured by the embedding model. Think of it like a very vague "semantic" similarity. For these, to you the embedding model is an expensive GPU function: data goes in, fixed-length vector comes out.

But "similarity" _can_ be much more precise for the application. A very common application for recommendation systems is to find items that are likely to be purchased together. Diapers and bottles are only vaguely similar in the sense they're both related to babies, but _profoundly_ similar in that they're things that new parents are often buying. In these cases, a custom ML model can create these embeddings specifically targeting this idea of "similarity".

Show More

## Similarity Metrics

## The Nearest Neighbor Problem

## How Vector Databases Work

### Indexing Strategies

#### HNSW (Hierarchical Navigable Small World)

#### IVF (Inverted File Index)

#### Locality Sensitive Hashing (LSH)

#### Annoy

### Filtering and Hybrid Search

### Inserts, Updates, and Index Maintenance

## Vector Database Options

### Vector Extensions for Traditional DBs and Stores (Start Here)

### Purpose-Built Vector DBs (When You Need Scale)

## Using Vector Databases in Your Interview

### Common Interview Scenarios

### Architecture Patterns

### Key Design Decisions to Discuss

### Numbers to Know

## Gotchas and Limitations

## Summary

### Purchase Premium to Keep Reading

###### Unlock this article and so much more with Hello Interview Premium

[Buy Premium](/premium/checkout)

###### The best mocks on the market.

Now up to 10% off

[Learn More](/mock/overview)

Reading Progress

On This Page

[

What's a Vector Anyway?

](#what-s-a-vector-anyway)[

Similarity Metrics

](#similarity-metrics)[

The Nearest Neighbor Problem

](#the-nearest-neighbor-problem)[

How Vector Databases Work

](#how-vector-databases-work)[

Indexing Strategies

](#indexing-strategies)[

Filtering and Hybrid Search

](#filtering-and-hybrid-search)[

Inserts, Updates, and Index Maintenance

](#inserts-updates-and-index-maintenance)[

Vector Database Options

](#vector-database-options)[

Vector Extensions for Traditional DBs and Stores (Start Here)

](#vector-extensions-for-traditional-dbs-and-stores-start-here)[

Purpose-Built Vector DBs (When You Need Scale)

](#purpose-built-vector-dbs-when-you-need-scale)[

Using Vector Databases in Your Interview

](#using-vector-databases-in-your-interview)[

Common Interview Scenarios

](#common-interview-scenarios)[

Architecture Patterns

](#architecture-patterns)[

Key Design Decisions to Discuss

](#key-design-decisions-to-discuss)[

Numbers to Know

](#numbers-to-know)[

Gotchas and Limitations

](#gotchas-and-limitations)[

Summary

](#summary)

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