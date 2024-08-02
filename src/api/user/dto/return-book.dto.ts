import { IsNumber } from "class-validator";

export class ReturnBookDto {
  @IsNumber()
  score: number;
}