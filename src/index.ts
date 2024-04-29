import express from 'express';
import App from './services/ExpressApp';
import dbConnection from './services/Databse';
//import { PORT } from './Config';

const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 7000;

const StartServer = async ()=>{
    const app = express()

    await dbConnection()

    await App(app);
    app.listen(PORT,() =>{
        console.log(`Listening to PORT ${PORT}`);
    });

}

StartServer();