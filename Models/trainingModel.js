import mongoose from 'mongoose';

const trainingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    seatLimit: {
        type: Number,
        required: true,
        min: 1
    },
    seatsFilled: {
        type: Number,
        default: 0
    } // We will manually increment/decrement this to ensure consistency
}, { timestamps: true });

const Training = mongoose.model('Training', trainingSchema);
export default Training;
