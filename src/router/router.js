const express = require('express');
const router = express.Router();

const { shorternUrl,getUrl} = require('../controller/urlController')

router.post('/url/shorten',shorternUrl)

router.get('/:urlCode',getUrl)
module.exports = router