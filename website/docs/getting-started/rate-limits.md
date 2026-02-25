---
sidebar_position: 5
title: Rate Limits
---

# Rate Limits

API usage is rate-limited per account. Exceeding these limits will result in a `429 Too Many Requests` response.

## Rate Limits by Category

| Category | Description | Rate Limit |
|:---------|:------------|:-----------|
| **GET by ID** | Retrieve a single resource | 5,000 RPM |
| **GET with pagination** | List or search resources | 500 RPM |
| **POST (standard)** | Create or cancel operations | 200 RPM |
| **POST (controlled)** | Registration sessions, batch execution | 100 RPM |
| **POST (resource-intensive)** | Bulk operations, report generation | 50 RPM |

## Best Practices

- Implement exponential backoff when you receive a `429` response
- Distribute your requests evenly over time rather than sending bursts
- Use batch operations when possible to reduce the number of API calls
- Monitor your usage to stay within limits


