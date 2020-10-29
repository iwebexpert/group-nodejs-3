const axios = require('axios')
const cheerio = require('cheerio')

module.exports = {
  getNews: async () => {
      const response = await axios.get('https://yandex.ru/news')
      const $ = cheerio.load(response.data)
      return $('.news-card').toArray().map(e => {
        return {
          link: $(e).find('.news-card__link').attr('href'),
          title: $(e).find('.news-card__title').text(),
          description: $(e).find('.news-card__annotation').text(),
          img: $(e).find('.neo-image').attr('src'),
        }
      }) || []
  }
}

