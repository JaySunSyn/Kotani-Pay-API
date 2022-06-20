import {
  IsInt,
  IsMobilePhone,
  IsPhoneNumber,
  IsPositive,
  Min,
} from 'class-validator';

export class GetBalanceDto {
  @IsMobilePhone('en-KE')
  phoneNumber: string;
}
