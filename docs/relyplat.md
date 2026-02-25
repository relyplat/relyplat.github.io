# Getting Started

## Authentication & Security

The Remitly Platform API uses industry-standard security protocols to ensure your data remains protected.

### 1\. Authenticating Your Requests

To call the Remitly Platform API, you must provide a **Bearer Token** in the `Authorization` header of every request. These tokens are issued by the **Remitly Platform Auth Service**.

#### Step 1: Obtain Credentials

During onboarding, Remitly will securely provide you with:

* `client_id`: A unique identifier for your application.  
* `client_secret`: A confidential string used to request tokens.  
* `auth_url`: The endpoint used to exchange credentials for tokens.

#### Step 2: Request an Access Token

Exchange your credentials for a short-lived JSON Web Token (JWT). We recommend caching this token until it is close to expiry (typically 1 hour) to avoid unnecessary network overhead.

#### Step 3: Use the Token

Include the `access_token` in the `Authorization` header of your API calls.

```
GET /v1/payees
Authorization: Bearer eyJhbGci...
```

### 2\. Verifying Webhooks

When Remitly sends a webhook to your configured endpoint, you must verify that the request originated from Remitly and that the payload has not been tampered with. We use **Versioned HMAC-SHA256** signatures to support zero-downtime secret rotation.

#### Step 1: Retrieve Your Webhook Secret

Remitly provides a unique **Webhook Signing Secret** for each environment. We recommend your implementation supports a **list of secrets** to allow for seamless rotation.

#### Step 2: Inspect the Headers

Each webhook request contains two critical headers:

* `X-Remitly-Signature`: One or more comma-separated signatures, prefixed by a version (e.g., `v1=hash1, v1=hash2`).  
* `X-Remitly-Timestamp`: An ISO-8601 timestamp of when the request was sent.

#### Step 3: Verify the Signature

To verify the request, follow these steps in your backend:

1. **Prevent Replay Attacks:** Compare the `X-Remitly-Timestamp` to your current system time. Reject requests older than **300 seconds**.  
2. **Prepare the Signature Base:** Concatenate the timestamp and the raw JSON request body using a period (`.`) as a separator: `string_to_sign = timestamp + "." + raw_request_body`  
3. **Compute and Compare:** \* Generate a local HMAC-SHA256 hash of the `string_to_sign` using your active secret.  
* Compare your generated hash against the values in the `X-Remitly-Signature` header.  
* If you are rotating secrets, repeat this for your "previous" secret. If any match is found, the request is valid.

**Note:** Always use a **constant-time string comparison** function (like `timingSafeEqual`) to prevent timing attacks.

### Security Best Practices

* **Secret Storage:** Store all `client_secrets` and Webhook Secrets in a secure vault (e.g., AWS Secrets Manager, HashiCorp Vault).  
* **Zero-Downtime Rotation:** When rotating a secret, keep the old secret active in your code for 24 hours while Remitly transitions to the new one.

## Additional Security Mechanism

Additional security mechanisms can be provided based on the specific requirements of our partners. For more details, please reach out to your account manager.

## Versioning

The Remitly Platform API uses URL path versioning. The current version is `v1`.

#### Versioning Policy

- **Major versions** (v1, v2, etc.) may contain breaking changes and are indicated in the URL path  
- **Minor updates** within a version are backward-compatible  
- **Migration guides** will be provided when new major versions are released

All endpoints are prefixed with the version.

## Idempotency

The Remitly Platform API supports idempotency for safely retrying requests without accidentally performing the same operation twice. This is useful when an API call is disrupted in transit and you do not receive a response.

#### How to Use Idempotency

- Include the `Idempotency-Key` header with a unique UUID v4 value on POST and PATCH requests  
- Idempotency keys are stored for **24 hours**  
- If you retry a request with the same idempotency key within 24 hours, the API returns the cached response from the original request  
- After 24 hours, the key expires and a new request with the same key will be treated as a new operation

#### Important Behaviors

- If you submit a request with the same idempotency key but different request parameters, the API returns a `duplicate_request` error  
- Only the response from the first successful request is cached; errors (except for `500` errors) are not cached  
- Idempotency keys are scoped to your account—different accounts can use the same key without conflict

#### Best Practices

- Generate a new UUID v4 for each unique operation  
- Store the idempotency key client-side until you receive a definitive success or failure response  
- Use idempotency keys for all operations that create or modify resources (e.g., creating batches, adding payouts)

## Rate Limits

Usage is limited to **100 requests per second (RPS)** per account. Exceeding this will result in a 429 Too Many Requests response.

## Environments

Remitly provides separate sandbox and production environments to support your integration journey.

### Sandbox Environment

During onboarding, Remitly will provision a **sandbox environment** for your organization. The sandbox provides:

* **Full API Access**: All APIs are available in sandbox, including Payees, Payouts, Batches, and Settlement Reports
* **Complete Isolation**: The sandbox is completely isolated from production — no real money movement occurs
* **Safe Testing**: Test your integration, error handling, and edge cases without any risk

### Credentials

Separate credentials are issued for each environment. Your sandbox and production credentials are independent. Actions in sandbox do not affect production data, and vice versa.

# Payee Registration & Onboarding

## Payee Lifecycle Overview

The Payee lifecycle defines the progression of a Payee from registration initiation through onboarding, compliance review, and payout eligibility.

```mermaid
sequenceDiagram
    participant User
    participant Etsy
    participant RemitlyFE as Remitly Frontend
    participant RemitlyBE as Remitly Backend

    Note over User,RemitlyBE: Registration Flow

    User->>Etsy: Click "Connect Remitly"
    Etsy->>RemitlyBE: Create registration session
    RemitlyBE-->>Etsy: registration_link
    User->>RemitlyFE: Link opened in new window/tab
    RemitlyFE->>RemitlyBE: Validate token
    User->>RemitlyFE: Complete Remitly Registration
    RemitlyFE->>RemitlyBE: Complete Registration
    RemitlyBE-->>Etsy: Webhook - payee.created
    RemitlyFE->>User: Redirect redirect_url?state=...

    Note over RemitlyBE,User: Async KYC/KYB Flow

    RemitlyBE-->>User: Email - Complete KYC/KYB
    User->>RemitlyFE: Visit Remitly Onboarding to Finish KYC/KYB
    User->>RemitlyFE: Review and Submit KYC
    RemitlyFE->>RemitlyBE: Submit & Validate KYC/KYB

    alt Approved
        RemitlyBE-->>Etsy: Webhook - status_updated (active)
        RemitlyBE-->>User: Email - Onboarding Complete
    else Rejected
        RemitlyBE-->>Etsy: Webhook - status_updated (restricted)
            RemitlyBE-->>User: Email - Unable to Verify (Contact Support)
    end
```

### 1\. Registration Session Created

* A registration session is created via `POST /v1/registration-sessions`.  
* At this stage, a Payee resource does **not** yet exist.  
* A time-limited `registration_link` is returned.  
* No `payee_id` is issued to the partner.

### 2\. Onboarding Initiated

* The payee accesses the `registration_link` in a secure tab or browser window launched by the partner.  
* Payee creates or logs into a Remitly account.  
* Remitly onboarding redirects to the provided partner url and the partner closes the window  
* A Payee resource is created upon successful completion of onboarding.  
* A unique `payee_id` is generated.  
* Initial status is set to: `pending`  
* `A payee.created` webhook is fired.

### 3\. Compliance Submission (KYC / KYB)

* The payee receives an email from Remitly to complete KYC / KYB  
* The payee reviews partner provided KYC / KYB in Remitly web or native application, and provides any other additional Remitly required information and/or documents 

#### Approved

* Upon successful submission, the status transitions to active  
* The payee is eligible to receive funds  
* The payee.status\_updated webhook is fired

#### Rejected / Restricted

* The status transitions to restricted  
* The payee is ineligible to receive funds  
* The payee.status\_updated webhook is fired

### 4\. Ongoing Monitoring

Payee status may change due to the following but not limited to:

* Periodic compliance review  
* Sanctions screening updates  
* Regulatory requirements  
  Suspicious activity

Status may transition from:

* `active` → `restricted`  
* `restricted` → `active` (after remediation)

Each status update will result in a `payee.status_updated` webhook being fired

The partner can retrieve a payee at any time via  `GET /v1/payees/{payeeId}`

## Important Behavioral Rules

* A `payee_id` is issued **only after successful onboarding completion**.  
* `404 Not Found` indicates that no Payee resource exists.  
* Status transitions are communicated via webhooks.  
* Partners should treat `active` as the only payout-eligible state.

### 1\. Create a registration session

Creates a registration session and returns a time-limited, single-use URL that allows a partner payee to initiate and complete onboarding.

#### Notes

* The `registration_link` contains a cryptographically random, single use token with a maximum lifetime of 15 minutes  
* The token is:  
  * Bound to the provided `external_user_id`  
  * Invalidated upon first successful onboarding completion  
  * Automatically expired after 15 minutes if unused  
* After successful completion, the token becomes permanently invalid and cannot be reused  
* If the token expires or onboarding is completed, the partner must generate a new registration session to restart the flow  
* The `registration_link` must be opened in a new tab or browser window (iframe embedding is not supported).  
* Remitly will return the state value unchanged as a query parameter to the provided `redirect_url` upon successful completion.  
* The locale determines the language of the registration page. If not provided or supported, it defaults to en.

```
POST /v1/registration-sessions
```

**Body**

* **external\_user\_id** `string` — **REQUIRED**   
  * Unique identifier of the payee on the partner’s platform.  
* **state** `string` — **REQUIRED**   
  * Partner generated opaque correlation nonce.   
  * Used by the partner to correlate the registration completion redirect with the original session and prevent CSRF/mix-up attacks  
* **redirect\_url** `string` — **REQUIRED**   
  * URL that the payee will be redirected to upon completion of registration.  
* **locale** `string` — **OPTIONAL**  
  * IETF BCP 47 language tag  
* **payee** `object` — **REQUIRED**   
  * **type** `string` — **REQUIRED**   
    * Individual or Business  
  * **individual** `object` — **REQUIRED if type is individual**  
    * Individual entity  
  * **business** `object` — **REQUIRED if type is business**   
    * Business entity  
* 

**Example Request**

```json
{
  "external_user_id": "externalUser123",
  "state": "",
  "redirect_url": "",
  "locale": "en-US",
  "payee": {
    "type": "individual",
    "individual": {
      "personal_information": {
        "first_name": "John",
        "middle_name": "Joe",
        "last_name": "Smith",
        "second_last_name": "Doe",
        "date_of_birth": "1980-01-01"
      },
      "address": {
        "line_1": "123 Test Street",
        "line_2": "Apt 300",
        "postal_code": "00000",
        "city": "Seattle",
        "subdivision": "WA",
        "country": "USA"
      },
      "phone": "+12225550123",
      "email": "john.smith@example.com"
    }
  }
}
```

**Example Response (201 Created)**

```json
{
  "registration_link": "https://www.remitly.com/partners/registration?lang=en-US&token=324f6a5...",
  "expires_at": "2026-02-20T18:00:00Z"
}
```

### 2\. Retrieve a payee by External User ID

Retrieves the Payee associated with the specified `external_user_id`.

```
GET /v1/payees?external_user_id={external_user_id}
```

**Query Parameters**

* **external\_user\_id** `string` — **REQUIRED**   
  * Unique identifier of the payee on the partner’s platform.

**Responses**

* 200 OK  
* 404 Not Found \- The specified payee given a `external_user_id` does not exist

**Example Response (200)**

```json
{
  "payee_id": "payee123",
  "external_user_id": "externalUser123",
  "status": "pending",
  "type": "individual",
  "individual": {
    "personal_information": {
      "first_name": "John",
      "middle_name": "Joe",
      "last_name": "Smith",
      "second_last_name": "Doe",
      "date_of_birth": "1980-01-01"
    },
    "address": {
      "line_1": "123 Test Street",
      "line_2": "Apt 300",
      "postal_code": "00000",
      "city": "Seattle",
      "subdivision": "WA",
      "country": "USA"
    },
    "phone": "+12225550123",
    "email": "john.smith@example.com"
  }
}
```

### 3\. Retrieve a payee

Retrieves the Payee resource identified by the specified `payee_id`.

```
GET /v1/payees/{payeeId}
```

**Path Parameters**

* **payee\_id** `string` — **REQUIRED**   
  * Unique identifier for the payee.

**Responses**

* 200 OK  
* 404 Not Found \- The specified `payee_id` does not exist

**Example Response (200)**

```json
{
  "payee_id": "payee123",
  "external_user_id": "externalUser123",
  "status": "pending",
  "type": "individual",
  "individual": {
    "personal_information": {
      "first_name": "John",
      "middle_name": "Joe",
      "last_name": "Smith",
      "second_last_name": "Doe",
      "date_of_birth": "1980-01-01"
    },
    "address": {
      "line_1": "123 Test Street",
      "line_2": "Apt 300",
      "postal_code": "00000",
      "city": "Seattle",
      "subdivision": "WA",
      "country": "USA"
    },
    "phone": "+12225550123",
    "email": "john.smith@example.com"
  }
}
```

### 3.1 Webhook payee.created

Fired when a payee is created.

**Example Payload**

```json
{
  "id": "evt_101",
  "type": "payee.created",
  "timestamp": "2024-10-01T14:30:00Z",
  "data": {
    "payee_id": "payee123",
    "external_user_id": "externalUser123",
    "status": "active",
    "individual": {
      "personal_information": {
        "first_name": "John",
        "middle_name": "Joe",
        "last_name": "Smith",
        "second_last_name": "Doe",
        "date_of_birth": "1980-01-01"
      },
      "address": {
        "line_1": "123 Test Street",
        "line_2": "Apt 300",
        "postal_code": "00000",
        "city": "Seattle",
        "subdivision": "WA",
        "country": "USA"
      },
      "phone": "+12225550123",
      "email": "john.smith@example.com"
    }
  }
}
```

### 3.2 Webhook payee.status\_updated

Fired when an individual payee status changes.

**Example Payload**

```json
{
  "id": "evt_101",
  "type": "payee.status_updated",
  "timestamp": "2024-10-01T14:30:00Z",
  "data": {
    "payee_id": "payee123",
    "external_user_id": "externalUser123",
    "status": "active",
    "individual": {
      "personal_information": {
        "first_name": "John",
        "middle_name": "Joe",
        "last_name": "Smith",
        "second_last_name": "Doe",
        "date_of_birth": "1980-01-01"
      },
      "address": {
        "line_1": "123 Test Street",
        "line_2": "Apt 300",
        "postal_code": "00000",
        "city": "Seattle",
        "subdivision": "WA",
        "country": "USA"
      },
      "phone": "+12225550123",
      "email": "john.smith@example.com"
    }
  }
}
```

## Entities

### 1\. Payee

A Payee represents a partner’s user within Remitly’s platform and is the canonical entity used for onboarding, KYC, and payout eligibility

| `Attribute` | `Type` | `Description` | `Example` |
| :---- | :---- | :---- | :---- |
| `payee_id` | `string` | `Unique identifier for payee` | `xyz987` |
| `external_user_id` | `string` | `Unique identifier of the payee on the partner’s platform` | `abc123` |
| `status` | `string` | `The status of the payee` | `pending` |
| `type` | `string` | `The type of the payee` | `individual` |
| `individual` | `object` | `An individual object` |  |
| `business` | `object` | `A business object` |  |

### 1.1 Payee Status

Status represents the current lifecycle stage of the Payee and whether they are eligible to receive payouts

| `Attribute` | `Type` | `Description` |
| :---- | :---- | :---- |
| `pending` | `string` | `The payee has not completed registration, onboarding, or KYC/B requirements` |
| `active` | `string` | `The payee is able to receive funds` |
| `restricted` | `string` | `The payee is in a state in which the account cannot receive funds` |

##### 

##### 1\. Individual

A Payee represents a partner’s user within Remitly’s platform and is the canonical entity used for onboarding, KYC, and payout eligibility

| `Attribute` | `Type` | `Description` | `Required` |
| :---- | :---- | :---- | :---- |
| `personal_information` | `object` | `Personal Information Entity` | `Y` |
| `address` | `object` | `Address Entity` | `Y` |
| `phone` | `string` | `E.164-formatted phone number.` | `Y` |
| `email` | `string` | `Email address` |  |

##### Personal Information

| `Attribute` | `Type` | `Description` | `Required` |
| :---- | :---- | :---- | :---- |
| `first_name` | `string` | `First Name` | `Y` |
| `middle_name` | `string` | `Middle Name` |  |
| `last_name` | `string` | `Last Name` | `Y` |
| `second_last_name` | `string` | `Second Last Name` |  |
| `date_of_birth` | `string` | `ISO-8601 date string representing date of birth`  | `Y` |

##### `Address`

| `Attribute` | `Type` | `Description` | `Required` |
| :---- | :---- | :---- | :---- |
| `line_1` | `string` | `Address line 1` | `Y` |
| `line_2` | `string` | `Address line 2` |  |
| `postal_code` | `string` | `Postal code` |  |
| `city` | `string` | `City` | `Y` |
| `subdivision` | `string` | `Subdivision` |  |
| `country` | `string` | `ISO-3166-1 alpha-3 country code` | `Y` |

##### `Business`

| `Attribute` | `Type` | `Description` | `Required` |
| :---- | :---- | :---- | :---- |
| `name` | `string` | `Legal name of the organization.` |  |
| `trade_name` | `string` | `Doing Business As (DBA) name.` |  |
| `address` | `object` | `Legal/Physical address (see Address entity).` |  |
| `country_of_registration` | `string` | `ISO-3166-1 alpha-3 country code.` |  |
| `org_category` | `string` | `High-level business category.` |  |
| `org_category_other` | `string` | `Custom category if org_category is "other".` |  |
| `org_industry_classification` | `object` | `Industry classification (see OrgIndustryClassification).` |  |
| `entity_type` | `string` | `Legal entity type (e.g., corporation, partnership).` |  |
| `org_description` | `object` | `Business description details (see OrgDescription).` |  |
| `partners` | `array of objects` | `List of key personnel/partners (see Partner entity).` |  |
| `no_of_employees_range` | `string` | `Range of total employees (e.g., 1-10, 11-50).` |  |
| `org_website_url` | `string` | `Organization's official website.` |  |
| `employee_description` | `string` | `Description of employees.` |  |
| `customer_description` | `string` | `Description of the customer base.` |  |
| `org_identifier` | `object` | `Legal identification numbers (see OrgIdentifier).` |  |

##### `Org Industrial Classification`

| `Attribute` | `Type` | `Description` | `Required` |
| :---- | :---- | :---- | :---- |
| `type` | `string` | `Classification standard being used.` |  |
| `value` | `string` | `The classification code.` |  |
| `label` | `string` | `Human-readable label for the code.` |  |

##### `Org Description`

| `Attribute` | `Type` | `Description` | `Required` |
| :---- | :---- | :---- | :---- |
| `products_services_description` | `string` | `Detailed description of products/services offered.` |  |
| `organization_jurisdictions` | `string` | `Jurisdictions where the organization operates.` |  |
| `customer_description_other_value` | `string` | `Free-text description of customers if needed.` |  |

##### `Partner`

| `Attribute` | `Type` | `Description` | `Required` |
| :---- | :---- | :---- | :---- |
| `title` | `string` | `Partner's title (e.g., CEO, Director).` |  |
| `title_list` | `array of string` | `List of available titles for selection.` |  |
| `title_other_value` | `string` | `Custom title if not in list.` |  |
| `countries_of_citizenship` | `array of string` | `ISO-3166-1 alpha-3 country codes.` |  |
| `personal_information` | `object` | `Partner's personal information (see Personal Information entity).` |  |
| `address` | `object` | `Partner's address (see Address entity).` |  |
| `phone_number` | `string` | `E.164-formatted phone number.` |  |
| `tax_id_last_four` | `string` | `Last four digits of tax ID.` |  |
| `ownership_percentage` | `number` | `Percentage of company ownership.` |  |
| `ekyc_status` | `string` | `Status of the electronic KYC check.` |  |
| `watchlist_status` | `string` | `Status of the watchlist check.` |  |
| `type` | `array of string` | `Partner roles/types.` |  |

##### `Org Identifier`

| `Attribute` | `Type` | `Description` | `Required` |
| :---- | :---- | :---- | :---- |
| type | string | Type of identifier (e.g., EIN, VAT, LEI). |  |
| value | string | The actual identifier number. |  |
| country | string | ISO-3166-1 alpha-3 country code of issue. |  |
| jurisdiction | object | Further jurisdictional details if needed. |  |
| is\_primary | boolean | Indicates if this is the main identifier. |  |

##### 

# Payouts

## Payout Lifecycle

### Standalone Payout

```mermaid
sequenceDiagram
    participant Client
    participant Remitly Platform API
    participant Remitly Platform

    Client->>Remitly Platform API: POST /v1/payouts
    Remitly Platform API-->>Client: 201 Created (PENDING)

    Remitly Platform->>Remitly Platform: Process payout
    Remitly Platform API-->>Client: Webhook: payout.status_updated (SUCCESSFUL)
```

### Batch Payouts

```mermaid
sequenceDiagram
    participant Client
    participant Remitly Platform API
    participant Remitly Platform

    rect rgb(230, 245, 255)
        Note right of Client: Initialize Batch
        Client->>Remitly Platform API: POST /v1/batches
        Remitly Platform API-->>Client: 201 Created (INITIALIZED)
    end

    rect rgb(230, 255, 230)
        Note right of Client: Add Payouts (can be called multiple times)
        Client->>Remitly Platform API: POST /v1/batches/{id}/payouts
        Remitly Platform API-->>Client: 201 Created
    end

    rect rgb(255, 245, 230)
        Note right of Client: Execute Batch
        Client->>Remitly Platform API: PATCH /v1/batches/{id} {status: PROCESSING}
        Remitly Platform API-->>Client: 200 OK (PROCESSING)
    end

    Remitly Platform->>Remitly Platform: Process all payouts
    Remitly Platform API-->>Client: Webhook: payout.status_updated (per payout)
    Remitly Platform API-->>Client: Webhook: batch.status_updated (COMPLETED)
```

## Payout APIs

### 1\. Create a payout

```
POST /v1/payouts
```

**Headers**

* **Idempotency-Key** `string` — **REQUIRED**  
  * A unique UUID v4 for the request.

**Attributes**

* **external\_payout\_id** `string` — **REQUIRED**  
  * Your internal reference ID for this payout.  
* **payee\_id** `string` — **REQUIRED**  
  * The Remitly internal ID for the recipient.  
* **amount** `string` — **REQUIRED**  
  * The transfer amount in decimal base currency units (e.g., `"10.00"` \= $10.00 USD).  
* **currency** `string` — **REQUIRED**  
  * ISO currency code (must be USD).  
* **metadata** `dictionary` — **OPTIONAL**  
  * Custom key-value pairs (max 10 fields, 255 chars/value).

**Example Request**

```json
{
  "external_payout_id": "external_payout_123",
  "payee_id": "payee123",
  "amount": "250.00",
  "currency": "USD",
  "metadata": { "invoice_id": "INV-2026-001" }
}
```

**Example Response (201 Created)**

```json
{
  "id": "pay_standalone_001",
  "external_payout_id": "external_payout_123",
  "payee_id": "payee123",
  "status": "PENDING",
  "amount": "250.00",
  "currency": "USD",
  "metadata": { "invoice_id": "INV-2026-001" },
  "created_at": "2026-02-23T10:00:00Z"
}
```

### 2\. Get payout details

```
GET /v1/payouts/{payout_id}
```

**Example Response (200 OK)**

```json
{
  "id": "pay_alpha",
  "external_payout_id": "external_payout_123",
  "payee_id": "payee123",
  "type": "PAYOUT",
  "status": "SUCCESSFUL",
  "amount": "100.00",
  "currency": "USD",
  "metadata": { "bonus_id": "B-99" },
  "created_at": "2024-10-01T12:05:00Z"
}
```

### 3\. List payouts

```
GET /v1/payouts
```

**Query Parameters**

* **payee\_id** `string` — **OPTIONAL**
  * Filter by payee ID.
* **created\_after** `string` — **OPTIONAL**
  * Return payouts created after this timestamp (ISO-8601 UTC).
* **created\_before** `string` — **OPTIONAL**
  * Return payouts created before this timestamp (ISO-8601 UTC).
* **limit** `integer` — **OPTIONAL**
  * Maximum number of payouts to return (default 20, max 100).
* **next\_cursor** `string` — **OPTIONAL**
  * Pagination cursor from a previous response.

**Example Request**

```
GET /v1/payouts?payee_id=payee123&limit=10
```

**Example Response (200 OK)**

```json
{
  "payouts": [
    {
      "id": "pay_alpha",
      "external_payout_id": "external_payout_123",
      "payee_id": "payee123",
      "status": "SUCCESSFUL",
      "amount": "1200.00",
      "completed_amount": "1200.00",
      "currency": "USD",
      "created_at": "2024-10-01T12:00:00Z"
    }
  ],
  "next_cursor": "eyJpZCI6InBheV9hbHBoYSJ9"
}
```

### 4\. Cancel a payout

```
POST /v1/payouts/{payout_id}/cancel
```

Requests cancellation of a payout. The payout status will be set to `CANCELLATION_REQUESTED` and processed asynchronously.

**Path Parameters**

* **payout\_id** `string` — **REQUIRED**
  * The ID of the payout to cancel.

**Headers**

* **Idempotency-Key** `string` — **REQUIRED**
  * A unique UUID v4 for the request.

**Attributes**

* **reason** `string` — **OPTIONAL**
  * Reason for the cancellation (max 500 characters).

**Behavior**

* If the payout has not been processed yet, it will be cancelled without any money transfer and the status will become `CANCELLED`
* If the payout was successful, Remitly will attempt to claw back the funds from the payee. The status will become `CANCELLED_WITH_CLAWBACK` (partial or full recovery) or `CANCELLATION_FAILED` (no recovery possible)
* Cancellation requests are not accepted for payouts processed more than 30 days ago
* Cancellation requests are not accepted for payouts already in a cancelled state

**Example Request**

```json
{
  "reason": "Customer requested refund"
}
```

**Example Response (200 OK)**

```json
{
  "id": "pay_alpha",
  "external_payout_id": "external_payout_123",
  "payee_id": "payee123",
  "status": "CANCELLATION_REQUESTED",
  "amount": "100.00",
  "currency": "USD",
  "reason": "Customer requested refund",
  "created_at": "2024-10-01T12:00:00Z"
}
```

**Error Responses**

| Code | Message |
| :---- | :---- |
| `invalid_payout_status` | `Payout cannot be cancelled in its current status.` |
| `already_cancelled` | `This payout has already been cancelled.` |
| `cancellation_window_expired` | `Cancellation is not allowed for payouts processed more than 30 days ago.` |

**Conflict Response (409)**

If a cancellation is already in progress (different idempotency key), returns 409 Conflict.

## Batch APIs

### 3\. Create a batch

```
POST /v1/batches
```

**Headers**

* **Idempotency-Key** `string` — **REQUIRED**  
  * A unique UUID v4 for the request.

**Attributes**

* **external\_batch\_id** `string` — **REQUIRED**  
  * Unique identifier for reconciliation.  
* **total\_amount** `string` — **REQUIRED**  
  * The expected total for the batch in decimal base currency units (e.g., `"10.00"` \= $10.00 USD).  
* **currency** `string` — **REQUIRED**  
  * Must be USD.  
* **metadata** `dictionary` — **OPTIONAL**  
  * Custom tags for internal reference.

**Example Request**

```json
{
  "external_batch_id": "external_batch_123",
  "total_amount": "50000.00",
  "currency": "USD",
  "metadata": { "region": "North_America", "dept": "Engineering" }
}
```

**Example Response (201 Created)**

```json
{
  "id": "bat_9921",
  "external_batch_id": "external_batch_123",
  "status": "INITIALIZED",
  "total_amount": "50000.00",
  "currency": "USD",
  "metadata": { "region": "North_America", "dept": "Engineering" },
  "created_at": "2024-10-01T12:00:00Z"
}
```

### 4\. Add payouts to a batch

```
POST /v1/batches/{batch_id}/payouts
```

**Headers**

* **Idempotency-Key** `string` — **REQUIRED**  
  * A unique UUID v4 for the request.

**Attributes**

* **payouts** `object` — **REQUIRED**  
  * Container for payout items.  
* **payout.items** `array` — **REQUIRED**  
  * List of payout objects.  
* **payout.items.external\_payout\_id** `string` — **REQUIRED**  
  * Your internal payout reference ID.  
* **payout.items.payee\_id** `string` — **REQUIRED**  
  * The Remitly internal ID for the recipient.  
* **payout.items.amount** `string` — **REQUIRED**  
  * The transfer amount in decimal base currency units (e.g., `"10.00"` \= $10.00 USD).  
* **payout.items.currency** `string` — **REQUIRED**  
  * Must be USD.  
* **payout.items.metadata** `dictionary` — **OPTIONAL**  
  * Payout-specific custom data.

**Note:** A single request can contain up to 500 payouts. For larger batches, make multiple requests.

**Example Request**

```json
{
  "payouts": {
    "items": [
      {
        "external_payout_id": "external_payout_123",
        "payee_id": "payee123",
        "amount": "100.00",
        "currency": "USD",
        "metadata": { "bonus_id": "B-99" }
      }
    ]
  }
}
```

**Example Response (202 Accepted)**

```json
{
  "payouts": {
    "items": [
      {
        "id": "pay_alpha",
        "external_payout_id": "external_payout_123",
        "payee_id": "payee123",
        "status": "PENDING",
        "amount": "100.00",
        "currency": "USD",
        "metadata": { "bonus_id": "B-99" },
        "created_at": "2024-10-01T12:05:00Z"
      }
    ]
  }
}
```

### 5\. Execute a batch

```
POST /v1/batches/{batch_id}/execute
```

Starts processing all payouts in the batch. The batch must be in `INITIALIZED` status.

**Headers**

* **Idempotency-Key** `string` — **REQUIRED**
  * A unique UUID v4 for the request.

**Example Response (200 OK)**

```json
{
  "id": "bat_9921",
  "external_batch_id": "external_batch_123",
  "status": "PROCESSING",
  "total_amount": "50000.00",
  "currency": "USD",
  "metadata": { "region": "North_America" },
  "created_at": "2024-10-01T12:00:00Z"
}
```

### 6\. Cancel a batch

```
POST /v1/batches/{batch_id}/cancel
```

Cancels a batch and its payouts.

**Headers**

* **Idempotency-Key** `string` — **REQUIRED**
  * A unique UUID v4 for the request.

**Cancellation Behavior:**

- If batch processing has **not yet started** (status is `INITIALIZED`): All payouts in the batch will be cancelled.
- If batch processing has **already started** (status is `PROCESSING`): Payouts that have already been processed will remain in their current state. We will make a best effort to cancel payouts that have not yet been processed.

**Example Response (200 OK)**

```json
{
  "id": "bat_9921",
  "external_batch_id": "external_batch_123",
  "status": "CANCEL_REQUESTED",
  "total_amount": "50000.00",
  "currency": "USD",
  "metadata": { "region": "North_America" },
  "created_at": "2024-10-01T12:00:00Z"
}
```

### 7\. Get batch summary

```
GET /v1/batches/{batch_id}
```

**Example Response (200 OK)**

```json
{
  "id": "bat_9921",
  "external_batch_id": "external_batch_123",
  "status": "COMPLETED",
  "total_amount": "50000.00",
  "total_completed_amount": "50000.00",
  "currency": "USD",
  "metadata": { "region": "North_America" },
  "created_at": "2024-10-01T12:00:00Z"
}
```

### 8\. List payouts in a batch

```
GET /v1/batches/{batch_id}/payouts
```

**Query Parameters**

* **limit** `integer` — **OPTIONAL**
  * Maximum number of results per page. Default: 20\. Min: 1, Max: 100\.
* **next\_cursor** `string` — **OPTIONAL**  
  * Cursor for pagination. Use the value from the previous response's `next_cursor` field to retrieve the next page.

**Example Response (200 OK)**

```json
{
  "payouts": {
    "items": [
      {
        "id": "pay_alpha",
        "external_payout_id": "external_payout_123",
        "payee_id": "payee123",
        "status": "SUCCESSFUL",
        "amount": "100.00",
        "currency": "USD",
        "metadata": { "bonus_id": "B-99" },
        "created_at": "2024-10-01T12:05:00Z"
      }
    ]
  },
  "next_cursor": "pay_beta"
}
```

## Report APIs

Currently, only **settlement** reports are supported.

### 9\. Create report

Trigger a background job to generate a settlement report.

```
POST /v1/reports
```

**Headers**

* **Idempotency-Key** `string` — **REQUIRED**  
  * A unique UUID v4 for the request.

**Attributes**

* **type** `string` — **REQUIRED**  
  * Type of report to generate. Currently only `"settlement"` is supported.  
* **start\_time** `string` — **REQUIRED**  
  * Start time for the report period (ISO-8601 UTC timestamp).  
* **end\_time** `string` — **REQUIRED**  
  * End time for the report period (ISO-8601 UTC timestamp).  
* **format** `string` — **REQUIRED**  
  * Output format for the report (e.g., "csv", "json").

**Example Request**

```json
{
  "type": "settlement",
  "start_time": "2024-10-01T00:00:00Z",
  "end_time": "2024-10-02T00:00:00Z",
  "format": "csv"
}
```

**Example Response (201 Created)**

```json
{
  "report_id": "rpt_888999abc",
  "status": "PROCESSING",
  "created_at": "2024-10-02T08:00:00Z"
}
```

### 10\. Check report status

Poll this endpoint to check if the report is ready for download.

```
GET /v1/reports/{report_id}
```

**Example Response (200 OK)**

```json
{
  "report_id": "rpt_888999abc",
  "status": "COMPLETED",
  "download_url": "https://access.remitly.com/v1/reports/rpt_888.csv"
}
```

## Webhooks

Remitly Platform sends webhook notifications to your registered endpoint when significant events occur. Webhooks are signed using HMAC-SHA256 signatures as described in the Authentication & Security section. You must verify the signature of incoming webhooks before processing them.

To register your webhook endpoint, contact Remitly Platform with your HTTPS endpoint URL. Your endpoint must:

- Accept POST requests with JSON payloads  
- Return a 2xx status code within 10 seconds to acknowledge receipt  
- Verify the request signature using Remitly Platform's public key

### payout.status\_updated

Fired when an individual payout changes state.

**Example Payload**

```json
{
  "id": "evt_101",
  "type": "payout.status_updated",
  "timestamp": "2024-10-01T14:30:00Z",
  "data": {
    "id": "pay_alpha",
    "external_payout_id": "external_payout_123",
    "status": "SUCCESSFUL",
    "amount": "100.00",
    "currency": "USD",
    "metadata": { "bonus_id": "B-99" },
    "created_at": "2024-10-01T12:05:00Z"
  }
}
```

### batch.status\_updated

Fired when the batch changes state.

**Example Payload**

```json
{
  "id": "evt_202",
  "type": "batch.status_updated",
  "timestamp": "2024-10-01T16:00:00Z",
  "data": {
    "id": "bat_9921",
    "status": "COMPLETED",
    "total_completed_amount": "50000.00",
    "currency": "USD",
    "created_at": "2024-10-01T12:00:00Z"
  }
}
```

### report.status\_updated

Fired when a report's status changes to a terminal state (`COMPLETED` or `FAILED`).

**Example Payload (Success)**

```json
{
  "id": "evt_401",
  "type": "report.status_updated",
  "timestamp": "2024-11-01T10:05:00Z",
  "data": {
    "report_id": "rpt_55291",
    "type": "settlement",
    "status": "COMPLETED",
    "start_date": "2024-10-01",
    "end_date": "2024-10-31",
    "download_url": "https://storage.remitly.com/reports/rpt_55291.csv?signature=..."
  }
}
```

**Example Payload (Failure)**

```json
{
  "id": "evt_402",
  "type": "report.status_updated",
  "timestamp": "2024-11-01T10:05:00Z",
  "data": {
    "report_id": "rpt_55292",
    "type": "settlement",
    "status": "FAILED",
    "start_date": "2024-10-01",
    "end_date": "2024-10-31",
    "error": {
      "code": "report_generation_failed",
      "message": "Unable to generate report for the specified date range."
    }
  }
}
```

## Reference

### Entities

#### Batch

A Batch is a high-level container used to group and manage up to 10,000 payout items.

| `Attribute` | `Type` | `Description` | `Example` |
| :---- | :---- | :---- | :---- |
| `id` | `string` | `Unique identifier for the batch.` | `bat_55219` |
| `external_batch_id` | `string` | `Your unique identifier for the batch, used for reconciliation.` | `external_batch_123` |
| `status` | `string` | `The current state: INITIALIZED, PROCESSING, CANCEL_REQUESTED, CANCELLED, COMPLETED, COMPLETED_WITH_ERRORS, FAILED.` | `PROCESSING` |
| `total_amount` | `string` | `The target sum of all payouts in decimal base currency units (e.g., "10.00" = $10.00 USD).` | `10500.25` |
| `total_completed_amount` | `string` | `The sum of payouts that have reached a SUCCESSFUL terminal state, in decimal base currency units.` | `8000.00` |
| `currency` | `string` | `ISO currency code (currently USD).` | `USD` |
| `metadata` | `dictionary` | `Custom key-value pairs associated with the batch.` | `{"dept": "finance"}` |
| `created_at` | `string` | `Timestamp when the batch was created (ISO-8601 UTC).` | `2024-10-01T12:00:00Z` |

#### Payout

A Payout represents an individual transfer of funds to a specific recipient.

| `Attribute` | `Type` | `Description` | `Example` |
| :---- | :---- | :---- | :---- |
| `id` | `string` | `Unique Remitly identifier for the payout.` | `pay_99212` |
| `external_payout_id` | `string` | `The unique identifier you assigned to this payout.` | `external_payout_123` |
| `payee_id` | `string` | `The internal Remitly ID for the recipient.` | `payee123` |
| `status` | `string` | `Current state: PENDING, VALIDATING, SUBMITTED, SUCCESSFUL, FAILED, CANCELLED, CANCELLATION_REQUESTED, CANCELLED_WITH_CLAWBACK, CANCELLATION_FAILED.` | `SUCCESSFUL` |
| `amount` | `string` | `The amount in decimal base currency units (e.g., "10.00" = $10.00 USD).` | `1200.00` |
| `completed_amount` | `string` | `The net amount actually paid to the payee after any clawbacks. Present only for terminal states (SUCCESSFUL, CANCELLED, CANCELLED_WITH_CLAWBACK, CANCELLATION_FAILED).` | `1200.00` |
| `currency` | `string` | `ISO currency code (currently USD).` | `USD` |
| `reason` | `string` | `Reason for cancellation (if cancellation was requested).` | `Customer requested refund` |
| `metadata` | `dictionary` | `Custom key-value pairs for this specific payout.` | `{"bonus_id": "B-99"}` |
| `error` | `object` | `Contains error details if the payout status is FAILED. Includes code (machine-readable error code) and message (human-readable description).` | `{"code": "invalid_routing", "message": "The routing number provided is invalid."}` |
| `created_at` | `string` | `Timestamp when the payout was created (ISO-8601 UTC).` | `2024-10-01T12:00:00Z` |

### Status Lifecycle

#### Batch States

| `State` | `Description` | `Terminal` |
| :---- | :---- | :---: |
| `INITIALIZED` | `Batch has been created and is open for adding payouts.` | `No` |
| `PROCESSING` | `Batch execution has started; payouts are being processed.` | `No` |
| `CANCEL_REQUESTED` | `A cancellation request has been submitted; processing is stopping.` | `No` |
| `CANCELLED` | `Batch has been successfully cancelled. No further payouts will be processed.` | `Yes` |
| `COMPLETED` | `All payouts in the batch have been processed successfully.` | `Yes` |
| `COMPLETED_WITH_ERRORS` | `Batch processing finished, but one or more payouts failed.` | `Yes` |
| `FAILED` | `Batch processing failed entirely due to a system error.` | `Yes` |

**Cancellation Behavior:**

- **From `INITIALIZED`:** All payouts in the batch will be cancelled.  
- **From `PROCESSING`:** Payouts already processed remain in their current state. Best effort will be made to cancel payouts not yet processed.

##### Batch State Transitions

```
INITIALIZED → PROCESSING (execute batch)
INITIALIZED → CANCEL_REQUESTED (cancel batch — all payouts cancelled)
PROCESSING → CANCEL_REQUESTED (cancel batch — best effort cancellation)
PROCESSING → COMPLETED | COMPLETED_WITH_ERRORS | FAILED
CANCEL_REQUESTED → CANCELLED
```

#### Payout States

| `State` | `Description` | `Terminal` |
| :---- | :---- | :---: |
| `PENDING` | `Payout has been created (standalone or in a batch) but processing has not started.` | `No` |
| `VALIDATING` | `Payout is being validated (recipient details, routing, etc.).` | `No` |
| `SUBMITTED` | `Payout has been submitted to the payment network.` | `No` |
| `CANCELLATION_REQUESTED` | `Cancellation requested, processing asynchronously.` | `No` |
| `SUCCESSFUL` | `Payout has been successfully delivered to the recipient.` | `Yes` |
| `FAILED` | `Payout failed due to an error (see error field for details).` | `Yes` |
| `CANCELLED` | `Payout was cancelled before funds were transferred.` | `Yes` |
| `CANCELLED_WITH_CLAWBACK` | `Payout cancelled after processing, funds clawed back (partial or full).` | `Yes` |
| `CANCELLATION_FAILED` | `Cancellation attempted but clawback failed (no funds recovered).` | `Yes` |

**Payout State Transitions:**

```
PENDING → VALIDATING (batch execution starts or standalone payout processing begins)
PENDING → CANCELLED (batch cancelled before execution)
VALIDATING → SUBMITTED | FAILED
VALIDATING → CANCELLED (batch cancelled during validation)
SUBMITTED → SUCCESSFUL | FAILED
Any state → CANCELLATION_REQUESTED (cancel payout requested)
CANCELLATION_REQUESTED → CANCELLED | CANCELLED_WITH_CLAWBACK | CANCELLATION_FAILED
```

### Metadata

Some Remitly Platform API endpoints accept a `metadata` object that stores additional information about a resource with custom fields.

**Supported Field Types:**

- String  

**Note:** Arrays and nested objects are not supported within metadata.

**Constraints:**

- You can provide up to **10 metadata fields** per resource  
- The value of each field must not exceed **255 characters** in length

Metadata is useful for storing custom reference IDs, tags, or any additional context needed for reporting and reconciliation purposes.

### Errors

#### Error Object

| `Attribute` | `Type` | `Description` | `Example` |
| :---- | :---- | :---- | :---- |
| `error_type` | `string` | `Category: invalid_request_error, authentication_error, idempotency_error, rate_limit_error, or api_error.` | `invalid_request_error` |
| `error_code` | `string` | `Machine-readable code identifying the specific error.` | `parameter_missing` |
| `message` | `string` | `Human-readable description.` | `The total_amount field is required.` |

#### Common Error Codes

| `Code` | `Description` |
| :---- | :---- |
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
| `invalid_payout_status` | `Payout cannot be cancelled in its current status.` |
| `already_cancelled` | `This payout has already been cancelled.` |
| `cancellation_window_expired` | `Cancellation is not allowed for payouts processed more than 30 days ago.` |
| `internal_error` | `An unexpected error occurred. Contact support if this persists.` |
