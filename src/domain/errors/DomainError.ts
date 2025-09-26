export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class PodcastNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Podcast with ID ${id} not found`);
  }
}

export class EpisodeNotFoundError extends DomainError {
  constructor(id: string, podcastId?: string) {
    const context = podcastId ? ` in podcast ${podcastId}` : "";
    super(`Episode with ID ${id}${context} not found`);
  }
}

export class InvalidPodcastIdError extends DomainError {
  constructor(value: string) {
    super(`Invalid podcast ID: ${value}`);
  }
}
