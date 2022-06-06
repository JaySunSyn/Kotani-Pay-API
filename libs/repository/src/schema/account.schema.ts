import { Schema } from 'mongoose';

export const AccountSchema = new Schema({
  publicAddress: String,
  seedKey: String,
});
