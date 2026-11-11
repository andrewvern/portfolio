---
title: EDGAR Events
order: 2
summary: SEC 8-K filings turned into typed, entity-resolved event rows, with evals and a cost ledger you can audit.
year: "2026"
status: In development
role: Design, build, evaluation
stack: [Python, Claude API, AWS Step Functions, Lambda, DuckDB, Terraform]
links: []
metrics:
  - value: $15
    label: Hard monthly cap, cloud and model APIs combined
  - value: ~2,700
    label: Filing items per month, measured
  - value: "4"
    label: 8-K item types in scope
  - value: 10/s
    label: SEC fair-access request ceiling
pipeline:
  - label: SEC EDGAR
    note: 8-K header and primary document
  - label: Bronze
    note: throttled fetch, replayable
  - label: Contract gate
    note: schema checks, quarantine path
  - label: LLM extraction
    note: keyed by content, model and prompt version
  - label: Entity resolution
    note: rules, embeddings, then LLM
  - label: Evals and dataset
    note: golden set, cost and freshness lines
---

## Problem

Companies announce material events in 8-K filings within days: new agreements, officer changes, bankruptcies. The facts sit in narrative HTML, with no structured tags to read them from. Vendors charge thousands of dollars per seat for the structured version.

The goal is a public dataset, refreshed daily, where each 8-K item becomes typed rows (event type, dates, counterparties, amounts, named officers), filers and counterparties resolve to canonical entities, and every published number carries its accuracy and its cost. All of it has to run under $15 a month.

## Approach

**Versioned, idempotent enrichment.** Each extracted row is keyed by a hash of the content, model, prompt version, schema version and parameters. Bumping a prompt marks only the affected rows stale, and the backfill is selective.

**Entity resolution in tiers.** Rules and probabilistic matching handle the easy pairs. Embedding blocking narrows what is left. An LLM adjudicates only the uncertain band, and the result is reported as F1 and dollars per 1,000 pairs.

**Evals before trust.** A hand-labeled golden set scores value accuracy with confidence intervals. A judge regression test and a forced model-swap diff catch drift when a model or prompt changes.

**A cost ledger at list price.** Every model call lands on the ledger at list price, even when a credit pays for it, so the published cost line reflects what the pipeline would cost anyone.

**Contracts and lineage.** A contract gate with a quarantine path sits between bronze and extraction. Lineage is emitted as OpenLineage events with a custom facet for LLM calls.

**Serverless on a schedule.** EventBridge triggers Step Functions, which runs Lambda steps over Parquet in S3. DuckDB builds the rollups and CloudFront serves a static dashboard.

## Result

The SEC client, throttle, bronze store, item parser, enrichment keys and cost ledger are built and tested. A live run against EDGAR measured about 2,700 in-scope items a month across items 1.01, 1.03, 5.02 and 8.01, which sized the model budget. Item 2.02 was dropped after measurement showed its text is a stub pointing to an exhibit.

Next: reference extractions with a strong model, the golden set, judge calibration, then production hardening on AWS.
