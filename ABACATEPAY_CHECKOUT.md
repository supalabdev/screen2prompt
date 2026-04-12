# Create a Checkout

> **Charge with Checkout**

Creates a Checkout session for the customer to complete the payment.

---

## Endpoint
```http
POST /checkouts/create
```

**Base URL:** `https://api.abacatepay.com/v2`

**Required permission:** `CHECKOUT:CREATE`

---

## Authentication

All requests must include your API key in the `Authorization` header using the Bearer format.
```
Authorization: Bearer <abacatepay-api-key>
```

For more details on how to create and manage API keys, refer to the [authentication documentation](https://docs.abacatepay.com/pages/authentication).

---

## Request Body

Content-Type: `application/json`

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | `object[]` | ✅ Yes | List of items included in the charge. This is the only required field — the total amount is calculated automatically from the items. Minimum: 1 item. |
| `methods` | `enum<string>[]` | No | Available payment methods. Defaults to `["PIX", "CARD"]`. Options: `PIX`, `CARD`. Minimum: 1 method. |
| `returnUrl` | `string<uri>` | No | URL the customer will be redirected to when clicking "Back" in the checkout. |
| `completionUrl` | `string<uri>` | No | URL the customer will be redirected to after the payment is completed. |
| `customerId` | `string` | No | ID of a customer already registered in your store. If provided, the checkout will be pre-filled with the customer's data. Example: `"cust_abcdefghij"` |
| `coupons` | `string[]` | No | List of coupon codes that can be applied to this charge. Maximum: limited array. Example: `["ABKT10", "ABKT5", "PROMO10"]` |
| `externalId` | `string` | No | The charge ID in your own system, if you want to keep an internal reference. Example: `"your_id_123"` |
| `metadata` | `object` | No | Additional metadata for the charge. Free-form field for your application. Example: `{ "source": "landing-page-black-friday", "campaign": "BF-2025" }` |

#### `items` — Child Attributes

Each object in the `items` array represents a product to be charged:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ Yes | The product ID registered in your store. |
| `quantity` | `number` | ✅ Yes | Quantity of the product being charged. |

---

## Request Example
```bash
curl --request POST \
  --url https://api.abacatepay.com/v2/checkouts/create \
  --header 'Authorization: Bearer <token>' \
  --header 'Content-Type: application/json' \
  --data '{
    "items": [
      {
        "id": "prod-1234",
        "quantity": 2
      }
    ],
    "methods": [
      "PIX",
      "CARD"
    ]
  }'
```

---

## Response

### 200 — Checkout created successfully

Content-Type: `application/json`

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | `object` | The created checkout object. |
| `error` | `string \| null` | Error message, if any. Example: `null` |
| `success` | `boolean` | Whether the request was successful. Example: `true` |

#### `data` — Child Attributes

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique checkout identifier. Example: `"bill_abc123xyz"` |
| `externalId` | `string \| null` | Your own system's reference ID. Example: `"pedido-123"` |
| `url` | `string` | URL for the customer to complete the payment. Example: `"https://app.abacatepay.com/pay/bill_abc123xyz"` |
| `amount` | `number` | Total charge amount in cents. Example: `10000` (= R$ 100,00) |
| `paidAmount` | `number \| null` | Amount already paid. `null` if not yet paid. |
| `items` | `object[]` | List of items in the checkout. |
| `status` | `string` | Current checkout status. Example: `"PENDING"` |
| `coupons` | `array` | List of applied coupons. |
| `devMode` | `boolean` | Whether the checkout was created in development mode. |
| `customerId` | `string \| null` | Associated customer ID, if any. |
| `returnUrl` | `string \| null` | Redirect URL on "Back" click. |
| `completionUrl` | `string \| null` | Redirect URL after payment completion. |
| `receiptUrl` | `string \| null` | URL for the payment receipt. |
| `metadata` | `object` | Additional metadata associated with the charge. |
| `createdAt` | `string (ISO 8601)` | Checkout creation timestamp. |
| `updatedAt` | `string (ISO 8601)` | Last update timestamp. |

#### Response Example
```json
{
  "data": {
    "id": "bill_abc123xyz",
    "externalId": "pedido-123",
    "url": "https://app.abacatepay.com/pay/bill_abc123xyz",
    "amount": 10000,
    "paidAmount": null,
    "items": [
      {
        "id": "prod_456",
        "quantity": 2
      }
    ],
    "status": "PENDING",
    "coupons": [],
    "devMode": false,
    "customerId": null,
    "returnUrl": null,
    "completionUrl": null,
    "receiptUrl": null,
    "metadata": {},
    "createdAt": "2024-11-04T18:38:28.573Z",
    "updatedAt": "2024-11-04T18:38:28.573Z"
  },
  "error": null,
  "success": true
}
```

### 401 — Unauthorized

Returned when the API key is missing, invalid, or does not have the required `CHECKOUT:CREATE` permission.

---

## Checkout Status Values

| Status | Description |
|--------|-------------|
| `PENDING` | The checkout was created but not yet paid. |
| `PAID` | The payment was completed successfully. |
| `EXPIRED` | The checkout has expired without payment. |

---

## Notes

- The total charge amount is **automatically calculated** from the registered product prices and quantities — you do not need to pass the amount manually.
- The `customerId` field pre-fills the checkout form with the customer's saved data, improving the checkout experience.
- Use `externalId` to link the AbacatePay checkout to an order or transaction in your own system.
- The `metadata` field is free-form and can store any key-value data relevant to your application.
- Use `devMode` (configured at the API key level) to test checkouts without processing real payments.