require("dotenv").config();
const express = require("express");
//them redis
// const redis = require('redis');
//them session
// const RedisStore = require('connect-redis')(session);
// const redisClient = redis.createClient();
//them mongoDB
const MongoClient = require("mongodb").MongoClient;
//them path
const path = require("path");
// Them body parset POST
const bodyParser = require("body-parser");
//tao app express
const app = express();
//them cache
const NodeCache = require("node-cache");
app.locals.appCache = new NodeCache({ stdTTL: 900, checkperiod: 910 });
// Cau hinh body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
// cau hinh ejs
app.set("views", path.join(__dirname + "/apps/views"));
app.set("view engine", "ejs");

// Static folder
app.use("/static", express.static(path.join(__dirname + "/public")));

const controllers = require(path.join(__dirname + "/apps/controllers"));

app.use(controllers);

// https opttion
// const httpsOption = {
//         cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.crt')),
//         key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'))
//     }
//Cau hình 404
app.get("*", function (req, res) {
  res.status(404).send(`mèocoder <3`);
});
//tạo option connect DB
const optionsDB = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: 40,
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
};
Promise.all([
  MongoClient.connect(process.env.SERVER_1, optionsDB),
  MongoClient.connect(process.env.SERVER_2, optionsDB),
  MongoClient.connect(process.env.SERVER_3, optionsDB),
  MongoClient.connect(process.env.SERVER_4, optionsDB),
  MongoClient.connect(process.env.SERVER_5, optionsDB),
])
  .then((db) => {
    console.log("[database] ket noi thanh cong!");
    app.locals.db_1 = db[0];
    app.locals.db_2 = db[1];
    app.locals.db_3 = db[2];
    app.locals.db_4 = db[3];
    app.locals.db_5 = db[4];
    const port = process.env.PORT || 3000;
    app.listen(port, function () {
      console.log("[server] on http");
      setInterval(() => {
        const https = require('https');
        // https://api.allorigins.win/get?url=
        https.get(`https://hayphim.coin98.pw/`);
        console.log('Ping!');
      }, 4 * 60 * 1000);
    });
    // https.createServer(httpsOption, app).listen(443, function() {
    //     console.log('[server] on https');
    // });
  })
  .catch((err) => console.log(err));
