import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsPhoneNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  //TODO: Incorporate other locales
  @IsMobilePhone('en-KE')
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
