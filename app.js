const express = require("express")
const connect = require("./config/db");
const shortId = require("shortid")
const createHttpError = require("http-errors")
const mongoose = require("mongoose")
const path = require("path")
const ShortUrl = require("./models/url.model");
require("dotenv").config();


const app = express()
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

mongoose
  .connect("mongodb+srv://pata_nahi:bhool_gaya@cluster0.lsvn5.mongodb.net/url-shortner?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.log("Error Connecting : ", error));

app.set("view engine","ejs")
app.get("/", async (req, res, next) => {
    res.render("index")
})

app.post("/", async (req, res, next) => {
    try {
        const { url } = req.body
        if (!url) {
            throw createHttpError.BadRequest("Provide a valid url")
        } 
        const urlExists = await ShortUrl.findOne({ url });
        if (urlExists) {
            res.render("index", {
              short_url: `http://localhost:5000/${urlExists.shortId}`,
            //   short_url: `${req.hostname}/${urlExists.shortId}`,
            });
        }

        const shortUrl = new ShortUrl({ url: url, shortId : shortId.generate() });

        const result = await shortUrl.save()
        res.render("index", {
          short_url: `http://localhost:4000/${result.shortId}`
        //   short_url: `${req.hostname}/${result.shortId}`
        });
    }
    catch (error) {
        next(error)
    }
})

app.get("/:shortId", async(req, res, next) =>{
   try {
        const { shortId } = req.params;
        const result = await ShortUrl.findOne({ shortId });
       if (!result) {
            throw createHttpError.NotFound("short url does not exist")
       }
       res.redirect(result.url)
   } catch (error) {
       next(error)
   }
})

app.use((req, res, next) => {
    next(createHttpError.NotFound())
})

app.use((err, req, res, next) => {
    res.status(err.ststus || 500)
    res.render("index",{error:err.message})
})

// app.listen(4000, async (req, res) => {
//   try {
//     await connect();
//     console.log("Listening at 4000");
//   } catch (error) {
//     console.log(error.message);
//   }
// });
app.listen(4000, () => console.log("Listining at 4000"));