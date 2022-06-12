import { Schema } from 'mongoose';

export const KycSchema = new Schema({
  dateOfBirth: String,
  documentNumber: { type: [String], index: true },
  documentType: String,
});
