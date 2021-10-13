const cheerio = require('cheerio');
const axios = require('axios');
const config = require('../config.json');

let re = /-\d+[Xx]\d+/;

const search = async (req, res) => {
    try {
        let query = req.query.q
        let page = (req.params.page !== null) ? req.params.page : 1
        const { data } = await axios.get(`${config.url_api}/page/${page}/?s=${query}&post_type=anime`)
        let $ = cheerio.load(data)

        res.send({
            status: 200,
            p: $.html()
        })

    } catch (err) {
        res.send(err)
    }
}

module.exports = {
    search
}