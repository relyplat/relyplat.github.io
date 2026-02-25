---
sidebar_position: 1
title: Overview
---

# Getting Started

Welcome to the Remitly Platform API documentation. The Remitly Platform API enables partners to programmatically manage payee registration, payouts, batches, and settlement reports.

## API Version

The current version is `v1`. All endpoints are prefixed with the version (e.g., `/v1/payouts`).

## Key Features

- **Payee Onboarding**: Streamlined registration and KYC/KYB compliance
- **Flexible Payouts**: Support for standalone payouts and batch processing (up to 10,000 items)
- **Idempotency**: Safe retry mechanism for all state-changing operations
- **Webhooks**: Real-time notifications for status changes
- **Settlement Reports**: Comprehensive reporting for reconciliation

## Quick Links

- [Authentication & Security](./authentication) - Learn how to authenticate your API requests
- [Versioning](./versioning) - Understand our versioning policy
- [Idempotency](./idempotency) - Safely retry requests
- [Rate Limits](./rate-limits) - API usage limits

## Next Steps

1. **Set up authentication** - Follow the [Authentication guide](./authentication) to generate your key pair
2. **Register a payee** - Use the [Payee Registration API](../payee-registration) to onboard users
3. **Create payouts** - Send funds using the [Payouts API](../payouts)
4. **Monitor status** - Set up [webhooks](../payouts/webhooks) to receive real-time updates

