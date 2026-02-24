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


