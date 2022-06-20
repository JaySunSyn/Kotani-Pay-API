import { IsDate, IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { DocumentTypes } from '@kotanicore/services/interfaces';

export class SetKycDto {
  @IsNotEmpty()
  documentNumber: string;

  @IsEnum(DocumentTypes)
  documentType: string;

  @IsDateString()
  dateOfBirth;
}
