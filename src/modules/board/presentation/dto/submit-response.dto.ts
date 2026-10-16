import { ResponseType } from '../../domain';

export class SubmitResponseDto {
  responseType: ResponseType;
  textContent?: string;
  imageUrl?: string;
  selectedOption?: string;
}
