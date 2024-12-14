const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    professorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String,
        required: true,
        match: /^\d{4}-\d{2}-\d{2}$/, // Ensures YYYY-MM-DD format
    },
    startTime: {
        type: String,
        required: true,
        match: /^\d{2}:\d{2}$/, // Ensures HH:mm format
    },
    endTime: {
        type: String,
        required: true,
        match: /^\d{2}:\d{2}$/, // Ensures HH:mm format
    },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
