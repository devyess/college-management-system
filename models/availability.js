const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    professorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
    },
    startTime: {
        type: String, // Format: HH:mm
        required: true,
    },
    endTime: {
        type: String, // Format: HH:mm
        required: true,
    },
});

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;
