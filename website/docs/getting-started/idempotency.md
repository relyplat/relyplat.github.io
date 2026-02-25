---
sidebar_position: 4
title: Idempotency
---

# Idempotency

The Remitly Platform API supports idempotency for safely retrying requests without accidentally performing the same operation twice. This is useful when an API call is disrupted in transit and you do not receive a response.

## How to Use Idempotency

- Include the `Idempotency-Key` header with a unique UUID v4 value on POST and PATCH requests  
- Idempotency keys are stored for **24 hours**  
- If you retry a request with the same idempotency key within 24 hours, the API returns the cached response from the original request  
- After 24 hours, the key expires and a new request with the same key will be treated as a new operation

## Important Behaviors

- If you submit a request with the same idempotency key but different request parameters, the API returns a `duplicate_request` error  
- Only the response from the first successful request is cached; errors (except for `500` errors) are not cached  
- Idempotency keys are scoped to your account—different accounts can use the same key without conflict

## Best Practices

- Generate a new UUID v4 for each unique operation  
- Store the idempotency key client-side until you receive a definitive success or failure response  
- Use idempotency keys for all operations that create or modify resources (e.g., creating batches, adding payouts)

## Example

```bash
curl -X POST /v1/payouts \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "external_payout_id": "payout_123",
    "payee_id": "payee_456",
    "amount": "100.00",
    "currency": "USD"
  }'
```

If this request fails due to a network error, you can safely retry it with the same `Idempotency-Key` and receive the same response without creating a duplicate payout.

