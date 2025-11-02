import React from "react";
import { useNavigate } from "react-router-dom";

export interface MovieSummary {
  id: string;
  title: string;
  posterUrl?: string;
  rating?: number;
  review?: string;
}

interface Props {
  movie: MovieSummary;
}

const MovieCard: React.FC<Props> = ({ movie }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Option A: pass review and rating via navigation state
    navigate(`/movies/${movie.id}`, {
      state: {
        movie,
        rating: movie.rating,
        review: movie.review,
      },
    });

    // Option B (alternative): navigate only with id and let the details page fetch full data:
    // navigate(`/movies/${movie.id}`);
  };

  return (
    <article
      onClick={handleClick}
      role="button"
      aria-label={`Open ${movie.title} details`}
      style={{
        cursor: "pointer",
        border: "1px solid #ddd",
        padding: 12,
        borderRadius: 8,
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      {movie.posterUrl && (
        <img src={movie.posterUrl} alt={movie.title} style={{ width: 72, height: 100, objectFit: "cover" }} />
      )}
      <div>
        <h3 style={{ margin: 0 }}>{movie.title}</h3>
        <div style={{ marginTop: 6 }}>
          <strong>Rating:</strong> {movie.rating ?? "—"}
        </div>
        <div style={{ marginTop: 6, color: "#555" }}>
          {movie.review ? `${movie.review.slice(0, 120)}${movie.review.length > 120 ? "…" : ""}` : "No review yet"}
        </div>
      </div>
    </article>
  );
};

export default MovieCard;
