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

## API Endpoints

For detailed API endpoint documentation including request/response schemas, parameters, and examples, see the [API Reference](/relyplat):

- **Payouts**: Create and retrieve individual payouts
- **Batches**: Create, manage, and execute batch payouts (up to 10,000 payouts per batch)
- **Reports**: Generate and download settlement reports

## Next Steps

- See the [API Reference](/relyplat) for detailed endpoint documentation
- Learn about [Webhooks](./webhooks) for real-time status updates
- Review [Status Lifecycle](../reference/status-lifecycle) for state transitions

