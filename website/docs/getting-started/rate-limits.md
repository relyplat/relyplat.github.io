---
sidebar_position: 5
title: Rate Limits
---

# Rate Limits

Usage is limited to **100 requests per second (RPS)** per account. Exceeding this will result in a `429 Too Many Requests` response.

## Best Practices

- Implement exponential backoff when you receive a `429` response
- Distribute your requests evenly over time rather than sending bursts
- Use batch operations when possible to reduce the number of API calls
- Monitor your usage to stay within limits

## Response Headers

When you approach or exceed the rate limit, the API will include the following headers in the response:

- `X-RateLimit-Limit`: The maximum number of requests allowed per second
- `X-RateLimit-Remaining`: The number of requests remaining in the current window
- `X-RateLimit-Reset`: The time when the rate limit window resets (Unix timestamp)

## Example 429 Response

```json
{
  "error_type": "rate_limit_error",
  "error_code": "rate_limit_exceeded",
  "message": "Too many requests. Please retry after the indicated time."
}
```

