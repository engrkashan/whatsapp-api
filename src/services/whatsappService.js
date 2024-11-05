const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const clients = {};

// Start Client
function startClient(id) {
  if (!clients[id]) {
    clients[id] = new Client({
      authStrategy: new LocalAuth({ clientId: id }),
      puppeteer: { headless: true },
    });

    clients[id].isAuthenticated = false;

    clients[id]
      .initialize()
      .catch((err) => console.error("Initialization error:", err));

    // QR Code generation
    clients[id].on("qr", (qr) => {
      if (!clients[id].isAuthenticated) {
        // Only generate QR if not authenticated
        console.log("QR Code received:");
        qrcode.generate(qr, { small: true });
      }
    });

    clients[id].on("ready", () => {
      console.log(`Client ${id} is ready!`);
      clients[id].isAuthenticated = true; 
    });

    clients[id].on("auth_failure", (msg) => {
      console.error("Authentication failure:", msg);
      clients[id].isAuthenticated = false; 
    });

    clients[id].on("disconnected", (reason) => {
      console.log("Client was logged out", reason);
      delete clients[id];
    });

    // Handle incoming messages
    clients[id].on("message", async (msg) => {
      try {
        if (msg.from !== "status@broadcast") {
          const contact = await msg.getContact();
          const contactName =
            contact.pushname ||
            contact.verifiedName ||
            contact.name ||
            "Unknown";

          console.log(
            `Message received from ${contactName} (${contact.id.user}): ${msg.body}`
          );

          // Optionally log additional details
          console.log(`Message ID: ${msg.id._serialized}`);
          console.log(`From: ${msg.from}`);
          console.log(`To: ${msg.to}`);
          console.log(`Timestamp: ${msg.timestamp}`);
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });
  } else {
    console.log(`Client ${id} is already started.`);
  }
}

// Helper function to validate phone number
function validatePhoneNumber(phoneNumber) {
  const phoneRegex = /^\d{1,3}\d{10}@c\.us$/;
  return phoneRegex.test(phoneNumber);
}

// Send Message function
async function sendMessage(phoneNumber, message, clientId, file) {
  const client = clients[clientId];
  if (!client) {
    console.error(`Client ${clientId} not found`);
    return;
  }

  if (!validatePhoneNumber(phoneNumber)) {
    console.error("Invalid phone number format.");
    return;
  }

  try {
    if (file) {
      const media = new MessageMedia(
        file.mimetype,
        file.buffer.toString("base64"),
        file.originalname
      );
      await client.sendMessage(phoneNumber, media, { caption: message });
    } else {
      await client.sendMessage(phoneNumber, message);
    }
    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

module.exports = { startClient, sendMessage };
