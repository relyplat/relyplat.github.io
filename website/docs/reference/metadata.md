---
sidebar_position: 3
title: Metadata
---

# Metadata

Some Remitly Platform API endpoints accept a `metadata` object that stores additional information about a resource with custom fields.

## Supported Field Types

- String  
- Number  
- Boolean

**Note:** Arrays and nested objects are not supported within metadata.

## Constraints

- You can provide up to **10 metadata fields** per resource  
- The value of each field must not exceed **255 characters** in length

Metadata is useful for storing custom reference IDs, tags, or any additional context needed for reporting and reconciliation purposes.

## Example

```json
{
  "external_payout_id": "payout_123",
  "payee_id": "payee_456",
  "amount": "100.00",
  "currency": "USD",
  "metadata": {
    "invoice_id": "INV-2024-001",
    "department": "engineering",
    "project_code": "PROJ-789",
    "is_bonus": true,
    "quarter": 1
  }
}
```

## Best Practices

- Use consistent key naming conventions across your organization
- Store only essential metadata to stay within the 10-field limit
- Avoid storing sensitive information in metadata fields
- Use metadata for filtering and reporting in your internal systems

