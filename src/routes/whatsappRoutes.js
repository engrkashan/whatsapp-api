const express = require("express");
const multer = require("multer");
const { startClient, sendMessage } = require("../services/whatsappService");

const router = express.Router();
const upload = multer();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.post("/message", upload.single("file"), (req, res) => {
  const { phoneNumber, message, clientId } = req.body;
  const file = req.file;

  if (!phoneNumber || !message || !clientId) {
    return res.status(400).send("Missing required fields.");
  }

  sendMessage(phoneNumber, message, clientId, file);
  res.status(200).send("Message sent successfully.");
});

router.get("/:id/start", (req, res) => {
  const { id } = req.params;
  startClient(id);
  res.status(200).send(`Client ${id} started successfully.`);
});

module.exports = router;
