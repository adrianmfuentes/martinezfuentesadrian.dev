---
title: "Why I left Life360 and self-hosted OwnTracks instead"
description: "Life360 sells granular location data to third parties by default. I moved location sharing with friends to OwnTracks, self-hosted on my own Oracle Ampere A1 server."
date: "2026-08-05"
tags: ["Privacy", "Self-hosting", "MQTT"]
---

I used Life360 the way most people my age do: to coordinate with friends when we're meeting up, instead of sending a live location pin in a WhatsApp chat that stays open forever. It works, but it means trusting a venture-backed company whose business model depends on monetizing exactly the data it's collecting — location history for everyone in your circle, tracked continuously, not just when you choose to share it.

Life360 has been reported selling anonymized-but-re-identifiable location data to data brokers, and it's had breaches exposing user data through third-party integrations. None of that is a one-off failure; it's the natural consequence of a free app whose core asset is precise location history. I already run a server for this site, so paying a company to hold that data for me stopped making sense — I could just hold it myself.

## OwnTracks instead of a location-sharing app

[OwnTracks](https://owntracks.org/) is an open-source location tracker: an app for iOS and Android that publishes your GPS position, and a backend that receives and stores it. There's no vendor in the middle. It supports two transports — HTTP or MQTT — and I went with MQTT because it's built for exactly this: lightweight pub/sub messaging where a phone publishes a location update and only the clients subscribed to that topic receive it.

The stack is two containers, both on the same Oracle Ampere A1 box everything else here runs on:

- **Mosquitto** as the MQTT broker, with per-user credentials and ACLs so each friend's phone can only publish to their own topic and only read the topics they've been given access to.
- **OwnTracks Recorder**, which subscribes to those topics, persists the location history, and serves a small web UI to view everyone's last known position on a map.

Nginx Proxy Manager sits in front, terminating TLS and reverse-proxying both the MQTT-over-WebSockets endpoint and the Recorder's HTTP UI, so nothing talks to the broker over plaintext from outside the server.

## What this actually replaces

The point was never continuous tracking — it's the opposite of what made me leave Life360. The app can report location periodically or only on request, and each friend controls their own topic and can stop publishing whenever they want, since it's their credentials and their app settings. What it replaces is the specific moment where someone types "compárteme la ubi" in a WhatsApp group and the location stays pinned in that chat for hours, visible to everyone in it and stored on WhatsApp's servers. Now that data lives on infrastructure I control, gets deleted on a schedule I set, and was never in a position to be sold in the first place.
