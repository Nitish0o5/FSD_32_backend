const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "dropped", "waitlisted"],
      default: "active",
    },
    progress: {
      type: Number, // percentage 0-100
      default: 0,
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    lastAccessedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    certificate: {
      issued: { type: Boolean, default: false },
      issuedAt: { type: Date, default: null },
      certificateId: { type: String, default: null },
    },
    rating: {
      score: { type: Number, min: 1, max: 5, default: null },
      review: { type: String, default: "" },
      reviewedAt: { type: Date, default: null },
    },
    // Payment info (for paid courses)
    payment: {
      amount: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ["free", "paid", "refunded"],
        default: "free",
      },
      transactionId: { type: String, default: null },
    },
  },
  { timestamps: true }
);

// Prevent duplicate enrollments
enrollmentSchema.index({ learner: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
