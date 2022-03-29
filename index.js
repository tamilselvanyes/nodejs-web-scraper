import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { MailTransporter } from "./sendEmail.js";
import {
  fetchfromAmazon,
  fetchfromFlipkart,
  fetchfromAmazonDifferentStructure,
  fetchfromSnapdeal,
  fetchfromFlipkartDifferentStructure,
} from "./scraper.js";

import {
  createUser,
  getUserByName,
  createTokenForUser,
  checkUserInToken,
  updatePassword,
  removeToken,
  createScrapeProducts,
  getAllProducts,
  getProductsWithQuery,
} from "./helper.js";

const app = express();
//middleware --> Intercept --> Body to JSON
app.use(express.json());
dotenv.config();
app.use(cors());
app.use(bodyParser.json());

//MongoConnection
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

export const client = await createConnection();

app.get("/scrapedProducts/:query", async (req, res) => {
  const query = req.params.query;

  const products = [];

  //getting the products from the database
  await getProductsWithQuery(query).then((product) => {
    if (product !== null && product !== undefined && product.length !== 0) {
      for (let i = 0; i < product.length; i++) {
        products.push(product[i]);
      }
    }
  });

  if (products.length > 10) {
    res.send(products);
    return;
  }

  //Commented for time being as Amazon not responding due to high traffic
  await fetchfromAmazon(query).then((product) => {
    if (product !== null && product !== undefined && product.length !== 0) {
      createScrapeProducts(product);
      for (let i = 0; i < product.length; i++) {
        products.push(product[i]);
      }
    }
  });
  if (products.length === 0) {
    await fetchfromAmazonDifferentStructure(query).then((product) => {
      if (product !== null && product !== undefined && product.length !== 0) {
        createScrapeProducts(product);
        for (let i = 0; i < product.length; i++) {
          products.push(product[i]);
        }
      }
    });
  }

  await fetchfromFlipkart(query).then((product) => {
    if (product !== null && product !== undefined && product.length !== 0) {
      createScrapeProducts(product);
      for (let i = 0; i < product.length; i++) {
        products.push(product[i]);
      }
    }
  });

  await fetchfromFlipkartDifferentStructure(query).then((product) => {
    if (product !== null && product !== undefined && product.length !== 0) {
      createScrapeProducts(product);
      for (let i = 0; i < product.length; i++) {
        products.push(product[i]);
      }
    }
  });

  await fetchfromSnapdeal(query).then((product) => {
    if (product !== null && product !== undefined && product.length !== 0) {
      createScrapeProducts(product);
      for (let i = 0; i < product.length; i++) {
        products.push(product[i]);
      }
    }
  });

  res.send(products);
});

app.get("/scrapedProducts", async (req, res) => {
  const products = await getAllProducts();
  res.send(products);
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const hashedpassword = await genPassword(password);
  const new_user = {
    email: email,
    password: hashedpassword,
  };
  const result = await createUser(new_user);
  res.send(result);
});

app.post("/email", async (req, res) => {
  const { email } = req.body;

  const userFromDb = await getUserByName(email);
  if (!userFromDb) {
    res.status(200).send({ message: "email available" });
  } else {
    res.status(403).send({ message: "User already exists" });
  }
});

app.post("/forgotpassword/email", async (req, res) => {
  const { email } = req.body;

  const userFromDb = await getUserByName(email);
  if (userFromDb) {
    res.status(200).send({ message: "email exist" });
  } else {
    res.status(403).send({ message: "email does not exist" });
  }
});

app.post("/reset-password-confirmation/:userid/:token", async (req, res) => {
  const { password_1 } = req.body;
  const user_id = req.params.userid;
  const token = req.body.token;

  const user_token = await checkUserInToken(user_id);

  if (!user_token) {
    res
      .status(401)
      .send({ message: "Invalid reset password request from user" });
    return;
  }

  if (!user_token.token === token) {
    res
      .status(401)
      .send({ message: "Invalid reset password Token does not match" });
    return;
  }

  if (user_token.ExpiresIn < Date.now()) {
    removeToken(user_id);
    res.send({ message: "Token expired" });
    return;
  }

  const hashedpassword = await genPassword(password_1);

  const updateData = { password: hashedpassword };
  await updatePassword(user_id, updateData);
  await removeToken(user_id);
  res.status(200).send({ message: "Password updated successfully" });
  return;
});

app.post("/reset-password", async (req, res) => {
  const { email } = req.body;

  const userFromDb = await getUserByName(email);
  if (!userFromDb) {
    res.status(400).send({ message: "No such user" });
    return;
  }

  const user_token_check = await checkUserInToken(userFromDb._id);
  if (user_token_check) {
    removeToken(userFromDb._id);
  }

  const token = jwt.sign({ id: userFromDb._id }, process.env.SECRET_KEY, {
    expiresIn: "10m", //600000 milli seconds
  });

  let current_time = Date.now();
  let expiry_time = current_time + 600000;
  const user_token = {
    user_id: userFromDb._id,
    token: token,
    createdAt: current_time,
    ExpiresIn: expiry_time,
  };

  await createTokenForUser(user_token);
  const link = `${process.env.BASE_URL}/reset-password/${userFromDb._id}/${token}`;
  const subject = "Rest Password";
  const text = `Please Click the link below to reset the passsword for security reasons the link will be expired in the next 10 minutes \n ${link}`;
  await MailTransporter(email, subject, text);
  res.status(200).send({ message: "Mail sent" });
});

app.post("/login", async function (request, response) {
  // db.users.insertOne(data)
  const { email, password } = request.body;
  const userfromDB = await getUserByName(email);
  if (!userfromDB) {
    response.status(401).send({ message: "Invalid email or password" });
  } else {
    const storedPassword = userfromDB.password;
    const isPasswordMatch = await bcrypt.compare(password, storedPassword);
    console.log("Login Successful  " + isPasswordMatch);
    if (isPasswordMatch) {
      const token = jwt.sign({ id: userfromDB._id }, process.env.SECRET_KEY);
      response.status(200).send({ message: "Login Successful", token: token });
    } else {
      response.status(401).send({ message: "Invalid email or password" });
    }
  }
});

app.get("/", (req, res) => {
  res.send("This is my backend");
});

app.listen(PORT, () => console.log(`Server started at ${PORT}`));

async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Mongo is connected ✌️😊");
  return client;
}

async function genPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  return hashPassword;
}

await fetchfromFlipkart("phone").then((product) =>
  createScrapeProducts(product)
);
