const shortId = require("shortid");
const validUrl = require("valid-url");
const urlModel = require("../Models/urlModel");
const {isValid} = require('../validation/validation.js');
const redis = require('redis');
const {promisify} = require('util');

const redisClient = redis.createClient(
  13190,
  "redis-13190.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("gkiOIPkytPI3ADi14jHMSWkZEo2J5TDG", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const shorternUrl = async function(req, res){
        try {
          let { longUrl } = req.body
          
          if(!isValid(longUrl)){
              return res.status(400).send({status:false, message:"Please give the  URL"})
          }

          if(!validUrl.isUri(longUrl)) {
            return res.status(400).send({status:false, message:"Please give the valide  URL"})
          }

        const urlCode = shortId.generate().toLocaleLowerCase();
        const shortUrl = `http://localhost:3000/${urlCode}`  // http://localhost:3000/dosfiwo

        const data = await urlModel.findOne({longUrl}).select({_id:0,__v:0,createdAt:0,updatedAt:0});

        if(data)  return  res.status(200).send({ msg:"succesfull",data})

        req.body.urlCode =urlCode
        req.body.shortUrl =shortUrl
        const saveData = await urlModel.create(req.body);

        return  res.status(201).send({ msg:"succesfull",data:{longUrl:saveData.longUrl,shortUrl:saveData.shortUrl,urlCode:saveData.urlCode}})
}
catch(err){return  res.status(500).send({status:false,message:err.message})}}

const getUrl = async function(req, res){
try {
  const urlCode = req.params.urlCode;

      const caching = await GET_ASYNC(`${req.params.urlCode}`);
      if(caching){
        console.log("in caching")
        return res.status(302).redirect(JSON.parse(caching));
      }else{

        const isData =await urlModel.findOne({urlCode});
        if(!isData) return  res.status(404).send({status:false,message:"this urlCode is not present in our database"});
      
        await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(isData.longUrl));
      
        return res.status(302).redirect(isData.longUrl)
      }


}
catch(err){return  res.status(500).send({status:false,message:err.message})
}}

module.exports = { shorternUrl ,getUrl}