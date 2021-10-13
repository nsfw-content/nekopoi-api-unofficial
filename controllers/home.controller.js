const cheerio = require('cheerio');
const axios = require('axios');
const config = require('../config.json');

let re = /-\d+[Xx]\d+/;

const home = async (req, res) => {
    try {
        let page = req.params.page
        const { data } = await axios.get(`${config.url_api}/page/${page}`);
        let $ = cheerio.load(data);

        // RESULT
        const resultList = $('div#boxid > div.eropost')
        let resultPush = []
        resultList.each((i, elem) => {
            resultPush.push({
                title: $(elem).find('div.eroinfo > h2 > a').text(),
                path: $(elem).find('div.eroinfo > h2 > a').attr('href').replace(config.url_api, ''),
                released: $(elem).find('div.eroinfo > span').eq(0).text(),
                image: $(elem).find('div.eroimg > div.limitero > img').attr('src').replace($(elem).find('div.eroimg > div.limitero > img').attr('src').match(re)[0], "")
            })
        })
        // RECOMMENDED
        const recommendList = $('div.animeseries > ul > li');
        let recommendPush = [];
        recommendList.each((i, elem) => {
            getDetail = $(elem).find('a.series').attr('original-title');
            let $$ = cheerio.load(getDetail);

            let genres = [];
            $$('p:contains("Genre")').find('a').each((i, elemm) => {
                genres.push({
                    link: $$(elemm).attr('href').replace(config.url_api, ''),
                    name: $$(elemm).text()
                })
            })
            recommendPush.push({
                type: $$('p:contains("Tipe")').text().replace('Tipe: ', ''),
                title: $$('div.infoarea > h2').eq(0).text(),
                title_japanese: $$('p:contains("Nama Jepang")').text().replace("Nama Jepang: ", ''),
                producer: $$('p:contains("Produser")').text().replace("Produser: ", ''),
                image: $$('img').attr('src').replace($$('img').attr('src').match(re)[0], ''),
                status: $$('p:contains("Status")').text().replace("Status: ", ''),
                duration: $$('p:contains("Durasi")').text().replace('Durasi: ', ''),
                rating: $$('p:contains("Skor")').text().replace('Skor: ', ''),
                genre: genres
            })
        })

        const maxPage = $('div.nav-links > a.next').prev().text()

        res.send({
            status: 200,
            maxPage: parseInt(maxPage),
            result: resultPush,
            recommended: recommendPush
        })

    } catch (err) {
        res.send(err)
    }
}


const search = async (req, res) => {
    try {
        let query = (req.query.s !== "") ? req.query.s : res.status(400).send('')
        let page = (req.params.page !== null) ? req.params.page : 1
        const { data } = await axios.get(`${config.url_api}/page/${page}/?s=${query}&post_type=anime`)
        let $ = cheerio.load(data)

        const resultList = $('div.result > ul > li')
        let resultPush = []
        resultList.each((i, elem) => {
            let type = $(elem).find('div.top').find('a').attr('href').replace(config.url_api, '').split('/')
            type = (type[1] == "hentai") ? "series" : "hentai"
            resultPush.push({
                title: $(elem).find('div.top').find('a').text(),
                path: $(elem).find('div.top').find('a').attr('href').replace(config.url_api, ''),
                image: $(elem).find('div.top > div.limitnjg > img').attr('src').replace($(elem).find('div.top > div.limitnjg > img').attr('src').match(re)[0], ""),
                type: type
            })
        })

        const maxPage = $('div.nav-links > a.next').prev().text()
        res.send({
            status: 200,
            maxPage: maxPage,
            query: query,
            result: resultPush
        })

    } catch (err) {
        res.send(err)
    }
}


module.exports = {
    home, search
}
