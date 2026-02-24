---
sidebar_position: 1
title: Entities
---

# Entities

## Batch

A Batch is a high-level container used to group and manage up to 10,000 payout items.

| Attribute | Type | Description | Example |
|:----------|:-----|:------------|:--------|
| `id` | `string` | `Unique identifier for the batch.` | `bat_55219` |
| `external_batch_id` | `string` | `Your unique identifier for the batch, used for reconciliation.` | `external_batch_123` |
| `status` | `string` | `The current state: INITIALIZED, PROCESSING, CANCEL_REQUESTED, CANCELLED, COMPLETED, COMPLETED_WITH_ERRORS, FAILED.` | `PROCESSING` |
| `total_amount` | `string` | `The target sum of all payouts in decimal base currency units (e.g., "10.00" = $10.00 USD).` | `10500.25` |
| `total_transferred_amount` | `string` | `The sum of payouts that have reached a SUCCESSFUL terminal state, in decimal base currency units.` | `8000.00` |
| `currency` | `string` | `ISO currency code (currently USD).` | `USD` |
| `metadata` | `dictionary` | `Custom key-value pairs associated with the batch.` | `{"dept": "finance"}` |
| `created_at` | `string` | `Timestamp when the batch was created (ISO-8601 UTC).` | `2024-10-01T12:00:00Z` |

## Payout

A Payout represents an individual transfer of funds to a specific recipient.

| Attribute | Type | Description | Example |
|:----------|:-----|:------------|:--------|
| `id` | `string` | `Unique Remitly identifier for the payout.` | `pay_99212` |
| `external_payout_id` | `string` | `The unique identifier you assigned to this payout.` | `external_payout_123` |
| `payee_id` | `string` | `The internal Remitly ID for the recipient.` | `payee123` |
| `status` | `string` | `Current state: PENDING, VALIDATING, SUBMITTED, SUCCESSFUL, FAILED, CANCELLED.` | `SUCCESSFUL` |
| `amount` | `string` | `The amount to be transferred in decimal base currency units (e.g., "10.00" = $10.00 USD).` | `1200.00` |
| `currency` | `string` | `ISO currency code (currently USD).` | `USD` |
| `metadata` | `dictionary` | `Custom key-value pairs for this specific payout.` | `{"bonus_id": "B-99"}` |
| `error` | `object` | `Contains error details if the payout status is FAILED. Includes code (machine-readable error code) and message (human-readable description).` | `{"code": "invalid_routing", "message": "The routing number provided is invalid."}` |
| `created_at` | `string` | `Timestamp when the payout was created (ISO-8601 UTC).` | `2024-10-01T12:00:00Z` |

