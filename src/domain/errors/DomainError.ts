export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class PodcastNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Podcast con ID ${id} no encontrado`);
  }
}

export class EpisodeNotFoundError extends DomainError {
  constructor(id: string, podcastId?: string) {
    const context = podcastId ? ` en podcast ${podcastId}` : "";
    super(`Episodio con ID ${id}${context} no encontrado`);
  }
}

export class InvalidPodcastIdError extends DomainError {
  constructor(value: string) {
    super(`ID de podcast inválido: ${value}`);
  }
}
