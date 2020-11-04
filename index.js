const express = require("express");
const webPush = require("web-push");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const userModel = require("./Mongo/UserModel");

const mongoAppConnection = `mongodb+srv://katcy:Neesama@143@katcy.jlmvn.mongodb.net/testDB`;

app.use(express.json());
app.use(cors());

mongoose.connect(mongoAppConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const publicKey =
  "BM2j_g9A4PTFns3Jfv_Jlo112ZIo6-Xlvgvakl6GCTqc6wSVPW6wPUumIN2TsSyCYFhlKEXJRqKCYihIdE_Mr8Y";

const privateKey = "NvcmMFHwJgik3aZQ5wRdg4K9c5rEK93zHDVmM5kxtiE";

webPush.setVapidDetails("mailto:test@tesst.com", publicKey, privateKey);
//let subscription;

let newSub = {
  endpoint:
    "https://fcm.googleapis.com/fcm/send/cPP3YCrGPsw:APA91bESCFprMJMwTamvlM7VmmEfPOYsgNFS7foSGm5aEHXGqI4vfBrjC2T7-sE3T-lT50Gw2PD9EsMXXcDNiOCb6i0dk6er9NKcAEa6CYtupsZvUIoA-6mp0LNk_xYOnH3JkY3zbFwq",
  expirationTime: null,
  keys: {
    p256dh:
      "BB7K1YYKdlDnXrKON51oH5uGQXZr5g7PQZlWSS01sp0Z6sXm5Jkfbk4_khY5siFEGg0MmzVkERAMvjtrI11v8kw",
    auth: "fSgM9W9Lj57oVHSOVJGncQ5w3",
  },
};

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
