# Webhooks

Receive automatic notifications from AbacatePay whenever something important happens — such as a confirmed payment, a subscription renewal, or a failed transfer.

Think of webhooks as **"messages sent by AbacatePay to your system"**, without you having to constantly poll the API.

---

## Why Use Webhooks?

Without webhooks, your application would have to **ask the API every second**:

> "Has this payment been confirmed?"

This is slow and inefficient.

With webhooks, AbacatePay **notifies you immediately**:

> "The payment was confirmed. Here's the data."

This way you can:

- Update an order's status
- Grant access to a product
- Send automated emails
- Record financial transactions

All of this without any manual intervention — and without making your customer wait.

---

## How It Works in Practice

1. **Create an endpoint in your system** — e.g. `https://yoursite.com/webhooks/abacatepay`
2. **Register that endpoint in the AbacatePay dashboard**
3. **Whenever something important happens** (e.g. a payment is approved):
   - AbacatePay sends a `POST` request to your URL
   - The POST contains the event (e.g. `checkout.completed`, `subscription.renewed`)
   - Your system processes that event

It's like receiving a push notification — but for servers.

---

## Environments (Dev Mode vs Production)

| Environment | Behavior |
|-------------|----------|
| **Dev Mode** | Webhooks receive simulated events |
| **Production** | Webhooks receive real events |

This allows you to test everything before going live.

---

## Webhook Security

Webhooks need to be secure — anyone could attempt to send fake requests to your endpoint. For this reason, AbacatePay recommends **two layers of protection**:

### 🔐 1. Secret in the URL

Each webhook has a unique secret passed as a query string parameter.

**Example:**
```
https://yoursite.com/webhook/abacatepay?webhookSecret=YOUR_SECRET
```

Your backend should verify it:
```js
if (req.query.webhookSecret !== process.env.WEBHOOK_SECRET) {
  return res.status(401).json({ error: "Unauthorized" });
}
```

### 🛡️ 2. HMAC Signature (Body Verification)

Even if someone discovers your URL and secret, they still cannot forge an event. Every webhook sent by AbacatePay includes a signature in the request header:
```
X-Webhook-Signature: <hmac-sha256-base64-signature>
```

This signature is generated using **HMAC-SHA256** and guarantees that:

- The request body **has not been tampered with**
- The event was **genuinely sent by AbacatePay**

Your backend should recalculate the signature and compare:

- If equal → ✅ the event is legitimate
- If different → ❌ reject the event

This is the same method used by Stripe, PayPal, Shopify, and GitHub.

### 🔧 HMAC Validation Example (Node.js)

This example shows how to validate the HMAC signature sent in the `X-Webhook-Signature` header:
```ts
import crypto from "node:crypto";

// AbacatePay public HMAC key
const ABACATEPAY_PUBLIC_KEY =
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHF...";

/**
 * Verifies if the webhook signature matches the expected HMAC.
 * @param rawBody - Raw request body string.
 * @param signatureFromHeader - The signature received from `X-Webhook-Signature`.
 * @returns true if the signature is valid, false otherwise.
 */
export function verifyAbacateSignature(
  rawBody: string,
  signatureFromHeader: string
): boolean {
  const bodyBuffer = Buffer.from(rawBody, "utf8");

  const expectedSig = crypto
    .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
    .update(bodyBuffer)
    .digest("base64");

  const a = Buffer.from(expectedSig);
  const b = Buffer.from(signatureFromHeader);

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
```

---

## Creating a Webhook in the Dashboard

1. **Open the Webhooks section** — this is where you create and manage your notification endpoints.
2. **Click "Create"** — provide the name and the URL that will receive the events.
3. **Configure the details:**
   - **Name** — e.g. "Confirmed Payments"
   - **URL** — HTTPS endpoint that will receive the events
   - **Secret** — key used to verify authenticity

---

## Supported Events

| Event | When it fires |
|-------|--------------|
| `checkout.completed` | A checkout payment was confirmed |
| `checkout.refunded` | A checkout refund was completed |
| `checkout.disputed` | A dispute/chargeback was opened on a checkout |
| `transparent.completed` | A transparent checkout payment was confirmed |
| `transparent.refunded` | A transparent checkout refund was completed |
| `transparent.disputed` | A dispute/chargeback was opened on a transparent checkout payment |
| `subscription.completed` | A subscription was created and activated |
| `subscription.cancelled` | A subscription was cancelled |
| `subscription.renewed` | A subscription's recurring charge was paid |
| `transfer.completed` | A transfer was completed successfully |
| `transfer.failed` | A transfer failed |
| `payout.completed` | A payout (withdrawal) was completed successfully |
| `payout.failed` | A payout (withdrawal) failed |

---

## Payload Structure

All v2 webhooks share the same base payload format:
```json
{
  "id": "log_abc123xyz",
  "event": "checkout.completed",
  "apiVersion": "v2",
  "devMode": false,
  "data": {
    ...
  }
}
```

> **Sensitive data:** The `taxId` field (CPF/CNPJ) is masked in payloads (e.g. `123.***.***-**`). For card payments, only the last 4 digits of the card number are included.

> **No customer:** If there is no customer linked to the checkout, payment, or subscription, the `customer` object will be `null`.

---

## Checkout Events

### `checkout.completed`

Fired when a checkout payment is confirmed. The `payerInformation` object varies by payment method.
```json
{
  "event": "checkout.completed",
  "apiVersion": "v2",
  "devMode": false,
  "data": {
    "checkout": {
      "id": "bill_abc123xyz",
      "externalId": "pedido-123",
      "url": "https://app.abacatepay.com/pay/bill_abc123xyz",
      "amount": 10000,
      "paidAmount": 10000,
      "platformFee": 100,
      "frequency": "ONE_TIME",
      "items": [{ "id": "prod_xyz", "quantity": 2 }],
      "status": "PAID",
      "methods": ["PIX"],
      "customerId": "cust_abc123",
      "receiptUrl": "https://app.abacatepay.com/receipt/...",
      "createdAt": "2024-12-06T18:56:15.538Z",
      "updatedAt": "2024-12-06T18:56:20.000Z"
    },
    "customer": {
      "id": "cust_abc123",
      "name": "João Silva",
      "email": "joao@example.com",
      "taxId": "123.***.***-**"
    },
    "payerInformation": {
      "method": "PIX",
      "PIX": {
        "name": "João Silva",
        "taxId": "123.***.***-**",
        "isSameAsCustomer": true
      }
    }
  }
}
```

### `checkout.disputed`

Fired when a dispute or chargeback is opened on a checkout. Same payload structure as `checkout.completed`, but with an additional `reason` field:
```json
{
  "event": "checkout.disputed",
  ...
  "data": {
    "checkout": { ... },
    "customer": { ... },
    "payerInformation": { ... },
    "reason": "requested_by_customer"
  }
}
```

### `checkout.refunded`

Fired when a checkout payment is refunded. Same payload structure as `checkout.disputed`, including the `reason` field.

---

## Transparent Checkout Events (PIX QR Code)

### `transparent.completed` — PIX
```json
{
  "event": "transparent.completed",
  "apiVersion": "v2",
  "devMode": false,
  "data": {
    "transparent": {
      "id": "char_xyz789",
      "externalId": "pedido-456",
      "amount": 5000,
      "paidAmount": 5000,
      "platformFee": 100,
      "status": "PAID",
      "frequency": "ONE_TIME",
      "devMode": false,
      "customerId": "cust_abc123",
      "methods": ["PIX"],
      "receiptUrl": "https://app.abacatepay.com/receipt/...",
      "createdAt": "2024-12-06T19:00:00.000Z",
      "updatedAt": "2024-12-06T19:00:05.000Z"
    },
    "customer": {
      "id": "cust_def456",
      "name": "Maria Santos",
      "email": "maria@example.com",
      "taxId": "12.***.***/0001-**"
    },
    "payerInformation": {
      "method": "PIX",
      "PIX": {
        "name": "Maria Santos",
        "taxId": "12.***.***/0001-**",
        "isSameAsCustomer": true
      }
    }
  }
}
```

The events `transparent.disputed` and `transparent.refunded` follow the same structure, with an additional `reason` field when applicable. Both PIX and Card payment methods are supported.

---

## Subscription Events

### `subscription.completed`

Fired when a subscription becomes active.
```json
{
  "id": "log_taQArRTApemxwcbw5EJeF3hS",
  "event": "subscription.completed",
  "apiVersion": "v2",
  "devMode": false,
  "data": {
    "subscription": {
      "id": "subs_tAFqDWBhcEYTjQh2K0ZYDHau",
      "amount": 2990,
      "currency": "BRL",
      "method": "CARD",
      "status": "ACTIVE",
      "frequency": "MONTHLY",
      "createdAt": "2024-12-06T20:00:00.000Z",
      "updatedAt": "2024-12-06T20:00:05.000Z",
      "canceledAt": null,
      "cancelPolicy": null,
      "cancelledDueTo": null
    },
    "customer": {
      "id": "cust_def456",
      "name": "Maria Santos",
      "email": "maria@example.com",
      "taxId": "12.***.***/0001-**"
    },
    "payment": {
      "id": "char_xyz789",
      "externalId": "pedido-456",
      "amount": 2990,
      "paidAmount": 2990,
      "platformFee": 100,
      "status": "PAID",
      "methods": ["CARD"],
      "receiptUrl": "https://app.abacatepay.com/receipt/...",
      "createdAt": "2024-12-06T20:00:00.000Z",
      "updatedAt": "2024-12-06T20:00:05.000Z",
      "payerInformation": {
        "method": "CARD",
        "CARD": {
          "number": "1234",
          "brand": "VISA"
        }
      }
    },
    "checkout": {
      "id": "bill_jskd3TMfScHZDJe5NSZjTmQ4",
      "externalId": null,
      "url": "https://app.abacatepay.com/pay/bill_jskd3TMfScHZDJe5NSZjTmQ4",
      "amount": 2990,
      "paidAmount": 2990,
      "platformFee": 100,
      "frequency": "SUBSCRIPTION",
      "items": [{ "id": "prod_bx4BstRWhQ2SUcKsPt4c6pmq", "quantity": 1 }],
      "status": "PAID",
      "methods": ["CARD"],
      "customerId": "cust_def456",
      "receiptUrl": "https://app.abacatepay.com/receipt/...",
      "createdAt": "2024-12-06T19:59:57.819Z",
      "updatedAt": "2024-12-06T20:00:05.000Z"
    }
  }
}
```

### `subscription.renewed`

Fired every time a subscription renewal is successfully charged. Same structure as `subscription.completed`, with updated `updatedAt` timestamps reflecting the renewal date.

### `subscription.cancelled`

Fired when a subscription is cancelled. The `status` field becomes `"CANCELLED"` and `canceledAt` is populated:
```json
{
  "event": "subscription.cancelled",
  ...
  "data": {
    "subscription": {
      ...
      "status": "CANCELLED",
      "canceledAt": "2024-12-06T20:00:05.000Z"
    },
    ...
  }
}
```

---

## Transfer Events

Used to notify the status of **transfers** (sending funds to external accounts).

### `transfer.completed`
```json
{
  "event": "transfer.completed",
  "apiVersion": "v2",
  "devMode": false,
  "data": {
    "transfer": {
      "id": "tran_xxx",
      "externalId": "payout-ext-123",
      "amount": 1000,
      "status": "COMPLETE",
      "method": "PIX",
      "platformFee": 0,
      "receiptUrl": "https://...",
      "createdAt": "...",
      "updatedAt": "...",
      "endToEndIdentifier": "E123..."
    }
  }
}
```

### `transfer.failed`

Same structure as `transfer.completed`, with `"status": "FAILED"`.

---

## Payout Events (Withdrawals)

Used to notify the status of **payouts** (withdrawing balance from the platform).

### `payout.completed`

The `endToEndIdentifier` field is present only in completed payouts.
```json
{
  "event": "payout.completed",
  "apiVersion": "v2",
  "devMode": false,
  "data": {
    "withdraw": {
      "id": "tran_xxx",
      "amount": 1000,
      "status": "COMPLETE",
      "method": "PIX",
      "platformFee": 0,
      "receiptUrl": "https://...",
      "externalId": null,
      "createdAt": "...",
      "updatedAt": "...",
      "endToEndIdentifier": "E123..."
    }
  }
}
```

### `payout.failed`

Same structure as `payout.completed`, with `"status": "FAILED"` and no `endToEndIdentifier`.

---

## Best Practices

- Always use **HTTPS** for all webhook endpoints.
- Validate both the **URL secret** and the **HMAC signature** on every request.
- **Log each received event** — process each one only once (implement idempotency).
- Return **`200 OK`** only after you have finished processing the event.
- Implement **retry logic with idempotency** to handle edge cases.
- **Do not validate the entire payload schema** (e.g. with Zod) strictly — this prevents future payload additions from breaking your endpoint.

---

## Need Help?

Our team can help you. Contact us at: [ajuda@abacatepay.com](mailto:ajuda@abacatepay.com)