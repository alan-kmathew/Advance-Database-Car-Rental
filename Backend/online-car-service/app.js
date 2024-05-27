const express = require('express');
const https = require('https');
const path = require('path');
const fs = require('fs');
const routes = require('./routes/routes');
const exampleRoutes = require('./routes/example.router');

const app = express();

app.use(express.json());

app.use('/', routes);
app.use('/internal/example', exampleRoutes);

module.exports = app;
