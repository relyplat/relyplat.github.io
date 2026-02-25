---
sidebar_position: 2
title: Authentication & Security
---

# Authentication & Security

The Remitly Platform API uses industry-standard security protocols to ensure your data remains protected.

## 1. Authenticating Your Requests

To call the Remitly Platform API, you must provide a **Bearer Token** in the `Authorization` header of every request. These tokens are issued by the **Remitly Platform Auth Service**.

### Step 1: Obtain Credentials

During onboarding, Remitly will securely provide you with:

* `client_id`: A unique identifier for your application
* `client_secret`: A confidential string used to request tokens
* `auth_url`: The endpoint used to exchange credentials for tokens

### Step 2: Request an Access Token

Exchange your credentials for a short-lived JSON Web Token (JWT). We recommend caching this token until it is close to expiry (typically 1 hour) to avoid unnecessary network overhead.

### Step 3: Use the Token

Include the `access_token` in the `Authorization` header of your API calls:

```
GET /v1/payees
Authorization: Bearer eyJhbGci...
```

## 2. Verifying Webhooks

When Remitly sends a webhook to your configured endpoint, you must verify that the request originated from Remitly and that the payload has not been tampered with. We use **Versioned HMAC-SHA256** signatures to support zero-downtime secret rotation.

### Step 1: Retrieve Your Webhook Secret

Remitly provides a unique **Webhook Signing Secret** for each environment. We recommend your implementation supports a **list of secrets** to allow for seamless rotation.

### Step 2: Inspect the Headers

Each webhook request contains two critical headers:

* `X-Remitly-Signature`: One or more comma-separated signatures, prefixed by a version (e.g., `v1=hash1, v1=hash2`)
* `X-Remitly-Timestamp`: An ISO-8601 timestamp of when the request was sent

### Step 3: Verify the Signature

To verify the request, follow these steps in your backend:

1. **Prevent Replay Attacks:** Compare the `X-Remitly-Timestamp` to your current system time. Reject requests older than **300 seconds**.

2. **Prepare the Signature Base:** Concatenate the timestamp and the raw JSON request body using a period (`.`) as a separator:
   ```
   string_to_sign = timestamp + "." + raw_request_body
   ```

3. **Compute and Compare:**
   * Generate a local HMAC-SHA256 hash of the `string_to_sign` using your active secret
   * Compare your generated hash against the values in the `X-Remitly-Signature` header
   * If you are rotating secrets, repeat this for your "previous" secret. If any match is found, the request is valid

:::warning
Always use a **constant-time string comparison** function (like `timingSafeEqual`) to prevent timing attacks.
:::

### Example Verification Code

```javascript
import { createHmac, timingSafeEqual } from 'crypto';

export const verifyWebhook = (
  payload: string,
  signature: string,
  timestamp: string,
  secrets: string[]
): boolean => {
  // Check timestamp is within 300 seconds
  const requestTime = new Date(timestamp).getTime();
  const now = Date.now();
  if (Math.abs(now - requestTime) > 300000) {
    return false;
  }

  // Prepare the signature base
  const stringToSign = timestamp + '.' + payload;

  // Extract signatures from header (format: "v1=hash1, v1=hash2")
  const signatures = signature.split(',').map(s => s.trim().split('=')[1]);

  // Check against all active secrets
  for (const secret of secrets) {
    const expectedHash = createHmac('sha256', secret)
      .update(stringToSign)
      .digest('hex');

    for (const sig of signatures) {
      const sigBuffer = Buffer.from(sig, 'hex');
      const expectedBuffer = Buffer.from(expectedHash, 'hex');
      if (sigBuffer.length === expectedBuffer.length &&
          timingSafeEqual(sigBuffer, expectedBuffer)) {
        return true;
      }
    }
  }

  return false;
};
```

## Security Best Practices

* **Secret Storage:** Store all `client_secret` and Webhook Secrets in a secure vault (e.g., AWS Secrets Manager, HashiCorp Vault)
* **Zero-Downtime Rotation:** When rotating a secret, keep the old secret active in your code for 24 hours while Remitly transitions to the new one
* **HTTPS Only:** All communication must use HTTPS
* **Token Caching:** Cache access tokens until close to expiry to minimize auth requests

## Additional Security Mechanisms

Additional security mechanisms can be provided based on the specific requirements of our partners. For more details, please reach out to your account manager.

