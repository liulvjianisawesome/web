const express = require('express')
const app = express()
const path = require('path')

app.use(express.static('public'))

app.set('views', path.join(__dirname, 'views')) // 设置存放模板文件的目录
app.set('view engine', 'ejs') // 设置模板引擎为ejs

app.get('/', function (req, res) {
  var id = req.query.autoid || 6058
  var panoUrl = req.query.url || '1.jpg'

  console.log(id, panoUrl)

  app.get('/index', function (req, res) {
    res.render('index', {
      infos: `{"curInfoIndex":0,"allInfos":[{"panoUrl":"${panoUrl}"}]}`,
    })
  })

  res.render('json', {
    autoid: id,
    url: 'localhost:3000/index'
  })
})

app.listen(3000)