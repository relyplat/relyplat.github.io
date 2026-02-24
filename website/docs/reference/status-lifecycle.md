---
sidebar_position: 2
title: Status Lifecycle
---

# Status Lifecycle

## Batch States

| State | Description | Terminal |
|:------|:------------|:--------:|
| `INITIALIZED` | `Batch has been created and is open for adding payouts.` | `No` |
| `PROCESSING` | `Batch execution has started; payouts are being processed.` | `No` |
| `CANCEL_REQUESTED` | `A cancellation request has been submitted; processing is stopping.` | `No` |
| `CANCELLED` | `Batch has been successfully cancelled. No further payouts will be processed.` | `Yes` |
| `COMPLETED` | `All payouts in the batch have been processed successfully.` | `Yes` |
| `COMPLETED_WITH_ERRORS` | `Batch processing finished, but one or more payouts failed.` | `Yes` |
| `FAILED` | `Batch processing failed entirely due to a system error.` | `Yes` |

### Cancellation Behavior

- **From `INITIALIZED`:** All payouts in the batch will be cancelled.  
- **From `PROCESSING`:** Payouts already processed remain in their current state. Best effort will be made to cancel payouts not yet processed.

### Batch State Transitions

```
INITIALIZED → PROCESSING (execute batch)
INITIALIZED → CANCEL_REQUESTED (cancel batch — all payouts cancelled)
PROCESSING → CANCEL_REQUESTED (cancel batch — best effort cancellation)
PROCESSING → COMPLETED | COMPLETED_WITH_ERRORS | FAILED
CANCEL_REQUESTED → CANCELLED
```

## Payout States

| State | Description | Terminal |
|:------|:------------|:--------:|
| `PENDING` | `Payout has been created (standalone or in a batch) but processing has not started.` | `No` |
| `VALIDATING` | `Payout is being validated (recipient details, routing, etc.).` | `No` |
| `SUBMITTED` | `Payout has been submitted to the payment network.` | `No` |
| `SUCCESSFUL` | `Payout has been successfully delivered to the recipient.` | `Yes` |
| `FAILED` | `Payout failed due to an error (see error field for details).` | `Yes` |
| `CANCELLED` | `Payout was cancelled before completion (e.g., batch was cancelled).` | `Yes` |

### Payout State Transitions

```
PENDING → VALIDATING (batch execution starts or standalone payout processing begins)
PENDING → CANCELLED (batch cancelled before execution)
VALIDATING → SUBMITTED | FAILED
VALIDATING → CANCELLED (batch cancelled during validation)
SUBMITTED → SUCCESSFUL | FAILED
```

