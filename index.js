const express = require('express')
const app = express()
const path = require('path')

app.use(express.static('public'))

app.set('views', path.join(__dirname, 'views')) // 设置存放模板文件的目录
app.set('view engine', 'ejs') // 设置模板引擎为ejs

app.get('/', function (req, res) {
  var id = req.query.autoid
  var attachment = req.query.attachment
  var panoUrl = "http://ceecd014.sz.ue.net.cn" + attachment

  console.log(id, panoUrl)
  console.log(attachment.split('/'))
  var key = attachment.split('/')[4]

  app.get('/' + key, function (req, res) {
    res.render('index', {
      infos: `{"curInfoIndex":0,"allInfos":[{"panoUrl":"${panoUrl}"}]}`,
    })
  })

  res.render('json', {
    autoid: id,
    url: 'http://119.23.212.236:3000/' + key
  })
})

app.listen(3000)