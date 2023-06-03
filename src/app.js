const express = require('express');
const crossOrigin = require('cors');
const pinoHTTP = require('pino-http');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('../src/middleware/pinoLogger');
const Router = require('../src/routes/index');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// secure HTTP headers setting middleware
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

// allow cross-origin resource sharing
app.use(crossOrigin());

app.options('*', cors());

app.use(helmet());

app.use('/api/v1', Router);

app.use(
  pinoHTTP({
    logger,
  })
);

module.exports = app;
