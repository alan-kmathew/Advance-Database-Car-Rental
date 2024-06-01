const mongoose = require('mongoose');

const NumbersSchema = new mongoose.Schema({
    numbers: { type: [Number], required: true },
});

const NumbersModel = mongoose.model('Exercise_Numbers', NumbersSchema);

module.exports = NumbersModel;
