const express = require('express');
const app = express();
const axios  = require('axios');

app.get('/streams/details/:id', async (req, res) => {
    let result = await axios.get(`http://localhost:8000/api/streams/`)
    console.log(result.data)
    res.json(result.data.live[req.params.id]);
})

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