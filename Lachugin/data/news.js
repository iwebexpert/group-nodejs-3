const request = require("request");
const cheerio = require("cheerio");

let newsArray = [];

request("https://3dnews.ru/news", (err, response, body) => {
  if (!err && response.statusCode === 200) {
    console.log("Все данные успешно получены!");
    const $ = cheerio.load(body);
    $(".article-entry").each(function () {
      let article = {};
      article.title = $(this).find("h1").text();
      article.content = $(this).find("p").text();
      newsArray.push(article);
    });
  }
});

module.exports = newsArray;
