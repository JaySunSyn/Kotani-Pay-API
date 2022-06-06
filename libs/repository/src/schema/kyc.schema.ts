import { Schema } from 'mongoose';

export const KycSchema = new Schema({
  dateOfBirth: String,
  documentNumber: String,
  documentType: String,
});
