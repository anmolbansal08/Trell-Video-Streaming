const express = require('express');
const app = express();
const axios  = require('axios');

app.get('/streams/:id', (req, res) => {
    res.render("stream.ejs",{
        id: req.params.id
      });
      console.log(req.params.id);
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App Listening at http://localhost:${port}`)
})