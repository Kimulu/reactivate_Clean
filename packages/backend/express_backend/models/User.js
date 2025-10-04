// models/User.js - Defines the Mongoose schema for a User

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  // 💡 FIX: Added email field with required: true and lowercase
  email: {
    type: String,
    required: true, // 💡 Now required as per frontend
    unique: true,
    trim: true,
    lowercase: true, // 💡 Good practice for emails
  },
  password: {
    type: String,
    required: true,
    select: false, // 💡 FIX: Prevents password from being returned in queries by default
  },
});

// Middleware to hash the password before saving the user
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare the provided password with the hashed password
// This method is used by login route to verify password.
userSchema.methods.comparePassword = async function (candidatePassword) {
  // 'this.password' here will contain the hashed password due to 'select: false'
  // it needs to be explicitly selected in the query for it to be available.
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
