const request = require('request')
const cheerio = require('cheerio')
const chalk = require('chalk')
//
// request('https://habr.com/ru/feed/', (err, response, body) => {
//     if(!err && response.statusCode === 200) {
//         const $ = cheerio.load(body)
//
//         const news = $('li.content-list__item_news-topic').slice(0, 4).contents().text()
//
//         console.log(chalk.magenta(`Горячие новости:${news}`))
//     }
// })

console.log('works')

