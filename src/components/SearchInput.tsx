import { ChangeEvent } from "react";
import "./SearchInput.css";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Filter podcasts...",
  disabled = false,
}: SearchInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="search-input">
      <div className="search-input__container">
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="search-input__clear"
            aria-label="Clear search"
            disabled={disabled}
          >
            ×
          </button>
        )}
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className="search-input__field"
          aria-label="Search podcasts"
        />
      </div>
    </div>
  );
}
