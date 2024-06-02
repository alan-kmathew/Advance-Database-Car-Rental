const mongoose = require('mongoose');

const servicePointSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        image: { type: String, required: true },
        cars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }],
    },
    { collection: 'servicePoints' }
);

const carSchema = new mongoose.Schema({
    model: { type: String, required: true },
    make: { type: String, required: true },
    category: { type: String, required: true },
    basePrice: { type: Number, required: true },
    color: { type: String, required: true },
    plateNo: { type: String, required: true },
    servicePointId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServicePoint' },
    image: { type: String, required: true },
    seats: { type: Number, required: true },
});

const ServicePoint = mongoose.model('ServicePoint', servicePointSchema);

const Car = mongoose.model('Car', carSchema);

module.exports = {
    ServicePoint,
    Car,
};

const BookingsSchema = new mongoose.Schema({
    carId: { type: mongoose.Schema.Types.ObjectId, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
    },
    price: { type: Number, required: true },
    servicePointId: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: { type: String, required: true },
});
 
const BookingsModel = mongoose.model('Bookings', BookingsSchema);

module.exports = BookingsModel;