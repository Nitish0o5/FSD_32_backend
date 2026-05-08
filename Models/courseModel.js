import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    shortDescription: {
      type: String,
      maxlength: 200,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Web Development',
        'Data Science',
        'Design',
        'Mobile Development',
        'DevOps',
        'AI & Machine Learning',
        'Business',
        'Other',
      ],
    },
    tags: [{ type: String }],
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    language: {
      type: String,
      default: 'English',
    },
    price: {
      type: Number,
      default: 0,
    },
    discountPrice: {
      type: Number,
      default: null,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    totalDuration: {
      type: Number,
      default: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    maxEnrollments: {
      type: Number,
      default: null,
    },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    requirements: [{ type: String }],
    whatYouLearn: [{ type: String }],
    certificate: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

courseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export default mongoose.model('Course', courseSchema);
