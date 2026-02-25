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
| `payee_id` | Filter by payee ID |
| `created_after` | Return payouts created after this timestamp (ISO-8601 UTC) |
| `created_before` | Return payouts created before this timestamp (ISO-8601 UTC) |
| `limit` | Maximum number of results (default: 20, max: 100) |
| `next_cursor` | Pagination cursor from a previous response |

## Cancellations

You can request cancellation of a payout using the `POST /v1/payouts/{payout_id}/cancel` endpoint.

### Key Points

- Cancellation requests are processed asynchronously
- If the payout has not been processed yet, it will be cancelled without any money transfer (`CANCELLED`)
- If the payout was successful, Remitly will attempt to claw back the funds (`CANCELLED_WITH_CLAWBACK` or `CANCELLATION_FAILED`)
- Cancellation requests are not accepted for payouts processed more than 120 days ago
- The `completed_amount` field shows the net amount paid to the payee after any clawbacks

### Cancellation Lifecycle

```mermaid
sequenceDiagram
    participant Client
    participant Remitly Platform API
    participant Remitly Platform

    Client->>Remitly Platform API: POST /v1/payouts/{payout_id}/cancel
    Remitly Platform API-->>Client: 200 OK (CANCELLATION_REQUESTED)

    Remitly Platform->>Remitly Platform: Process cancellation
    Remitly Platform API-->>Client: Webhook: payout.status_updated (CANCELLED / CANCELLED_WITH_CLAWBACK / CANCELLATION_FAILED)
```

## API Endpoints

For detailed API endpoint documentation including request/response schemas, parameters, and examples, see the [API Reference](/api):

- **Payouts**: Create, retrieve, list, and cancel individual payouts
- **Batches**: Create, manage, and execute batch payouts (up to 10,000 payouts per batch)
- **Reports**: Generate and download settlement reports

## Next Steps

- See the [API Reference](/api) for detailed endpoint documentation
- Learn about [Webhooks](./webhooks) for real-time status updates
- Review [Status Lifecycle](../reference/status-lifecycle) for state transitions

