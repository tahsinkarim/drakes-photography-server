const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

//middleware
app.use(cors())
app.use(express.json())

//MongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k6fgqcn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization
    if(!authHeader){
        res.status(401).send({message: 'unauthorized access'})
    }
    const token = authHeader.split(" ")[1]
    jwt.verify(token, process.env.SECRET_TOKEN, function(err, decoded){
        if(err){
            res.status(401).send({message: 'unauthorized access'})
        }
        req.decoded = decoded
        next()
    })
}
//CRUD Functions
async function run(){
    try{
        const photoCollection = client.db('photographer').collection('photoService')
        const reviewCollection = client.db('photographer').collection('reviews')
        //JWT
        app.post('/jwt', (req, res)=> {
            const user = req.body
            const token = jwt.sign(user, process.env.SECRET_TOKEN, {expiresIn: '2h'})
            res.send({token})
        })
        //Create new service
        app.post('/services', async (req,res)=>{
            const data = req.body 
            const service = {...data, date: new Date()}
            const result = await photoCollection.insertOne(service)
            res.send(result)
        } )
        //Get all services
        app.get('/services', async (req,res)=> {
            const query = {}
            const cursor = photoCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        //Get first 3 service
        app.get('/service', async (req,res)=> {
            const query = {}
            const cursor = photoCollection.find(query).sort({date: -1}).limit(3)
            const result = await cursor.toArray()
            res.send(result)
        })
        //Create New review
        app.post('/reviews', async (req, res)=>{
            const data = req.body
            const review = {...data, date: new Date()}
            
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })

        //Get review by service
        app.get('/reviews/:id', async (req,res)=> {
            const id = req.params.id
            const query = { service: id}
            const cursor = reviewCollection.find(query).sort( {date : -1})
            const result = await cursor.toArray()
            res.send(result)
        })

        //Delete reviews by Id
        app.delete('/reviews/:id', async (req, res)=> {
            const id = req.params.id 
            const query = {_id: ObjectId(id)}
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })

        //Update review
        app.patch('/update/:id', async (req,res)=>{
            const id = req.params.id
            const review = req.body
            
            const query = {_id: ObjectId(id)}
            const option = {upsert : true}
            const updateReview = {
                $set: {
                    date: new Date(),
                    review: review.review
                }
            }
            const result = await reviewCollection.updateOne(query, updateReview, option)
            res.send(result)

        })

        //Get review by user email
        app.get('/reviews', verifyJWT, async (req,res)=> {
            const decoded = req.decoded
            if(decoded.email !== req.query.user){
                res.status(403).send({message: 'unauthorized access'})
            }
            
            const user = req.query.user
            const query = { user : user}
            const cursor = reviewCollection.find(query).sort( {date : -1})
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