const fetch = require('node-fetch')
const cheerio = require('cheerio')

module.exports = fetch('https://yandex.ru/news')
  .then(res => res.text())
  .then(body => {
    const $ = cheerio.load(body)

    const newsRaw = $('.news-card')
    const newsArr = []
    let id = 0

    for (let el in newsRaw) {
      if (newsRaw[el].name === 'article') {
        newsArr.push({
          id: id,
          header: $(newsRaw[el]).find('.news-card__link').text(),
          url: $(newsRaw[el]).find('.news-card__link').attr('href'),
          desc: $(newsRaw[el]).find('.news-card__annotation').text(),
        })
        id++
      }
    }

    return newsArr
  })
  .catch(err => console.error(err))