const express = require("express");
const cors = require("cors");
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;
//middleWare
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nort6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("foodota_food-at-home");
        const servicesCollection = database.collection("services");
        const ordersCollection = database.collection("ordered_food");

        //POST API---add new food services
        app.post('/services', async (req, res) => {
            const newServices = req.body;
            const result = await servicesCollection.insertOne(newServices);
            res.json(result);
        })

        //GET API from services
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        //GET API from ordered_food
        app.get('/ordered_food', async (req, res) => {
            const cursor = ordersCollection.find({});
            const ordered_food = await cursor.toArray();
            res.send(ordered_food);
        })

        //GET API from services with _id
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service);
        })

        //ADD API for ordered_food to Database
        app.post('/ordered_food', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(order);
        })

        //UPDATE API to update status info
        app.put('/ordered_food/:_id', async (req, res) => {
            const id = req.params._id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "approved"
                },
            }
            const result = await ordersCollection.updateOne(query, updateDoc, options);
            res.json(result);
        })

        //DELETE API from ordered_food with id
        app.delete('/ordered_food/:_id', async (req, res) => {
            const id = req.params._id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log('Server is running at port: ', port);
})