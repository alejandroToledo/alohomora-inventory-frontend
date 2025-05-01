"use client";
import { useState } from "react";
import SearchForm from "../components/searchForm";
import ResultCard from "../components/resultCard";

export default function Home() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);
    try {
      const resp = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      console.log(resp);
      
      if (!resp.ok) throw new Error((await resp.json()).error || resp.statusText);
      const json = await resp.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2F3E48] text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Alohomora Inventory</h1>
          <p className="text-gray-300">Encuentra las llaves que necesitas</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <SearchForm
            query={query}
            onChange={(e) => setQuery(e.target.value)}
            onSubmit={handleSearch}
            loading={loading}
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {data.exact.length > 0 ? (
              data.exact.map((r, i) => <ResultCard key={i} item={r} />)
            ) : data.alternatives.length > 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-[#2F3E48]">Resultados similares:</h2>
                <div className="space-y-2">
                  {data.alternatives.map((r, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                      <p className="text-[#2F3E48]">
                        <span className="font-medium">{r.brand}</span> {r.model} {r.year} 
                        <span className="text-[#61A043] ml-2">({r.type})</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <p className="text-[#2F3E48]">No se encontraron resultados.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
