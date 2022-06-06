import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from '@kotanicore/services/core.module';
import { AuthModule } from '@kotanicore/auth';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017'),
    CoreModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
