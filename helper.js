import { client } from "./index.js";
import { ObjectId } from "mongodb";

export function createUser(data) {
  return client.db("b30wd").collection("users").insertOne(data);
}

export function getUserByName(email) {
  return client.db("b30wd").collection("users").findOne({ email: email });
}

export function createTokenForUser(data) {
  return client.db("b30wd").collection("token").insertOne(data);
}
export function checkUserInToken(user_id) {
  return client
    .db("b30wd")
    .collection("token")
    .findOne({ user_id: ObjectId(user_id) });
}

export function updatePassword(user_id, updateData) {
  return client
    .db("b30wd")
    .collection("users")
    .updateOne({ _id: ObjectId(user_id) }, { $set: updateData });
}

export function removeToken(user_id) {
  return client
    .db("b30wd")
    .collection("token")
    .deleteOne({ user_id: ObjectId(user_id) });
}

export function createScrapeProducts(data) {
  client.db("b30wd").collection("scraper").insertMany(data);
}

export function getProductsWithQuery(query) {
  console.log(query);
  return client
    .db("b30wd")
    .collection("scraper")
    .find({ title: { $regex: query, $options: "i" } })
    .toArray();
}

export function getProductsWithTitle(title) {
  console.log(title);
  return client
    .db("b30wd")
    .collection("scraper")
    .find({ title: title })
    .toArray();
}

export function getAllProducts() {
  return client.db("b30wd").collection("scraper").find({}).toArray();
}
