// src/components/SearchForm.jsx
"use client";

import React from "react";

export default function SearchForm({ query, onChange, onSubmit, loading }) {
  const isEmpty = !query || query.trim() === "";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Ej: 2019 Toyota Camry PTS"
          value={query}
          onChange={onChange}
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-[#61A043] focus:ring-2 focus:ring-[#61A043] focus:ring-opacity-50 outline-none transition-all text-[#2F3E48]"
        />
      </div>
      <button
        type="submit"
        disabled={loading || isEmpty}
        className="w-full py-4 bg-[#61A043] hover:bg-[#4d7f35] text-white rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Buscando..." : "Buscar"}
      </button>
    </form>
  );
}
