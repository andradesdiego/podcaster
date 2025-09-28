import { PodcastId } from '../value-objects/PodcastId';
export interface EpisodeData {
  id: string;
  title: string;
  description: string;
  audioUrl?: string;
  duration?: number;
  publishedAt: string;
  podcastId: string;
}

export class Episode {
  private constructor(
    private readonly id: string,
    private readonly title: string,
    private readonly description: string,
    private readonly audioUrl: string | null,
    private readonly duration: number | null,
    private readonly publishedAt: Date,
    private readonly podcastId: PodcastId
  ) {}

  static create(data: EpisodeData): Episode {
    return new Episode(
      data.id.trim(),
      data.title.trim(),
      data.description.trim(),
      data.audioUrl?.trim() || null,
      data.duration || null,
      new Date(data.publishedAt),
      PodcastId.create(data.podcastId)
    );
  }

  hasAudio(): boolean {
    return this.audioUrl !== null && this.audioUrl.length > 0;
  }

  getFormattedDuration(): string {
    if (!this.duration) return '--:--';

    const hours = Math.floor(this.duration / 3600);
    const minutes = Math.floor((this.duration % 3600) / 60);
    const seconds = this.duration % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getMinutesForTable(): string {
    if (!this.duration) return '-';

    const totalMinutes = Math.floor(this.duration / 60);
    return `${totalMinutes} min`;
  }

  getFormattedDate(): string {
    return this.publishedAt.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  getId(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getAudioUrl(): string | null {
    return this.audioUrl;
  }

  getDuration(): number | null {
    return this.duration;
  }

  getPublishedAt(): Date {
    return this.publishedAt;
  }

  getPodcastId(): PodcastId {
    return this.podcastId;
  }

  toPlainObject(): EpisodeData {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      audioUrl: this.audioUrl || undefined,
      duration: this.duration || undefined,
      publishedAt: this.publishedAt.toISOString(),
      podcastId: this.podcastId.getValue(),
    };
  }
}
