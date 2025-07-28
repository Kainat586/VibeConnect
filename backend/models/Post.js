import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const commentSchema = new Schema({
  author: { type: Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new Schema({
  author: { type: Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  likes: [{ type: Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now },
});

export default model('Post', postSchema); 