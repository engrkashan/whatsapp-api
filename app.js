const express = require("express");
const messageRouter = require("./src/routes/whatsappRoutes");

const app = express();
app.use(express.json());
app.use(messageRouter);

app.listen(process.env.PORT || 3002, () =>
  console.log(`Server is ready in on port ${process.env.PORT || 3002}`)
);
