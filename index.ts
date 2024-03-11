import express from "express";

const app = express();

app.use('/',(req,res)=>{
    return res.json("Hello I am Backend")
})

app.listen(8000,()=>{
    console.log("App is running at 8000")
})