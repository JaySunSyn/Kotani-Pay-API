import { Schema } from 'mongoose';

export const AccountSchema = new Schema({
  publicAddress: { type: [String], index: true },
  seedKey: String,
});
