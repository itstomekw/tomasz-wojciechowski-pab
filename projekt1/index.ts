const express = require('express')
const app = express()
app.get('/', function (req, res) {
       res.send('Hello World')
       
     })
app.get('/add/:int1/:int2',function(req,res){
    var num1 = req.params.int1
    var num2 = req.params.int2
    res.send(num1+num2)
})
  app.listen(3000)