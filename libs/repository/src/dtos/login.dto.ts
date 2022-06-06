import { IsMobilePhone, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsMobilePhone('en-KE')
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
