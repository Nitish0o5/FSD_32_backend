import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      unique: true,
      default: () => `SKLPTH-${uuidv4().slice(0, 8).toUpperCase()}`,
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    verificationUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Certificate', certificateSchema);
