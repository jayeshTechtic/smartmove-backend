// index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cluster = require("cluster");
const { printConsole } = require("./Utils/commonFile");
const totalCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  printConsole(`Number of CPUs is ${totalCPUs}`);
  printConsole(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    printConsole(`worker ${worker.process.pid} died`);
    printConsole("Let's fork another worker!");
    cluster.fork();
  });
} else {
  const app = express();
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(cors({ origin: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use("/public", express.static(`${__dirname}/public`));
  const maxSizeInBytes = 5 * 1024 * 1024;
  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(express.urlencoded({ limit: maxSizeInBytes, extended: true }));
  const db = require("./Models/index");

  db.mongoose
    .connect(db.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      printConsole("Connected to the database!");
    })
    .catch((err) => {
      printConsole("Cannot connect to the database!", err);
      process.exit();
    });

  // Add your routes
  app.get("/", (req, res) => {
    res.send("SmartMove Backend!");
  });

  // Push notification setup

  // const admin = require("firebase-admin");
  // const googleServicesPushMotification = require("./google-services-push-notification.json");

  // admin.initializeApp({
  //   credential: admin.credential.cert(googleServicesPushMotification),
  // });

  // const registrationToken =
  //   "dMzNVbi7S1SFAvlh3u15eB:APA91bGx_4uDy0eXNb3SEzwy720hRJoa_Q3mH_AzabavfyVBVD6Cpb_pDL3-cm_g5PqdWT5I5PrPuRHk2_R2PIpvJPXHlHr9Ycse_Eoe7Qo5WJCB_h7pchdmTBjmm21Lfh5Fi0rBcDTk";

  // const message = {
  //   notification: {
  //     title: "Title of the notification",
  //     body: "Body of the notification",
  //   },
  //   token: registrationToken,
  // };

  // admin
  //   .messaging()
  //   .send(message)
  //   .then((response) => {
  //     console.log("Successfully sent message:", response);
  //   })
  //   .catch((error) => {
  //     console.error("Error sending message:", error);
  //   });

  const userRouter = require("./src/users/userRouter");
  const adminRouter = require("./src/admin/adminRouter");
  const todoListRouter = require("./src/todo/todoListRouter");
  const furnitureRouter = require("./src/furniture/furnitureRouter");
  const shoppingRouter = require("./src/shopping/shopping.router");
  const accountingRouter = require("./src/accounting/accounting.router");
  const scaleRouter = require("./src/scale/scale.router");
  const userFeedbackRouter = require("./src/userfeedback/userfeedback.router");
  const LanguageRouter = require("./src/language/language.router");
  const LanguageStringsRouter = require("./src/languageStrings/languageStrings.router");
  const interactionRouter = require("./src/interactions/interactionRouter");
  const countryRouter = require("./src/country&Region/country.router");

  app.use("/api/user", userRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/todo", todoListRouter);
  app.use("/api/furniture", furnitureRouter);
  app.use("/api/shopping", shoppingRouter);
  app.use("/api/account", accountingRouter);
  app.use("/api/scale", scaleRouter);
  app.use("/api/feedback", userFeedbackRouter);
  app.use("/api/language", LanguageRouter);
  app.use("/api/languageStrings", LanguageStringsRouter);
  app.use("/api/intraction", interactionRouter);
  app.use("/api/country", countryRouter);

  const PORT = 8080;
  app.listen(PORT, () => {
    printConsole(`Server is running on port ${PORT}`);
  });
}
