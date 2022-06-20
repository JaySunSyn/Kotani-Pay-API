import { Schema } from 'mongoose';

export const UserSchema = new Schema({
  id: String,
  name: String,
  phoneNumber: { type: [String], index: true },
  email: String,
});
