 
import mongoose from 'mongoose'; 
import { MONGO_URL } from '../Config';

export default async() => {

    try {
        await mongoose.connect(MONGO_URL)
        console.log("DB Connected Sucessfully");
    } catch (err) {
        console.log(err);
        process.exit(1);
    }

}
  
  
 