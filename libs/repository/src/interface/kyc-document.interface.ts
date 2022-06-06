import { Document } from 'mongoose';

export interface KycDocumentInterface extends Document {
  dateOfBirth: string;
  documentNumber: string;
  documentType: string;
}
