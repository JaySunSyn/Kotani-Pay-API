import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '@kotanicore/auth/auth.service';
import { JwtStrategy } from '@kotanicore/auth/guards/jwt.strategy';
import { RepositoryModule } from '@kotanicore/repository';

//Todo: Move Secret to Env
@Module({
  imports: [
    RepositoryModule,
    PassportModule,
    JwtModule.register({ secret: 'hard!to-guess_secret' }),
  ],
  exports: [AuthService],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
