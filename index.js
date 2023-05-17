const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')
var jwt = require('jsonwebtoken');
require('dotenv').config()

//middleware
app.use(cors())
app.use(express.json())

// user name: car-service
// pass : LrJVuBS8D12islS0

const teamData = require('./Data/TeamData.json')

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mljwqsp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// verifyJWT
function verifyJWT(req,res,next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    res.status(401).send({message:'unauthorized access'})
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,function(err,decoded){
    if(err){
      res.status(401).send({message:'unauthorized access'})
    }
    req.decoded = decoded;
    next();
  })
  
}





async function run(){
    

  try{
    const serviceCollection = client.db('allCarServiceCrud').collection('services')
    const orderCollection = client.db('allOrderCollection').collection('orders')




// POST api....

        // work with jwt token 
    app.post('/jwt',(req,res)=>{
      const user = req.body;
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:"1h"})
      res.send({token})
    })

    app.post('/service',async(req,res)=>{
       
        const product = req.body;
        const result =await serviceCollection.insertOne(product)
        res.send(result)

    })

    app.post('/userOrder',async(req,res)=>{
      const order = req.body;
      const result =await orderCollection.insertOne(order);

      res.send(result)
    })








// GET api .......

    app.get('/service',async(req,res)=>{
      const query = {}
      const result = await serviceCollection.find(query).toArray()

      res.send(result)
    })

    app.get('/service/:id',async(req,res)=>{
      const id = req.params;
      const query = {_id:ObjectId(id)}
      const result = await serviceCollection.findOne(query)

      res.send(result)

    })

    


    app.get('/checkout/:id',async(req,res)=>{
      const id = req.params;
      const query = {_id: ObjectId(id)}

      const result = await serviceCollection.findOne(query)
      res.send(result)

    })








    // work with jwt in this fun 
    app.get('/userOrder',verifyJWT, async(req,res)=>{
      const decoded = req.decoded;

      if(decoded.email !== req.query.email){
        res.status(403).send({message:'unthorrise access'})
      }


      let query = {}
      if(req.query.email){
        query = {
              email: req.query.email
        }
      }
      const result = await orderCollection.find(query).toArray()

      res.send(result)
    })









    // DELETE api.........

    app.delete('/service/:id',async(req,res)=>{
        const id = req.params;
        const query = {_id:ObjectId(id)}
        const result = await serviceCollection.deleteOne(query);

        res.send(result)

    })

    

    app.delete('/userOrder/:id',async(req,res)=>{
      const id = req.params;
      const query = {_id:ObjectId(id)}
      const result = await orderCollection.deleteOne(query)

      res.send(result)
    })











    // UPDATE api ...

    app.put('/service/:id', async(req,res)=>{
      const id = req.params;
      const productInfo = req.body;
      const query = {_id:ObjectId(id)}

      const options = {upsert : true};
      const updateDoc = {
        $set: {
          product : productInfo.product,
          cost : productInfo.cost,
        }
      };

      const result = await serviceCollection.updateOne(query,updateDoc,options);

      res.send(result)
    })




  }
  finally{

  }

}


run().catch(error => console.log(error))









app.get('/',(req,res)=>{
    res.send('car server is running')
})

app.get('/teamData',(req,res)=>{
    res.send(teamData)
})

app.listen(port,()=>{
    console.log(`app listen on port ${port}`)
})