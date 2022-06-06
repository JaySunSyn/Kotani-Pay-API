import { Document } from 'mongoose';

export interface AccountDocumentInterface extends Document {
  publicAddress: string;
  seedKey: string;
}
