const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = 3000;

const app = express();
app.use(cors());
app.use(express.json());

const uri =
    "mongodb+srv://petDB:kwMVALRXzXS4LB0H@cluster0.ktf2bwl.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();
        // collection
        const database = client.db("petListing");
        const pets = database.collection("pets");
        const order = database.collection("orders");

        //    add listing
        app.post("/listings", async (req, res) => {
            const pet = req.body;
            const result = await pets.insertOne(pet);
            res.send(result);
            console.log(pet);
        });

        //    get all listings
        app.get("/listings", async (req, res) => {
            const result = await pets.find({}).toArray();
            res.send(result);
        });

        app.get("/listings/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await pets.findOne(query);
            res.send(result);
        });

        // my listings
        app.get("/my-listings", async (req, res) => {
            const { email } = req.query;
            const query = { email: email };
            const result = await pets.find(query).toArray();
            res.send(result);
        })

        // recent listings
        app.get("/recent-listings", async (req, res) => {
            const result = await pets.find({}).sort({ _id: -1 }).limit(6).toArray();
            res.send(result);
        })

        // category listings
        app.get("/listings/category/:category", async (req, res) => {
            const category = req.params.category;
            const result = await pets.find({ category: category }).toArray();
            res.send(result);
        })

        // add order
        app.post("/orders", async (req, res) => {
            const orderData = req.body;
            const result = await order.insertOne(orderData);
            res.send(result);
            console.log(orderData);
        });

        // update listing
        app.put("/listings/:id", async (req, res) => {
            const data = req.body;
            const id = req.params;
            const query = { _id: new ObjectId(id) };

            const updateListing = {
                $set: data
            }
            const result = await pets.updateOne(query, updateListing);
            res.send(result);
        })


        // deleted listing
        app.delete("/listings/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await pets.deleteOne(query);
            res.send(result);
        })


        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
