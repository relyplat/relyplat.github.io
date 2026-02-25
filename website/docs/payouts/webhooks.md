---
sidebar_position: 2
title: Webhooks
---

# Webhooks

Remitly Platform sends webhook notifications to your registered endpoint when significant events occur. Webhooks are signed using the ECDSA P-256 with SHA-256 scheme described in the [Authentication & Security](../getting-started/authentication) section. You must verify the signature of incoming webhooks before processing them.

## Registering Your Endpoint

To register your webhook endpoint, contact Remitly Platform with your HTTPS endpoint URL. Your endpoint must:

- Accept POST requests with JSON payloads  
- Return a 2xx status code within 10 seconds to acknowledge receipt  
- Verify the request signature using Remitly Platform's public key

## Webhook Events

The following webhook events are sent when significant state changes occur:

### payee.created

Fired when a payee successfully completes onboarding and a Payee resource is created.

### payee.status_updated

Fired when a payee's status changes (e.g., `pending` → `active`, `active` → `restricted`).

### payout.status_updated

Fired when an individual payout changes state (e.g., `PENDING` → `SUCCESSFUL`, `PENDING` → `FAILED`).

### batch.status_updated

Fired when a batch changes state (e.g., `INITIALIZED` → `PROCESSING`, `PROCESSING` → `COMPLETED`).

### report.status_updated

Fired when a report's status changes to a terminal state (`COMPLETED` or `FAILED`). When successful, the payload includes a `download_url` for retrieving the report.

## Webhook Payload Schema

For detailed webhook payload schemas and examples, see the [API Reference](/api#tag/Webhooks).

## Best Practices

- **Verify signatures**: Always verify the webhook signature before processing
- **Respond quickly**: Return a 2xx status code within 10 seconds
- **Process asynchronously**: Queue webhook events for processing to avoid timeouts
- **Handle duplicates**: Webhooks may be sent more than once; use the event `id` to deduplicate
- **Monitor failures**: Implement logging and alerting for webhook processing failures

