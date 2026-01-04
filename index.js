const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Database Collections
        const db = client.db("petListing");
        const petsCollection = db.collection("pets");
        const ordersCollection = db.collection("orders");
        const usersCollection = db.collection("users");

        // --- User Management ---

        // Create or update user info on login
        app.put("/users", async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: user.name,
                    email: user.email,
                    photoURL: user.photoURL,
                    role: user.role || "user",
                },
            };
            const result = await usersCollection.updateOne(query, updateDoc, options);
            res.send(result);
        });

        // Get specific user role
        app.get("/users/role/:email", async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email });
            res.send({ role: user?.role });
        });

        // Get all users
        app.get("/users", async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });

        // Update user role to admin
        app.patch("/users/admin/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = { $set: { role: "admin" } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // Delete a user
        app.delete("/users/:id", async (req, res) => {
            const id = req.params.id;
            const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        // --- Listings ---

        // Add new listing
        app.post("/listings", async (req, res) => {
            const result = await petsCollection.insertOne(req.body);
            res.send(result);
        });

        // Get all listings
        app.get("/listings", async (req, res) => {
            const result = await petsCollection.find().toArray();
            res.send(result);
        });

        // Get single listing by ID
        app.get("/listings/:id", async (req, res) => {
            const query = { _id: new ObjectId(req.params.id) };
            const result = await petsCollection.findOne(query);
            res.send(result);
        });

        // Delete a listing
        app.delete("/listings/:id", async (req, res) => {
            const query = { _id: new ObjectId(req.params.id) };
            const result = await petsCollection.deleteOne(query);
            res.send(result);
        });

        // Update user profile
        app.patch("/users/update/:email", async (req, res) => {
            const email = req.params.email;
            const { name, photoURL } = req.body;
            const filter = { email: email };
            const updateDoc = {
                $set: {
                    name: name,
                    photoURL: photoURL
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        });


        // --- Order Management ---

        // Get user orders
        app.get("/orders", async (req, res) => {
            const result = await ordersCollection
                .find({ email: req.query.email })
                .toArray();
            res.send(result);
        });

        // Create new order
        app.post("/orders", async (req, res) => {
            const result = await ordersCollection.insertOne(req.body);
            res.send(result);
        });

        // --- Analytics ---

        // Get total stats for Admin Dashboard
        app.get("/admin-stats", async (req, res) => {
            const totalUsers = await usersCollection.estimatedDocumentCount();
            const totalPets = await petsCollection.estimatedDocumentCount();
            const totalOrders = await ordersCollection.estimatedDocumentCount();

            const chartData = await petsCollection.aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } },
                { $project: { category: "$_id", count: 1, _id: 0 } }
            ]).toArray();

            res.send({ totalUsers, totalPets, totalOrders, chartData });
        });

        console.log("Database Connection Verified.");
    } catch (error) {
        console.error("Database Error:", error);
    }
}

run().catch(console.dir);

app.get("/", (req, res) => res.send("PawMart Server Active"));
app.listen(port, () => console.log(`Server running on port ${port}`));