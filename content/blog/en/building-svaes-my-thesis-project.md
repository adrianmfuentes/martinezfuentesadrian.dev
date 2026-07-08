---
title: "Building SVAES: automating software delivery verification for my thesis"
description: "How I designed a multi-tenant verification platform with a FastAPI backend, an Angular frontend, and a Rust verification engine for my final degree project."
date: "2026-06-01"
tags: ["FastAPI", "Angular", "Rust", "Thesis"]
---

For my final degree project I wanted to solve a problem I'd actually seen in practice: teams shipping software across multiple external systems with no automatic way to verify that a delivery was coherent, complete, and internally consistent. That became SVAES — an automated software delivery verification system.

## The shape of the problem

Most verification in these workflows happens manually: someone opens a spreadsheet, cross-checks a few files, and signs off. It scales badly and it's easy to miss something subtle, like a version mismatch between a manifest and the actual artifact being shipped.

SVAES needed to:

- Ingest deliveries from multiple external systems, each with its own format quirks.
- Run a set of verification rules against each delivery, tenant by tenant.
- Surface actionable results instead of a wall of logs.

## Why three different stacks

The architecture ended up multi-tenant on purpose, and each piece uses the tool best suited to it:

- **FastAPI** backend for the orchestration layer — tenant management, delivery ingestion, and the API surface the frontend talks to.
- **Angular** frontend, mostly because the verification results needed a dense, table-heavy UI that benefits from Angular's structure at that scale.
- **Rust** for the actual verification engine. Coherence checks over large deliveries are CPU-bound, and I wanted predictable performance without fighting a garbage collector.

## What I'd do differently

If I started over, I'd invest earlier in a shared schema between the Rust engine and the FastAPI layer — I ended up hand-syncing a few data shapes between them, which is exactly the kind of manual step SVAES itself is supposed to eliminate. A little ironic, but a good lesson in eating your own dog food.

You can see SVAES live in the [portfolio section](/en/portfolio), or check the code on [GitHub](https://github.com/adrianmfuentes/SVAES).
