const mongoose= require('mongoose')

async function connectDb(){
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("database connected")
    }
    catch(err){
        console.log(err)
    }
}

module.exports=connectDb