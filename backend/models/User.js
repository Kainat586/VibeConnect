import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String },
  avatarUrl: { type: String },
  bio: { type: String },
  friends: [{ type: Types.ObjectId, ref: 'User' }],
  friendRequests: {
    sent: [{ type: Types.ObjectId, ref: 'User' }],
    received: [{ type: Types.ObjectId, ref: 'User' }],
  },
}, { timestamps: true });

export default model('User', userSchema); 