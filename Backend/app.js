const express = require('express');
const cors = require('cors'); 
const https = require('https');
const path = require('path');
const fs = require('fs');
const routes = require('./routes/routes');
const carRoutes = require('./routes/car.router');

const app = express();

app.use(cors()); 
app.use(express.json());
app.use(cors());
app.use('/', routes);
app.use('/api/car', carRoutes);

module.exports = app;