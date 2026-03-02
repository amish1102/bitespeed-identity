const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Service is running!");
});

app.post("/identify", async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ error: "Email or phoneNumber required" });
    }

    //  Find all contacts matching email OR phone
    const matchedContacts = await prisma.contact.findMany({
      where: {
        OR: [
          email ? { email } : undefined,
          phoneNumber ? { phoneNumber } : undefined,
        ].filter(Boolean),
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    //  If none found → create primary
    if (matchedContacts.length === 0) {
      const newContact = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: "primary",
        },
      });

      return res.status(200).json({
        contact: {
          primaryContatctId: newContact.id,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: [],
        },
      });
    }

    //  Get all unique primary IDs involved
    const primaryContacts = matchedContacts.filter(
      (c) => c.linkPrecedence === "primary"
    );

    // Oldest primary remains primary
    const oldestPrimary = primaryContacts.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    )[0];

    //  Convert other primaries to secondary if needed
    for (let contact of primaryContacts) {
      if (contact.id !== oldestPrimary.id) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            linkPrecedence: "secondary",
            linkedId: oldestPrimary.id,
          },
        });
      }
    }

    //  Create new secondary if new info provided
    const emailExists = matchedContacts.some((c) => c.email === email);
    const phoneExists = matchedContacts.some(
      (c) => c.phoneNumber === phoneNumber
    );

    if (!emailExists || !phoneExists) {
      await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkedId: oldestPrimary.id,
          linkPrecedence: "secondary",
        },
      });
    }

    //  Fetch all linked contacts
    const allContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { id: oldestPrimary.id },
          { linkedId: oldestPrimary.id },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const emails = [
      ...new Set(allContacts.map((c) => c.email).filter(Boolean)),
    ];

    const phoneNumbers = [
      ...new Set(allContacts.map((c) => c.phoneNumber).filter(Boolean)),
    ];

    const secondaryContactIds = allContacts
      .filter((c) => c.linkPrecedence === "secondary")
      .map((c) => c.id);

    return res.status(200).json({
      contact: {
        primaryContatctId: oldestPrimary.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});