const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
require('dotenv').config()
const port = 3000

const app = express()
app.use(cors())
app.use(express.json())



const uri = "mongodb+srv://petDB:kwMVALRXzXS4LB0H@cluster0.ktf2bwl.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        await client.connect();

        //    add listing
        app.post('/addPet', async (req, res) => {
            const pet = req.body;
            const result = await client.db("admin").collection("pets").insertOne(pet);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})




app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
