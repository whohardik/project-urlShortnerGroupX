const shortId = require("shortid");
const validUrl = require("valid-url");
const urlModel = require("../Models/urlModel");
const {isValid} = require('../validation/validation.js')


    const shorternUrl = async function(req, res){
        try {
          let { longUrl } = req.body
          
          if(!isValid(longUrl)){
              return res.status(400).send({status:false, message:"Please give the  URL"})
          }

          if(!validUrl.isUri(longUrl)) {
            return res.status(400).send({status:false, message:"Please give the valide  URL"})
          }

        const urlCode = shortId.generate();
        const baseUrl = "http://localhost:3000/"
        const shortUrl = baseUrl + urlCode // http://localhost:3000/dosfiwo

        const data = await urlModel.findOne({longUrl}).select({_id:0,__v:0,createdAt:0,updatedAt:0});

        if(data)  return  res.status(200).send({ msg:"succesfull",data})

        req.body.urlCode =urlCode
        req.body.shortUrl =shortUrl
        const saveData = await urlModel.create(req.body);

        return  res.status(201).send({ msg:"succesfull",data:{longUrl:saveData.longUrl,shortUrl:saveData.shortUrl,urlCode:saveData.urlCode}})
}
catch(err){
    return  res.status(500).send({status:false,message:err.message})

}}

const getUrl = async function(req, res){
    try {
  const urlCode = req.params.urlCode;
  const isData =await urlModel.findOne({urlCode});
  if(!isData) return  res.status(400).send({status:false,message:"Not present"});

    return res.redirect(isData.longUrl,302)
}
catch(err){
return  res.status(500).send({status:false,message:err.message})

}}

module.exports = { shorternUrl ,getUrl}