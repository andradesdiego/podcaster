import React from "react";
import { Link } from "react-router-dom";

const ErrorPage: React.FC = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "10vh" }}>
      <h1>Something went wrong</h1>
      <p>
        An unexpected error occurred. Please try again later or contact support.
      </p>
      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "0.5rem 1rem",
            marginRight: "1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
        <Link
          to="/"
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#6c757d",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
