import { PodcastId } from "../value-objects/PodcastId";

export interface PodcastData {
  id: string;
  title: string;
  author: string;
  description: string;
  image: string;
  episodeCount?: number;
}

export class Podcast {
  private constructor(
    private readonly id: PodcastId,
    private readonly title: string,
    private readonly author: string,
    private readonly description: string,
    private readonly image: string,
    private readonly episodeCount: number = 0
  ) {}

  static create(data: PodcastData): Podcast {
    return new Podcast(
      PodcastId.create(data.id),
      data.title.trim(),
      data.author.trim(),
      data.description.trim(),
      data.image.trim(),
      data.episodeCount || 0
    );
  }

  // Lógica de negocio: obtener mejor calidad de imagen
  getBestImageUrl(): string {
    return this.image.replace("55x55bb", "600x600bb");
  }

  // Lógica de negocio: búsqueda flexible
  matches(searchTerm: string): boolean {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    return (
      this.title.toLowerCase().includes(term) ||
      this.author.toLowerCase().includes(term)
    );
  }

  // Lógica de negocio: nombre para mostrar
  toDisplayName(): string {
    return `${this.title} - ${this.author}`;
  }

  // Getters
  getId(): PodcastId {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getAuthor(): string {
    return this.author;
  }

  getDescription(): string {
    return this.description;
  }

  getImage(): string {
    return this.image;
  }

  getEpisodeCount(): number {
    return this.episodeCount;
  }

  // Para compatibilidad con código actual
  toPlainObject(): PodcastData {
    return {
      id: this.id.getValue(),
      title: this.title,
      author: this.author,
      description: this.description,
      image: this.image,
      episodeCount: this.episodeCount,
    };
  }
}
