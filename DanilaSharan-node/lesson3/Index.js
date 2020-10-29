const fetch = require('node-fetch')
const cheerio = require('cheerio')
const chalk = require('chalk')

const fetchData = async (url) => {
  try {
    const response = await fetch(url)
    return await response.text()
  } catch (error) {
    console.log('error: ', error)
  }
}

fetchData('https://trends.rbc.ru/trends/innovation/short_news/').then(body => {
  const $ = cheerio.load(body)
  let i = 1
  $('.js-short-news-container').find('.js-short-news-item').map(function () {
    const title = $(this).find('.item__title').text()
    console.log(i++, '. ', chalk.red.bold(title))
  })
})
