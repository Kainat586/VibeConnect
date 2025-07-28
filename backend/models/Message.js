import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const messageSchema = new Schema({
  sender: { type: Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

export default model('Message', messageSchema); 