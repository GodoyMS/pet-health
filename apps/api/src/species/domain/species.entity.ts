export class Species {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly imageUrl: string | null,
    public readonly breeds: ReadonlyArray<{ id: string; name: string }>
  ) {}
}
