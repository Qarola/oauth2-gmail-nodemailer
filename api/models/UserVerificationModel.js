const mongoose = require('mongoose');

const UserVerificationSchema = new mongoose.Schema(
  {
    userId: {
       type: String,
    },
    uniqueString: {
      type: String,
      required: true,
      unique: true,
    },
    createdAt: {
      type: Date,
    },
    expiresAt: {
     type: Date
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserVerification", UserVerificationSchema);
