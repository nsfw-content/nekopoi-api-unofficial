const cheerio = require('cheerio');
const axios = require('axios');
const config = require('../config.json');

let re = /-\d+[Xx]\d+/;

const home = async (req, res) => {
    try {
        let page = (Number.isFinite(parseInt(req.params.page))) ? parseInt(req.params.page) : 1
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
        let page = (Number.isFinite(parseInt(req.params.page))) ? req.params.page : 1
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

const category = async (req, res) => {
    try {
        const categories = { "hentai": "/category/hentai", "3d-hentai": "/category/3d-hentai", "jav": "/category/jav", "jav-cosplay": "/tag/jav-cosplay" }
        let category = categories[req.params.category]
        let page = (Number.isFinite(parseInt(req.params.page))) ? parseInt(req.params.page) : 1
        const { data } = await axios.get(`${config.url_api}${category}/page/${page}`)
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
            category: req.params.category,
            result: resultPush
        })

    } catch (err) {
        res.send(err)
    }
}

const list = async (req, res) => {
    try {
        const lists = { "hentai": "/hentai-list", "jav": "/jav-list", "genre": "/genre-list" }
        let list = lists[req.params.list]
        const { data } = await axios.get(`${config.url_api}${list}`)
        let $ = cheerio.load(data)

        const resultList = $('div#a-z > div.letter-group')
        const genreList = $('div.genres > ul > li')
        let resultPush = []
        if (req.params.list === 'genre') {
            genreList.each((i, el) => {
                resultPush.push({
                    name: $(el).find('a').text(),
                    url: $(el).find('a').attr('href').replace(config.url_api, "")
                })
            })
        } else {
            resultList.each((i, el) => {
                const letter = $(el).find('div.letter-cell > a').text();
                let cellPush = []
                $(el).find('div.row-cells').slice(1).each((i, elem) => {
                    if (req.params.list === "jav") {
                        _cell = {
                            title: $(elem).find('div.title-cell > a').attr('title'),
                            path: $(elem).find('div.title-cell > a').attr('href').replace(config.url_api, '')
                        }
                    } else if (req.params.list === 'hentai') {
                        let $$ = cheerio.load($(elem).find('a.series').attr('original-title'));
                        _cell = {
                            type: $$('p:contains("Tipe")').text().replace('Tipe: ', ''),
                            title: $(elem).find('a.series').text(),
                            title_japanese: $$('p:contains("Nama Jepang")').text().replace("Nama Jepang: ", ''),
                            producer: $$('p:contains("Produser")').text().replace("Produser: ", ''),
                            status: $$('p:contains("Status")').text().replace("Status: ", ''),
                            duration: $$('p:contains("Durasi")').text().replace('Durasi: ', ''),
                            rating: $$('p:contains("Skor")').text().replace('Skor: ', ''),
                        }
                    }

                    cellPush.push(_cell)
                })
                resultPush.push({
                    letter: letter,
                    data: cellPush
                })
            })
        }


        res.send({
            status: 200,
            result: resultPush
        })

    } catch (err) {
        res.send(err)
    }
}

const genres = async (req, res) => {
    try {
        let genre = req.params.genre
        let page = (Number.isFinite(parseInt(req.params.page))) ? parseInt(req.params.page) : 1
        const { data } = await axios.get(`${config.url_api}/genres/${genre}/page/${page}`)
        let $ = cheerio.load(data)

        const resultList = $('div.result > ul > li')
        let resultPush = []
        resultList.each((i, elem) => {
            let type = $(elem).find('div.top').find('a').attr('href').replace(config.url_api, '').split('/')
            type = (type[1] == "hentai") ? "series" : "hentai"
            resultPush.push({
                title: $(elem).find('div.top').find('h2 > a').text(),
                path: $(elem).find('div.top').find('h2 > a').attr('href').replace(config.url_api, ''),
                image: $(elem).find('div.top > div.limitnjg > img').attr('src').replace($(elem).find('div.top > div.limitnjg > img').attr('src').match(re)[0], ""),
                type: type
            })
        })

        const maxPage = $('div.nav-links > a.next').prev().text()
        res.send({
            status: 200,
            maxPage: maxPage,
            genre: genre,
            result: resultPush
        })
    } catch (err) {
        res.send(err)
    }
}

module.exports = {
    home, search, category, list, genres
}
