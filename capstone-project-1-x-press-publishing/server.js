const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const apiRouter = require('./api/api');

const PORT = process.env.PORT || 4000;
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(errorhandler());
app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

module.exports = app;