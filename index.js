const express = require("express");
const webPush = require("web-push");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const userModel = require("./Mongo/UserModel");

const mongoAppConnection = `mongodb+srv://katcy:Neesama@143@katcy.jlmvn.mongodb.net/testDB`;

app.use(cors());
app.use(express.json());

mongoose.connect(mongoAppConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const publicKey =
  "BM2j_g9A4PTFns3Jfv_Jlo112ZIo6-Xlvgvakl6GCTqc6wSVPW6wPUumIN2TsSyCYFhlKEXJRqKCYihIdE_Mr8Y";

const privateKey = "NvcmMFHwJgik3aZQ5wRdg4K9c5rEK93zHDVmM5kxtiE";

webPush.setVapidDetails("mailto:test@tesst.com", publicKey, privateKey);

app.post("/subscribe", (req, res) => {
  console.log("subscription received", req.body);
  let { email, subscription } = req.body;

  let user = new userModel({
    email: email,
    subscription: subscription,
    plan: "Trial",
    lastActive: "2d ago",
  });

  user.save().then((savedUser) => {
    res.status(201).json({ savedUser });
  });

  const payload = JSON.stringify({ title: "Subscribed" });

  setTimeout(() => {
    webPush.sendNotification(subscription, payload);
  }, 5000);
});

app.get("/score", (req, res) => {
  res.status(200).json({});

  const payload = JSON.stringify({ title: "Scoring Complete" });

  setTimeout(() => {
    console.log("sending push");
    webPush.sendNotification(subscription, payload);
  }, 10000);
});

app.post("/inactive", (req, res) => {
  console.log(req.body);
  const { imsg } = req.body;
  const payload = JSON.stringify({ title: imsg });
  userModel
    .find({ lastActive: "2d ago" })
    .then((users) => {
      if (users.length === 0) {
        res.status(404).send();
      } else {
        users.map((user) => {
          webPush.sendNotification(user.subscription, payload);
        });
        res.status(200).json({ msg: "Sending Push" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send();
    });
});

app.post("/trial", (req, res) => {
  const { tmsg } = req.body;
  const payload = JSON.stringify({ title: tmsg });
  userModel
    .find({ plan: "Trial" })
    .then((users) => {
      if (users.length === 0) {
        res.status(404).send();
      } else {
        users.map((user) => {
          webPush.sendNotification(user.subscription, payload);
        });
        res.status(200).json({ msg: "Sending Push" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(404).send();
    });
});

app.post("/pushtouser", (req, res) => {
  const { user, msg } = req.body;
  const payload = JSON.stringify({ title: msg });

  userModel.findOne({ email: user }).then((user) => {
    if (user && user.subscription) {
      webPush.sendNotification(user.subscription, payload);
      res.status(200).json({ msg: "Sending Push" });
    }
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started at ${port}`);
});
