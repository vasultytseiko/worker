import { PartialType } from '@nestjs/mapped-types';
import { SignUpDto } from './user.dto';

export class UpdateUserDto extends PartialType(SignUpDto) {
  login: string;
  password: string;
}
