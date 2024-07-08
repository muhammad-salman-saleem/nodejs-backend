import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/index.js';

dotenv.config()
const PORT = process.env.PORT || 4000

connectDB()
.then(()=>{
  app.on("error",(error)=>{
    console.log("Error: ", error);
    throw error;
  })
  app.listen(PORT || 4000, ()=>{
    console.log("Server listening on port " + PORT)
  })
})
.catch((error)=>{
  console.log("MongoDB Connection failed !!!: " + error)
})

