const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/User.js");
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'nwOB7nDEYpeEfdGot29ZZnsP6nL4qi';

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

//DATABASE
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("database connected successfully");
  })
  .catch((err) => {
    console.log("error connecting to mongodb", err);
  });

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});

app.post('/login', async (req, res) => {
  const {email, password} = req.body;

  const userDoc = await User.findOne({email})
  if(userDoc) {
    const passOK = bcrypt.compareSync(password, userDoc.password)
    if(passOK) {
      jwt.sign({email:userDoc.email, id:userDoc._id}, jwtSecret, {}, (err, token) => {
        if(err) throw err;
        res.cookie('token', token).json('pass Ok');
      });
    } else {
      res.status(422).json('pass not ok')
    }
  } else {
    res.json('Not found')
  }
});

//RUNNING SERVER
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Server is running on port 4000");
});
