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

### payee.created

Fired when a payee is created.

**Example Payload**

```json
{
  "id": "evt_101",
  "type": "payee.created",
  "timestamp": "2024-10-01T14:30:00Z",
  "data": {
    "payee_id": "payee123",
    "external_user_id": "externalUser123",
    "status": "active",
    "individual": {
      "personal_information": {
        "first_name": "John",
        "middle_name": "Joe",
        "last_name": "Smith",
        "second_last_name": "Doe",
        "date_of_birth": "1980-01-01"
      },
      "address": {
        "line_1": "123 Test Street",
        "line_2": "Apt 300",
        "postal_code": "00000",
        "city": "Seattle",
        "subdivision": "WA",
        "country": "USA"
      },
      "phone": "+12225550123",
      "email": "john.smith@example.com"
    }
  }
}
```

### payee.status_updated

Fired when an individual payee status changes.

**Example Payload**

```json
{
  "id": "evt_101",
  "type": "payee.status_updated",
  "timestamp": "2024-10-01T14:30:00Z",
  "data": {
    "payee_id": "payee123",
    "external_user_id": "externalUser123",
    "status": "active",
    "individual": {
      "personal_information": {
        "first_name": "John",
        "middle_name": "Joe",
        "last_name": "Smith",
        "second_last_name": "Doe",
        "date_of_birth": "1980-01-01"
      },
      "address": {
        "line_1": "123 Test Street",
        "line_2": "Apt 300",
        "postal_code": "00000",
        "city": "Seattle",
        "subdivision": "WA",
        "country": "USA"
      },
      "phone": "+12225550123",
      "email": "john.smith@example.com"
    }
  }
}
```

### payout.status_updated

Fired when an individual payout changes state.

**Example Payload**

```json
{
  "id": "evt_101",
  "type": "payout.status_updated",
  "timestamp": "2024-10-01T14:30:00Z",
  "data": {
    "id": "pay_alpha",
    "external_payout_id": "external_payout_123",
    "status": "SUCCESSFUL",
    "amount": "100.00",
    "currency": "USD",
    "metadata": { "bonus_id": "B-99" },
    "created_at": "2024-10-01T12:05:00Z"
  }
}
```

### batch.status_updated

Fired when the batch changes state.

**Example Payload**

```json
{
  "id": "evt_202",
  "type": "batch.status_updated",
  "timestamp": "2024-10-01T16:00:00Z",
  "data": {
    "id": "bat_9921",
    "status": "COMPLETED",
    "total_transferred_amount": "50000.00",
    "currency": "USD",
    "created_at": "2024-10-01T12:00:00Z"
  }
}
```

## Best Practices

- **Verify signatures**: Always verify the webhook signature before processing
- **Respond quickly**: Return a 2xx status code within 10 seconds
- **Process asynchronously**: Queue webhook events for processing to avoid timeouts
- **Handle duplicates**: Webhooks may be sent more than once; use the event `id` to deduplicate
- **Monitor failures**: Implement logging and alerting for webhook processing failures

