---
sidebar_position: 3
title: Versioning
---

# Versioning

The Remitly Platform API uses URL path versioning. The current version is `v1`.

## Versioning Policy

- **Major versions** (v1, v2, etc.) may contain breaking changes and are indicated in the URL path  
- **Minor updates** within a version are backward-compatible  
- **Migration guides** will be provided when new major versions are released

All endpoints are prefixed with the version.

## Example

```
https://api.remitly.com/v1/payouts
https://api.remitly.com/v1/batches
https://api.remitly.com/v1/registration-sessions
```

