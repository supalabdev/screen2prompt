# Create a Customer

> **Customers**

Allows you to create a customer in your store.

---

## Endpoint
```http
POST /customers/create
```

**Base URL:** `https://api.abacatepay.com/v2`

**Required permission:** `CUSTOMER:CREATE`

---

## Notes

> **Required field:** Only `email` is mandatory to create a customer.

> **Recommended:** Although the other fields are optional, it is highly recommended to provide `name`, `cellphone`, `taxId`, and `zipCode` when available, as this information improves the customer's checkout experience and facilitates identification.

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

Your customer's data.

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | ✅ Yes | Customer's email address. Example: `"daniel_lima@abacatepay.com"` |
| `name` | `string` | No (recommended) | Customer's full name. Example: `"Daniel Lima"` |
| `cellphone` | `string` | No (recommended) | Customer's phone number. Example: `"(11) 4002-8922"` |
| `taxId` | `string` | No (recommended) | Customer's valid CPF or CNPJ (Brazilian tax ID). Example: `"123.456.789-01"` |
| `zipCode` | `string` | No (recommended) | Customer's postal code (CEP). Example: `"01310-100"` |
| `metadata` | `object` | No | Additional metadata for the customer. Free-form field for your application. Example: `{ "source": "landing-page", "campaign": "black-friday-2025" }` |

---

## Request Example
```bash
curl --request POST \
  --url https://api.abacatepay.com/v2/customers/create \
  --header 'Authorization: Bearer <token>' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "daniel_lima@abacatepay.com",
    "name": "Daniel Lima",
    "cellphone": "(11) 4002-8922",
    "taxId": "123.456.789-01",
    "zipCode": "01310-100",
    "metadata": {
      "source": "landing-page",
      "campaign": "black-friday-2025"
    }
  }'
```

---

## Response

### 200 — Customer created successfully

Content-Type: `application/json`

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | `object` | The created customer's data. |
| `error` | `string \| null` | Error message, if any. Example: `null` |
| `success` | `boolean` | Whether the request was successful. Example: `true` |

#### `data` — Child Attributes

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique customer identifier. Example: `"cust_abcdefghij"` |
| `email` | `string` | Customer's email address. |
| `name` | `string \| null` | Customer's full name. |
| `cellphone` | `string \| null` | Customer's phone number. |
| `taxId` | `string \| null` | Customer's CPF or CNPJ. |
| `zipCode` | `string \| null` | Customer's postal code. |
| `metadata` | `object` | Additional metadata associated with the customer. |
| `createdAt` | `string (ISO 8601)` | Customer creation timestamp. |
| `updatedAt` | `string (ISO 8601)` | Last update timestamp. |

#### Response Example
```json
{
  "data": {
    "id": "cust_abcdefghij",
    "email": "daniel_lima@abacatepay.com",
    "name": "Daniel Lima",
    "cellphone": "(11) 4002-8922",
    "taxId": "123.456.789-01",
    "zipCode": "01310-100",
    "metadata": {
      "source": "landing-page",
      "campaign": "black-friday-2025"
    },
    "createdAt": "2024-11-04T18:38:28.573Z",
    "updatedAt": "2024-11-04T18:38:28.573Z"
  },
  "error": null,
  "success": true
}
```

### 401 — Unauthorized

Returned when the API key is missing, invalid, or does not have the required `CUSTOMER:CREATE` permission.

---

## Notes

- The `email` field is the **only required field** — all others are optional but strongly recommended.
- Providing `name`, `cellphone`, `taxId`, and `zipCode` pre-fills the checkout form for this customer, improving conversion rates.
- The `taxId` field accepts both **CPF** (individual) and **CNPJ** (company) formats.
- Once a customer is created, use their `id` (e.g. `"cust_abcdefghij"`) in the `customerId` field when creating a Checkout to pre-fill their data automatically.
- The `metadata` field is free-form and can store any key-value pairs relevant to your application.