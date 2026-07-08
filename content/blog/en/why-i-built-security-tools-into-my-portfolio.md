---
title: "Why my portfolio has a security tools section"
description: "Password checkers, port scanners, and header validators aren't the usual portfolio fare — here's why I built them anyway."
date: "2026-06-20"
tags: ["Security", "Next.js", "Portfolio"]
---

Most portfolios are a grid of projects and a contact form. Mine has that too, but it also has a `/tools` section with a port scanner, an HTTP headers validator, a password strength checker, and a few other small security utilities. That wasn't an accident.

## Show, don't just tell

Anyone can write "interested in cybersecurity" on a CV. It's a much stronger signal to ship a tool that actually validates HTTP security headers against a real target, or scans a host's open ports within the constraints of the browser's CORS model. It forces you to actually understand the thing you claim to know, edge cases included.

## Constraints made the tools better

Building these inside a Next.js app came with real constraints:

- No arbitrary server-side requests to user-supplied hosts without guarding against SSRF — every tool that fetches a target URL runs through a shared host-blocking check first.
- Rate limiting on every route that talks to an external target, so the tools stay usable without becoming an abuse vector.
- Every tool needed to degrade gracefully — if a target blocks the request, times out, or returns something unexpected, the UI should explain that clearly instead of hanging.

Those constraints are exactly the kind of thing that shows up in real security work, so building them properly here doubled as practice.

## What's next

I'm planning to add a couple more tools — a JWT decoder and a basic subdomain enumeration helper are on the list. If you want to see the current set, they're all live under [Tools](/en/tools).
