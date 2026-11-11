---
title: Onchain Indexer
order: 1
summary: An Ethereum event indexer that keeps up with the finalized head on a $15 a month AWS budget.
year: "2026"
status: In development
role: Design, build, operations
stack: [Python, Postgres, AWS, Terraform, pytest, GitHub Actions]
links:
  - label: GitHub
    href: https://github.com/andrewvern/onchain-indexer
metrics:
  - value: $15
    label: Hard monthly AWS cap
  - value: $10.7–11.6
    label: Paper estimate per month, pre-tax
  - value: 350+
    label: Automated tests, unit and integration
  - value: "1"
    label: t4g.small runs the database, ingestion and jobs
pipeline:
  - label: JSON-RPC
    note: eth_getLogs, paid and rate-limited
  - label: Ingestion loop
    note: commit, resize, retry, quarantine or halt
  - label: Bronze
    note: first response kept, gzip in S3
  - label: Silver
    note: generic logs, replayable
  - label: Gold
    note: registry-driven decoding in SQL
  - label: Static dashboard
    note: hourly rollups, S3 and CloudFront
---

## Problem

Indexing Ethereum events is usually solved by paying for it: a managed indexer, or a full node with around 2 TB of SSD. I ruled out both. The indexer has to follow USDT, USDC and the Aave V3 pool through a paid, rate-limited RPC provider, keep up with the finalized head around the clock, and fit under a hard cap of $15 a month on AWS.

With those limits, every design choice is judged on four numbers: dollars per month, RPC calls per block, bytes per log, and lag to the finalized head.

## Approach

**Bronze first.** The first RPC response for each contract and block range is stored untouched. Silver and gold are rebuilt from it without another RPC call, so a decoding bug costs compute and no provider spend. Bronze sits as gzip files in S3 for 13 months at about $0.20 a month.

**A loop that classifies every response.** Each fetch ends in one of five outcomes: commit, shrink or grow the block span, retry with backoff, quarantine, or halt. A halt is recorded per stream with diagnostic evidence, and the stream refuses to restart until someone clears it with a note on what was fixed. Other streams keep running.

**Decoding in SQL.** Ingestion knows nothing about ABIs. A signature registry drives positional decoding in SQL, and each contract's meaning lives in gold. Adding a contract is a registry row and a gold view.

**One small box.** A single t4g.small runs Postgres, ingestion and the hourly jobs. It has no public IPv4 address and no NAT gateway; outbound traffic leaves over IPv6 and S3 goes through a gateway endpoint. The public dashboard is static: the server writes rollup files to S3 each hour and CloudFront serves them, so visitors never reach the server.

**Operations as code.** A stall check alerts when a checkpoint stops moving. Contract control events such as a proxy upgrade trigger an alert, since they can break decoding without an error. A daily backup carries a row-count manifest, and a restore drill rebuilds a fresh database from the dump plus bronze and compares counts. A parity check diffs the live schema against the DDL in the repository.

## Result

The pipeline runs locally from RPC to gold, with hourly rollups and a static-site export. The AWS stack is written in Terraform with systemd units for each job. Go-live waits on a validation test of memory, storage, backup restore, IPv6 egress and real charges, run before committing to a Savings Plan.

Still to come: the public dashboard, SMS alerting on halts, and a cost view that reports actual spend against the cap.
