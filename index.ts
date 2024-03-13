import express from "express";
import bodyParser from "body-parser";
import mongoose from 'mongoose';
import { AdminRoute, VendorRoute } from "./routes";
import { MONGO_URL } from "./Config";

const app = express();

app.use (bodyParser.json());
app.use (bodyParser.urlencoded({ extended : true}))

app.use('/admin',AdminRoute);
app.use('/vendor',VendorRoute);

mongoose.connect(MONGO_URL).then(result =>{
 console.log("DB Connected");
}).catch(err => console.log('error'+err))

app.listen(8000,()=>{
    console.log("App is running at 8000")
})