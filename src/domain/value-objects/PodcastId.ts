export class PodcastId {
  private constructor(private readonly value: string) {}

  static create(value: string | number): PodcastId {
    const id = String(value).trim();

    if (!id) {
      throw new Error("PodcastId no puede estar vacío");
    }

    if (!/^\d+$/.test(id)) {
      throw new Error("PodcastId debe ser numérico");
    }

    return new PodcastId(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PodcastId): boolean {
    return this.value === other.value;
  }
}
