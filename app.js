const express= require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
require("./db/connection")
const user= require("./routes/User")
const recipe= require("./routes/Recipe")
const PORT= process.env.PORT||9000
const app= express();
app.use(express.json())
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({  extended: false }));
app.use(cors());
app.use("/user",user);
app.use("/recipe",recipe);

app.listen(PORT,()=>{
    console.log(`app is running ${PORT}`);
})