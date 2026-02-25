---
sidebar_position: 4
title: Errors
---

# Errors

## Error Object

| Attribute | Type | Description | Example |
|:----------|:-----|:------------|:--------|
| `error_type` | `string` | `Category: invalid_request_error, authentication_error, idempotency_error, rate_limit_error, or api_error.` | `invalid_request_error` |
| `error_code` | `string` | `Machine-readable code identifying the specific error.` | `parameter_missing` |
| `message` | `string` | `Human-readable description.` | `The total_amount field is required.` |

## Common Error Codes

| Code | Description |
|:-----|:------------|
| `invalid_request` | `The request body is malformed or missing required fields.` |
| `invalid_parameter` | `A parameter value is invalid or out of range.` |
| `authentication_failed` | `The request signature is invalid or expired.` |
| `authorization_failed` | `The auth context does not have permission for this operation.` |
| `resource_not_found` | `The requested resource (batch, payout, report) does not exist.` |
| `duplicate_request` | `A request with this idempotency key has already been processed.` |
| `rate_limit_exceeded` | `Too many requests. Retry after the indicated time.` |
| `batch_not_editable` | `The batch is no longer in INITIALIZED state and cannot be modified.` |
| `insufficient_funds` | `The account does not have sufficient balance for this operation.` |
| `invalid_routing` | `The recipient's routing number is invalid.` |
| `invalid_account` | `The recipient's account number is invalid.` |
| `recipient_rejected` | `The recipient's bank rejected the transfer.` |
| `internal_error` | `An unexpected error occurred. Contact support if this persists.` |

## Example Error Response

```json
{
  "error_type": "invalid_request_error",
  "error_code": "parameter_missing",
  "message": "The total_amount field is required."
}
```

## HTTP Status Codes

| Status Code | Description |
|:------------|:------------|
| `200 OK` | The request was successful |
| `201 Created` | A new resource was successfully created |
| `400 Bad Request` | The request was invalid or malformed |
| `401 Unauthorized` | Authentication failed or credentials are missing |
| `403 Forbidden` | The authenticated user does not have permission |
| `404 Not Found` | The requested resource does not exist |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | An unexpected error occurred on the server |
| `503 Service Unavailable` | The service is temporarily unavailable |

## Error Handling Best Practices

- **Log all errors**: Capture error responses for debugging and monitoring
- **Implement retry logic**: Use exponential backoff for transient errors (500, 503)
- **Validate before sending**: Check request parameters client-side to reduce 400 errors
- **Monitor error rates**: Set up alerts for unusual error patterns
- **Handle idempotency**: Use the `Idempotency-Key` header to safely retry failed requests

