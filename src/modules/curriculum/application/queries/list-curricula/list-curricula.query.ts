export class ListCurriculaQuery {
  constructor(
    public readonly filter?: {
      countryCode?: string;
      isActive?: boolean;
    },
  ) {}
}
