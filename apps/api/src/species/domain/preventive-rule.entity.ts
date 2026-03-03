export class PreventiveRule {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly speciesId: string,
    public readonly type: 'vaccination' | 'deworming',
    public readonly applicableMinAge: number | null,
    public readonly applicableMaxAge: number | null
  ) {}
}