import { Link } from "react-router-dom";
import { PodcastEntry } from "../types/podcast";
import "./PodcastSidebar.css";

interface PodcastSidebarProps {
  podcast: PodcastEntry;
  linkTo?: string; // Optional - if provided, makes image/title/author clickable
}

export function PodcastSidebar({ podcast, linkTo }: PodcastSidebarProps) {
  const getImage = (pod: PodcastEntry): string => {
    const imgs = pod?.["im:image"] ?? [];
    const by600 = imgs.find((x) => x?.attributes?.height === "600");
    const by170 = imgs.find((x) => x?.attributes?.height === "170");
    return by600?.label || by170?.label || imgs.at(-1)?.label || "";
  };

  const title = podcast?.["im:name"]?.label || "";
  const author = podcast?.["im:artist"]?.label || "";
  const image = getImage(podcast);

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
