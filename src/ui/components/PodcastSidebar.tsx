// Update PodcastSidebar.tsx:

import { Link } from "react-router-dom";
import { PodcastListDTO } from "../../application/dto/PodcastDTO";
import "./PodcastSidebar.css";

interface PodcastSidebarProps {
  podcast: PodcastListDTO; // Changed from PodcastEntry
  linkTo?: string;
}

export function PodcastSidebar({ podcast, linkTo }: PodcastSidebarProps) {
  // Simplified - DTO already has clean properties
  const title = podcast.title;
  const author = podcast.author;
  const image = podcast.image;

  const ImageComponent = linkTo ? (
    <Link to={linkTo}>
      <img
        src={image}
        alt={`${title} podcast cover`}
        className="podcast-sidebar__image"
      />
    </Link>
  ) : (
    <img
      src={image}
      alt={`${title} podcast cover`}
      className="podcast-sidebar__image"
    />
  );

  const TitleComponent = linkTo ? (
    <Link to={linkTo} className="podcast-sidebar__title-link">
      <h1 className="podcast-sidebar__title">{title}</h1>
    </Link>
  ) : (
    <h1 className="podcast-sidebar__title">{title}</h1>
  );

  const AuthorComponent = linkTo ? (
    <Link to={linkTo} className="podcast-sidebar__author-link">
      <p className="podcast-sidebar__author">by {author}</p>
    </Link>
  ) : (
    <p className="podcast-sidebar__author">by {author}</p>
  );

  return (
    <div className="podcast-sidebar">
      <div className="podcast-sidebar__image-container">{ImageComponent}</div>
      <div className="podcast-sidebar__info">
        {TitleComponent}
        {AuthorComponent}
        <div className="podcast-sidebar__description">
          <p>Description: {title}</p>
        </div>
      </div>
    </div>
  );
}
