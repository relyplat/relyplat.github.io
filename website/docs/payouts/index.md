---
sidebar_position: 1
title: Overview
---

# Payouts

## Payout Lifecycle

### Standalone Payout

```mermaid
sequenceDiagram
    participant Client
    participant Remitly Platform API
    participant Remitly Platform

    Client->>Remitly Platform API: POST /v1/payouts
    Remitly Platform API-->>Client: 201 Created (PENDING)

    Remitly Platform->>Remitly Platform: Process payout
    Remitly Platform API-->>Client: Webhook: payout.status_updated (SUCCESSFUL)
```

### Batch Payouts

```mermaid
sequenceDiagram
    participant Client
    participant Remitly Platform API
    participant Remitly Platform

    rect rgb(230, 245, 255)
        Note right of Client: Initialize Batch
        Client->>Remitly Platform API: POST /v1/batches
        Remitly Platform API-->>Client: 201 Created (INITIALIZED)
    end

    rect rgb(230, 255, 230)
        Note right of Client: Add Payouts (can be called multiple times)
        Client->>Remitly Platform API: POST /v1/batches/{id}/payouts
        Remitly Platform API-->>Client: 201 Created
    end

    rect rgb(255, 245, 230)
        Note right of Client: Execute Batch
        Client->>Remitly Platform API: PATCH /v1/batches/{id} {status: PROCESSING}
        Remitly Platform API-->>Client: 200 OK (PROCESSING)
    end

    Remitly Platform->>Remitly Platform: Process all payouts
    Remitly Platform API-->>Client: Webhook: payout.status_updated (per payout)
    Remitly Platform API-->>Client: Webhook: batch.status_updated (COMPLETED)
```

## List Payouts

You can retrieve a paginated list of payouts using the `GET /v1/payouts` endpoint with optional filters:

| Parameter | Description |
|-----------|-------------|
| `type` | Filter by payout type: `PAYOUT` or `REVERSAL` |
| `payee_id` | Filter by payee ID |
| `created_after` | Return payouts created after this timestamp (ISO-8601 UTC) |
| `created_before` | Return payouts created before this timestamp (ISO-8601 UTC) |
| `limit` | Maximum number of results (default: 100, max: 1000) |
| `next_cursor` | Pagination cursor from a previous response |

## Reversals

A reversal creates a new payout with a negative amount to reverse a previously successful payout.

### Key Points

- Only payouts with status `SUCCESSFUL` can be reversed
- Only standard payouts can be reversed (reversals cannot be reversed)
- Only one reversal is allowed per payout
- The reversal amount equals the original payout amount (or available amount if less)
- Reversals follow the same lifecycle as standard payouts
- Reversals appear in reports with negative amounts

### Reversal Lifecycle

```mermaid
sequenceDiagram
    participant Client
    participant Remitly Platform API
    participant Remitly Platform

    Client->>Remitly Platform API: POST /v1/payouts/{payout_id}/reverse
    Remitly Platform API-->>Client: 201 Created (PENDING)

    Remitly Platform->>Remitly Platform: Process reversal
    Remitly Platform API-->>Client: Webhook: payout.status_updated (SUCCESSFUL)
```

## API Endpoints

For detailed API endpoint documentation including request/response schemas, parameters, and examples, see the [API Reference](/api):

- **Payouts**: Create, retrieve, list, and reverse individual payouts
- **Batches**: Create, manage, and execute batch payouts (up to 10,000 payouts per batch)
- **Reports**: Generate and download settlement reports

## Next Steps

- See the [API Reference](/api) for detailed endpoint documentation
- Learn about [Webhooks](./webhooks) for real-time status updates
- Review [Status Lifecycle](../reference/status-lifecycle) for state transitions

