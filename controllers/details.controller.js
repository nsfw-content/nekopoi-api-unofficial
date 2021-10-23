const cheerio = require('cheerio');
const axios = require('axios');
const config = require('../config.json');

let re = /-\d+[Xx]\d+/;

const bypass = async (link) => {
    await axios({
        method: 'post',
        url: 'https://api.bypass.vip/',
        data: new URLSearchParams({
            url: link //URL to be bypassed
        })
    }).then(res => {
        return res.data
    }).catch((error) => { return error })
}

const getBetween = (content, start, end) => {
    let r = content.split(start)
    if (r[1]) {
        r = r[1].split(end)
        return r[0]
    }
    return ''
}

const detailSeries = (data, path) => {
    let $ = cheerio.load(data)
    let res = {}
    const preg = /<\/b>|<\/strong>/

    // title
    res['title'] = $('div.imgdesc > span.desc > b').text()
    res['image'] = $('div.imgdesc').find('img').attr('src').replace($('div.imgdesc').find('img').attr('src').match(re)[0], '')
    // japanese title
    let japan_title = $('div.listinfo > ul > li').find('b:contains("Japanese"), strong:contains("Japanese")')
    res['japanese_title'] = (japan_title.length > 0) ? getBetween(japan_title.parent().html(), preg, '<').replace(': ', "") : null
    // // synopsis 
    let synopsis = $('div.imgdesc > span.desc')
    let p = []
    synopsis.find('div > p').each((i, el) => {
        p.push($(el).text())
    })
    res['synopsis'] = (synopsis.find('div > p.separator').length > 0) ? p.join("\n") : synopsis.find('p').text()
    // // Type
    let type = $('div.listinfo > ul > li').find('b:contains("Jenis"), strong:contains("Jenis")')
    res['type'] = (type.length > 0) ? getBetween(type.parent().html(), preg, '<').replace(': ', "") : null
    // // Episodes
    let episodes = $('div.listinfo > ul > li').find('b:contains("Episode"), strong:contains("Episode")')
    res['episodes'] = (episodes.length > 0) ? Number(getBetween(episodes.parent().html(), preg, '<').replace(': ', "")) : null
    // // Status
    let status = $('div.listinfo > ul > li').find('b:contains("Status"), strong:contains("Status")')
    res['status'] = (status.length > 0) ? getBetween(status.parent().html(), preg, '<').replace(': ', "") : null
    // // Tayang
    let released = $('div.listinfo > ul > li').find('b:contains("Tayang"), strong:contains("Tayang")')
    res['released'] = (released.length > 0) ? getBetween(released.parent().html(), preg, '<').replace(': ', "") : null
    // Produser
    let producers = $('div.listinfo > ul > li').find('b:contains("Produser"), strong:contains("Produser")')
    res['producers'] = (producers.length > 0) ? getBetween(producers.parent().html(), preg, '<').replace(': ', "") : null
    // // genres
    let genres = $('div.listinfo > ul > li')
    genres = (genres.find('b:contains("Genres"), strong:contains("Genres")').length > 0) ? genres.find('b:contains("Genres"), strong:contains("Genres")') : genres.find('b:contains("Genre"), strong:contains("Genre")')
    genres = (genres.length > 0) ? genres.parent().find('a') : null
    res['genres'] = []
    if (genres != null) {
        genres.each((i, el) => {
            res['genres'].push({
                name: $(el).text(),
                path: $(el).attr('href').replace(config.url_api, '')
            })
        })
    }

    // Duration
    let duration = $('div.listinfo > ul > li').find('b:contains("Durasi"), strong:contains("Durasi")')
    res['duration'] = (duration.length > 0) ? getBetween(duration.parent().html(), preg, '<').replace(': ', "") : null
    // rates
    let rating = $('div.listinfo > ul > li').find('b:contains("Skor"), strong:contains("Skor")')
    res['rating'] = (rating.length > 0) ? Number(getBetween(rating.parent().html(), preg, '<').replace(': ', "")) : null

    // Downloads
    let episode_list = $('div.episodelist > ul > li')
    res['episode_list'] = []
    episode_list.each((i, el) => {
        res['episode_list'].push({
            episode: $(el).find('a').text(),
            link: $(el).find('a').attr('href').replace(config.url_api, ''),
            released: $(el).find('span.rightoff').text()
        })
    })

    return res
}

const detailH = (data, path) => {
    const preg = /<\/b>|<\/strong>/
    const $ = cheerio.load(data)
    // console.log($.html());
    const title = $('title').text().trim()
    const all_episode = (/.+?(?=-ep)/.test(path)) ? '/hentai/' + path.match(/.+?(?=-ep)/)[0].replace('/', '') : ''
    const download_list = []

    let synopsis = '', producers = '', duration = '', genre = '', size = '', img = ''

    img += $('div.thm').find('img').attr('src').replace($('div.thm').find('img').attr('src').match(re)[0], '')
    synopsis += $('div.articles > div.contentpost > div.konten > p').find(`b:contains("Sinopsis"),strong:contains("Sinopsis")`).parent().next().text()
    let produc = $('div.articles > div.contentpost > div.konten > p').find(`b:contains("Produ"),strong:contains("Produ")`)
    producers += (produc.length > 0) ? getBetween(produc.parent().html(), preg, '<').replace("&nbsp;", '').replace(":", '') : null
    let dura = $('div.articles > div.contentpost > div.konten > p').find(`b:contains("Dura"),strong:contains("Dura")`)
    duration += (dura.length > 0) ? getBetween(dura.parent().html(), preg, '<') : null

    //    
    let genres = $('div.articles > div.contentpost > div.konten > p').find(`b:contains("Genre"),strong:contains("Genre")`)
    genre += (genres.length > 0) ? getBetween(genres.parent().html(), preg, '<').replace("&nbsp;", '').split(',') : null
    let sizes = $('div.articles > div.contentpost > div.konten > p').find(`b:contains("Size"),strong:contains("Size")`)
    size += sizes.parent().text().replace("Size :", "")

    let dl_list = $('div.boxdownload > div.liner')
    dl_list = (dl_list.length > 0) ? dl_list : null
    if (dl_list != null) {
        dl_list.each((i, el) => {
            let gex = /[\d+]\d+/
            let quality = $(el).find('div.name').text()
            let r = []
            $(el).find('div.listlink > p > a').each((ii, ell) => {
                let server = $(ell).text()
                let url = $(ell).attr('href')
                r.push({
                    server: server,
                    url: url
                })
            })
            download_list.push({
                quality: quality,
                download: r
            })
        })
    }


    // 
    const related = []
    $('ul.related > li').each((i, el) => {
        let rtitle = '', rproducers = '', rstatus = '', rgenre = '', rduration = '', rimg = '', rrating = ''
        $$ = cheerio.load($(el).find('a.series').attr('original-title'))
        rtitle += $$('div.infoarea > h2').eq(0).text()
        rproducers += $$('p:contains("Produser")').text().replace("Produser: ", '')
        rstatus += $$('p:contains("Status")').text().replace("Status: ", '')
        rduration += $$('p:contains("Dura")').text().replace('Dura: ', '')
        rrating += $$('p:contains("Skor")').text().replace('Skor: ', '')
        rimg += $$('img.gambars').attr("src").replace($$('img.gambars').attr("src").match(re)[0], '')
        related.push({
            title: rtitle,
            image: rimg,
            producers: rproducers,
            status: rstatus,
            duration: rduration,
            rating: rrating
        })

    })

    res = {
        title: title,
        image: img,
        all_episode,
        synopsis: synopsis,
        genre: genre,
        producers: producers,
        duration: duration,
        size: size,
        download_list
    }


    return { data: res, related }


}


const detail = async (req, res) => {
    try {
        const http = /^(http|https)\:\/\//
        let path = req.query.path.includes('nekopoi.care') ? req.query.path.replace(req.query.path.match(http)[0] + 'nekopoi.care', '') : req.query.path
        // console.log(path);
        const { data } = await axios.get(`${config.url_api}/${path}`)
        let resultPush = []
        if (path.includes('hentai/')) {
            resultPush = detailSeries(data, path)
        }
        else {
            resultPush = detailH(data, path)
        }
        res.send({
            status: 200,
            result: resultPush
        })
    } catch (err) {
        res.send(err)
    }
}

module.exports = {
    detail
}