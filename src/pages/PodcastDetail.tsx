import { useParams } from "react-router-dom";
import { usePodcast } from "../context/PodcastContext";
import { PodcastEntry } from "../types/podcast";
import "./PodcastDetail.css";

export function PodcastDetail() {
  const { id } = useParams<{ id: string }>();
  const { podcasts, loading, error } = usePodcast();

  if (loading) {
    return (
      <div className="podcast-detail-loading">
        <p>Loading podcast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="podcast-detail-error">
        <p>Error loading podcast: {error}</p>
      </div>
    );
  }

  const podcast = podcasts.find(
    (p: PodcastEntry) => p?.id?.attributes?.["im:id"] === id
  );

  if (!podcast) {
    return (
      <div className="podcast-detail-not-found">
        <p>Podcast not found</p>
      </div>
    );
  }

  const getImage = (pod: PodcastEntry): string => {
    const imgs = pod?.["im:image"] ?? [];
    const by600 = imgs.find((x) => x?.attributes?.height === "600");
    const by170 = imgs.find((x) => x?.attributes?.height === "170");
    return by600?.label || by170?.label || imgs.at(-1)?.label || "";
  };

  const title = podcast?.["im:name"]?.label || "";
  const author = podcast?.["im:artist"]?.label || "";
  const image = getImage(podcast);

  return (
    <div className="podcast-detail">
      <div className="podcast-detail__sidebar">
        <div className="podcast-detail__image-container">
          <img
            src={image}
            alt={`${title} podcast cover`}
            className="podcast-detail__image"
          />
        </div>
        <div className="podcast-detail__info">
          <h1 className="podcast-detail__title">{title}</h1>
          <p className="podcast-detail__author">by {author}</p>
          <div className="podcast-detail__description">
            <p>Description coming soon...</p>
          </div>
        </div>
      </div>

      <div className="podcast-detail__main">
        <div className="podcast-detail__episodes-header">
          <h2>Episodes (20)</h2>
        </div>
        <div className="podcast-detail__episodes">
          <p>Episodes list coming soon...</p>
        </div>
      </div>
    </div>
  );
}
