 
import mongoose from 'mongoose'; 
require("dotenv").config();

export default async() => {

    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("DB Connected Sucessfully");
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

}
  
  
 