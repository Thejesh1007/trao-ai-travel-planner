const mongoose = require('mongoose');

// Schema = blueprint/structure for our User documents in MongoDB
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // name is mandatory
      trim: true,     // removes extra spaces automatically
    },
    email: {
      type: String,
      required: true,
      unique: true,   // no two users can have the same email
      lowercase: true, // always stores email in lowercase
      trim: true,
    },
    password: {
      type: String,
      required: true,
      // NOTE: we never store plain text passwords
      // bcryptjs will hash it before saving (done in controller)
    },
  },
  {
    // timestamps: true automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// mongoose.model() creates the actual model from the schema
// 'User' becomes the collection name 'users' in MongoDB (auto-pluralized)
module.exports = mongoose.model('User', UserSchema);