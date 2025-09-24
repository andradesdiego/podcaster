// src/components/PodcastCard.tsx
import "./PodcastCard.css";

interface PodcastCardProps {
  imageUrl: string;
  title: string;
  author: string;
  onClick?: () => void;
}

export function PodcastCard({
  imageUrl,
  title,
  author,
  onClick,
}: PodcastCardProps) {
  return (
    <li className="podcast-card" onClick={onClick}>
      <div className="podcast-card__image-container">
        <img
          src={imageUrl}
          alt={`${title} podcast cover`}
          className="podcast-card__image"
          loading="lazy"
        />
      </div>
      <div className="podcast-card__content">
        <h3 className="podcast-card__title">{title}</h3>
        <p className="podcast-card__author">Author: {author}</p>
      </div>
    </li>
  );
}
