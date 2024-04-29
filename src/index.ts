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

    app.get("/", (req, res) => {
        return res.json({
            message:'If you want to experience this project then  download this drive file and import on your Postman Collection and use each routes and Controllers Link :-  https://drive.google.com/file/d/1CWmlvto4PITshZnMeHbx87GurVUBGris/view?usp=sharing '
        });
    });

    await App(app);
    app.listen(PORT,() =>{
        console.log(`Listening to PORT ${PORT}`);
    });

}

StartServer();
