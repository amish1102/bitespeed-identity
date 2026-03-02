# Bitespeed Backend Service

A backend service that identifies and consolidates customer identities across multiple purchases based on email and phone number.

Deployed URL Endpoint: https://bitespeed-api-t7x1.onrender.com

# API Endpoint

HTTP Request Method: POST 
URL: https://bitespeed-api-t7x1.onrender.com/identify
---

## Problem Statement

FluxKart checkout events always contain either:

- `email`
- `phoneNumber`

A single customer may place multiple orders using different combinations of email and phone numbers.

We need to:

- Identify if incoming contact info belongs to an existing customer
- Merge identities when necessary
- Maintain a single primary contact
- Return consolidated contact information

---


### Contact Table Structure

```prisma
model Contact {
  id             Int       @id @default(autoincrement())
  phoneNumber    String?
  email          String?
  linkedId       Int?
  linkPrecedence LinkPrecedence
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime?
}
