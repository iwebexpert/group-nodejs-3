const express = require('express')
const router = express.Router()
const Parser = require('rss-parser')

const getNews = async (count) => {
  const parser = new Parser()
  const feed = await parser.parseURL('https://news.yandex.ru/world.rss')
  let news = feed.items.map((n) => n.title)

  if (count) {
    news = news.slice(0, count)
  }

  return news
}

router.get('/', async (req, res) => {
  const { newsCount } = req.cookies
  const news = await getNews(newsCount)
  res.render('news', { news, newsCount })
})

router.post('/', async (req, res) => {
  let { newsCount } = req.body

  if (newsCount) {
    if (newsCount > 200) {
      newsCount = 200
    }
    res.cookie('newsCount', newsCount)
  }
  const news = await getNews(newsCount)
  res.render('news', { news, newsCount })
})

module.exports = router
