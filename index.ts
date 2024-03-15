import express from 'express';
import App from './services/ExpressApp';
import dbConnection from './services/Databse';

const StartServer = async ()=>{
    const app = express()

    await dbConnection()

    await App(app);
    app.listen(8000,() =>{
        console.log('Listening to PORT 8000');
    });

}

StartServer();