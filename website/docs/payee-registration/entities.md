---
sidebar_position: 2
title: Entities
---

# Payee Entities

This page provides an overview of the payee entity structure. For complete schemas with validation rules and examples, see the [API Reference](/api).

## Payee

A Payee represents a partner's user within Remitly's platform and is the canonical entity used for onboarding, KYC, and payout eligibility

| Attribute | Type | Description | Example |
|:----------|:-----|:------------|:--------|
| `payee_id` | `string` | `Unique identifier for payee` | `xyz987` |
| `external_user_id` | `string` | `Unique identifier of the payee on the partner's platform` | `abc123` |
| `status` | `string` | `The status of the payee` | `pending` |
| `type` | `string` | `The type of the payee` | `individual` |
| `individual` | `object` | `An individual object` |  |
| `business` | `object` | `A business object` |  |

## Payee Status

Status represents the current lifecycle stage of the Payee and whether they are eligible to receive payouts

| Attribute | Type | Description |
|:----------|:-----|:------------|
| `pending` | `string` | `The payee has not completed registration, onboarding, or KYC/B requirements` |
| `active` | `string` | `The payee is able to receive funds` |
| `restricted` | `string` | `The payee is in a state in which the account cannot receive funds` |

## Individual

A Payee represents a partner's user within Remitly's platform and is the canonical entity used for onboarding, KYC, and payout eligibility

| Attribute | Type | Description | Required |
|:----------|:-----|:------------|:---------|
| `personal_information` | `object` | `Personal Information Entity` | `Y` |
| `address` | `object` | `Address Entity` | `Y` |
| `phone` | `string` | `E.164-formatted phone number.` | `Y` |
| `email` | `string` | `Email address` |  |

### Personal Information

| Attribute | Type | Description | Required |
|:----------|:-----|:------------|:---------|
| `first_name` | `string` | `First Name` | `Y` |
| `middle_name` | `string` | `Middle Name` |  |
| `last_name` | `string` | `Last Name` | `Y` |
| `second_last_name` | `string` | `Second Last Name` |  |
| `date_of_birth` | `string` | `ISO-8601 date string representing date of birth`  | `Y` |

### Address

| Attribute | Type | Description | Required |
|:----------|:-----|:------------|:---------|
| `line_1` | `string` | `Address line 1` | `Y` |
| `line_2` | `string` | `Address line 2` |  |
| `postal_code` | `string` | `Postal code` |  |
| `city` | `string` | `City` | `Y` |
| `subdivision` | `string` | `Subdivision` |  |
| `country` | `string` | `ISO-3166-1 alpha-3 country code` | `Y` |

## Business

| Attribute | Type | Description | Required |
|:----------|:-----|:------------|:---------|
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

### Org Industrial Classification

| Attribute | Type | Description | Required |
|:----------|:-----|:------------|:---------|
| `type` | `string` | `Classification standard being used.` |  |
| `value` | `string` | `The classification code.` |  |
| `label` | `string` | `Human-readable label for the code.` |  |

### Org Description

| Attribute | Type | Description | Required |
|:----------|:-----|:------------|:---------|
| `products_services_description` | `string` | `Detailed description of products/services offered.` |  |
| `organization_jurisdictions` | `string` | `Jurisdictions where the organization operates.` |  |
| `customer_description_other_value` | `string` | `Free-text description of customers if needed.` |  |

### Partner

| Attribute | Type | Description | Required |
|:----------|:-----|:------------|:---------|
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

### Org Identifier

| Attribute | Type | Description | Required |
|:----------|:-----|:------------|:---------|
| type | string | Type of identifier (e.g., EIN, VAT, LEI). |  |
| value | string | The actual identifier number. |  |
| country | string | ISO-3166-1 alpha-3 country code of issue. |  |
| jurisdiction | object | Further jurisdictional details if needed. |  |
| is_primary | boolean | Indicates if this is the main identifier. |  |

