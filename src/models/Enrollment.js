const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    status:      { type: String, enum: ['free', 'paid'], required: true },
    amountPaid:  { type: Number, default: 0 },
    paymentId:   { type: String, default: null },
    orderId:     { type: String, default: null },
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
