export class Pet {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public readonly name: string,
    public readonly speciesId: string,
    public readonly birthDate: Date,
    public readonly breed: string,
    public readonly expectedLifeSpanYears: number | null
  ) {}
}
