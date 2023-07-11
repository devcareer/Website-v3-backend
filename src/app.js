const express = require('express');
const path = require('path');
const cors = require('cors');
const pinoHTTP = require('pino-http');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const logger = require('../src/middleware/pinoLogger');
const errorHandler = require('./middleware/errorHandler');
const Router = require('../src/routes/index');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cookieParser());

// Secure HTTP headers setting middleware
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

// Allow cross-origin resource sharing
app.use(cors({ origin: '*' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(hpp());

app.use(helmet());

app.use('/api/v1', Router);

// send back a 404 error for any unknown api request
app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

app.use(
  pinoHTTP({
    logger,
  })
);

app.use(errorHandler);

module.exports = app;
