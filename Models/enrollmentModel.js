import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trainingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Training',
        required: true
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure a user cannot enroll in the same training twice
enrollmentSchema.index({ userId: 1, trainingId: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;
