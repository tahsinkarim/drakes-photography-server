const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

//middleware
app.use(cors())
app.use(express.json())

//MongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k6fgqcn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//CRUD Functions
async function run(){
    try{
        const photoCollection = client.db('photographer').collection('photoService')

        //Get all services
        app.get('/services', async (req,res)=> {
            const query = {}
            const cursor = photoCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        //Get service by id
        app.get('/services/:id', async (req,res)=> {
            const id = req.params.id
            const query = { _id: ObjectId(id)}
            const result = await photoCollection.findOne(query)
            res.send(result)
        })

    } finally {

    }

}
run().catch(err => console.log(err))




app.get('/', (req, res)=>{
    res.send('Simple Node Server Running')
})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})