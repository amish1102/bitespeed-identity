## Bitespeed Backend Service

A backend service that identifies and consolidates customer identities across multiple purchases based on email and phone number.

Deployed URL Endpoint: https://bitespeed-api-t7x1.onrender.com

##  API Endpoint

- **HTTP Method:** POST  
- **Base URL:** https://bitespeed-api-t7x1.onrender.com  
- **API Endpoint:** /identify  
- **Full URL:** https://bitespeed-api-t7x1.onrender.com/identify

## Tech Stack

- Backend: Node.js, Express.js
- Database: PostgreSQL
- ORM: Prisma
- Deployment: Render
- Dev Tools: Nodemon, Git & Github
- API Testing: Postman

## Problem Statement

FluxKart checkout events always contain either (or both): 

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
