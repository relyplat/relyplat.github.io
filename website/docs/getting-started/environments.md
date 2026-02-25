# Environments

Remitly provides separate sandbox and production environments to support your integration journey.

## Sandbox Environment

During onboarding, Remitly will provision a **sandbox environment** for your organization. The sandbox provides:

- **Full API Access**: All APIs are available in sandbox, including Payees, Payouts, Batches, and Settlement Reports
- **Complete Isolation**: The sandbox is completely isolated from production — no real money movement occurs
- **Safe Testing**: Test your integration, error handling, and edge cases without any risk

## Credentials

Separate credentials are issued for each environment:

| Environment | Credentials |
|-------------|-------------|
| Sandbox | `client_id` and `client_secret` for sandbox |
| Production | `client_id` and `client_secret` for production |

Your sandbox and production credentials are independent. Actions in sandbox do not affect production data, and vice versa.

## Best Practices

- **Develop and test in sandbox first** before moving to production
- **Use realistic test data** to ensure your integration handles all scenarios
- **Test error handling** by simulating failure cases in sandbox
- **Verify webhook handling** works correctly with sandbox events

