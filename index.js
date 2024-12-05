const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb'); // Import MongoClient directly

const ConnectionDetail = require('./modals/connectionDetail');

const app = express();
const port = 8000;

// Replace this with your MongoDB connection string
const uri = 'mongodb://localhost:27017';

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(cors());

// Connect to MongoDB using Mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Route to list all databases
app.get('/databases', async (req, res) => {
    let client;

    try {
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const adminDb = client.db().admin();
        const { databases } = await adminDb.listDatabases();
        res.json(databases);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving databases');
    } finally {
        if (client) {
            await client.close();
        }
    }
});

// Route to list collections in a specified database
app.get('/collections/:databaseName', async (req, res) => {
    const { databaseName } = req.params;
    let client;

    try {
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const db = client.db(databaseName);
        const collections = await db.listCollections().toArray(); // Ensure this method is correct for your MongoDB driver version
        res.json(collections.map(c => ({ name: c.name })));
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving collections');
    } finally {
        if (client) {
            await client.close();
        }
    }
});

// Route to get data from a specified collection in a specified database
app.get('/data/:databaseName/:collectionName', async (req, res) => {
    const { databaseName, collectionName } = req.params;
    let client;

    try {
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const db = client.db(databaseName);
        const collection = db.collection(collectionName);
        const data = await collection.find().toArray();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving collection data');
    } finally {
        if (client) {
            await client.close();
        }
    }
});

// Route to store additional information
app.post('/store-additional-info', async (req, res) => {
    try {
        const { deviceName, casenumber, additionalInfo, investigatorId } = req.body;

        // Validate the incoming data
        if (!deviceName || !casenumber || !investigatorId) {
            return res.status(400).send('Device name, Case number, and Investigator ID are required');
        }

        // Check if a record with the same case number already exists
        const existingConnectionDetail = await ConnectionDetail.findOne({ casenumber });

        if (existingConnectionDetail) {
            return res.status(409).send('A record with this Case No# already exists');
        }

        // Create and save the new ConnectionDetail document
        const newConnectionDetail = new ConnectionDetail({
            deviceName,
            casenumber,
            additionalInfo,
            investigatorId
        });

        await newConnectionDetail.save();

        res.status(200).send('Additional information stored successfully');
    } catch (err) {
        console.error('Error storing additional information:', err);
        res.status(500).send('Error storing additional information');
    }
});

// GET API to retrieve all connection details
app.get('/connection-details', async (req, res) => {
    try {
        const connectionDetails = await ConnectionDetail.find({});
        res.status(200).json(connectionDetails);
    } catch (err) {
        console.error('Error retrieving connection details:', err);
        res.status(500).send('Error retrieving connection details');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
