const express = require('express');
const cors = require('cors');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vsgsy.mongodb.net/careerAppear?retryWrites=true&w=majority`;

const app = express();
app.use(express.json());
app.use(cors());


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {

    // job api
    const jobsCollection = client.db("careerAppear").collection("jobs");
    app.post('/addJob', (req, res) => {
        jobsCollection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/allJobs', (req, res) => {
        jobsCollection.find({})
            .toArray((error, documents) => {
                res.send(documents)
            })
    })
    app.get('/approvedJobs', (req, res) => {
        jobsCollection.find({ status: 'approved' })
            .toArray((error, documents) => {
                res.send(documents)
            })
    })
    app.get('/pendingJobs', (req, res) => {
        jobsCollection.find({ status: 'pending' })
            .toArray((error, documents) => {
                res.send(documents)
            })
    })
    app.patch('/updateStatus/:id', (req, res) => {
        const toUpdate = req.body;
        jobsCollection.updateOne({ _id: ObjectId(req.params.id) },
            { $set: toUpdate, $currentDate: { lastModified: true } })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
            .catch(err => {
                console.log('Failed to update');
            })
    })
    // user api
    const userCollection = client.db("careerAppear").collection("users");
    app.post('/newUser', (req, res) => {
        userCollection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.post('/userRole', (req, res) => {
        const email = req.body.email
        userCollection.find({ email: email })
            .toArray((err, data) => {
                res.send(data)
            })
    })
    // job application
    const jobApplicationCollection = client.db("careerAppear").collection("jobApplication");
    app.post('/apply', (req, res) => {
        jobApplicationCollection.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.post('/checkApply', (req, res) => {
        const applicationData = {
            jobId: req.body.jobId,
            email: req.body.email
        };
        jobApplicationCollection.find(applicationData)
            .toArray((error, documents) => {
                res.send(documents.length > 0)
            })
    })
});

const port = 4000;
app.listen(process.env.PORT || port);