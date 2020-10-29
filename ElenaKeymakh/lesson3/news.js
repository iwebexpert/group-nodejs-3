const request = require('request')
const cheerio = require('cheerio')

request('https://yandex.ru/news/', (err, response, body) => {
  if(!err &&  response.statusCode === 200){
    const $ = cheerio.load(body)

    for(let i = 0; i < 10; i++){
      const newsTitle = $('.news-card__title').eq(i).text()

      const newsText = $('.news-card__annotation ').eq(i).text()

      console.log(`Заголовок: ${newsTitle}`)
      console.log(`Текст новости: ${newsText}\n`)
    }
  }
  })
