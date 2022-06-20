import { Module } from '@nestjs/common';
import { RepositoryService } from './repository.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AccountSchema,
  KycSchema,
  UserSchema,
} from '@kotanicore/repository/schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'user', schema: UserSchema },
      { name: 'accounts', schema: AccountSchema },
      { name: 'kycdata', schema: KycSchema },
    ]),
  ],
  providers: [RepositoryService],
  exports: [RepositoryService],
})
export class RepositoryModule {}
