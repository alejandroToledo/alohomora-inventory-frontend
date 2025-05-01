// src/components/ResultCard.jsx
"use client";

import React, { useState } from "react";

export default function ResultCard({ item }) {
  // Recolectamos todas las fotos no vacías
  const photos = [
    item.photo1,
    item.photo2,
    item.photo3,
    item.photo4,
    item.photo5,
    item.photo6,
    item.photo7,
    item.photo8,
  ].filter((url) => url && url.trim() !== "");

  const [current, setCurrent] = useState(0);

  const prev = () => {
    setCurrent((current - 1 + photos.length) % photos.length);
  };

  const next = () => {
    setCurrent((current + 1) % photos.length);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
      {/* Carrusel mejorado */}
      {photos.length > 0 && (
        <div className="relative mb-6 group">
          <div className="overflow-hidden rounded-lg">
            <img
              src={photos[current]}
              alt={`Photo ${current + 1}`}
              className="w-full h-80 object-cover transition-transform duration-500 ease-in-out transform hover:scale-105"
            />
          </div>
          
          {/* Overlay con controles */}
          {photos.length > 1 && (
            <>
              {/* Botones de navegación */}
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#2F3E48] bg-opacity-80 text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-100"
                aria-label="Anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#2F3E48] bg-opacity-80 text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-100"
                aria-label="Siguiente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Indicadores de posición */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      current === index 
                        ? 'bg-[#61A043] w-8' 
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                    }`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>

              {/* Contador de imágenes */}
              <div className="absolute top-4 right-4 bg-[#2F3E48] bg-opacity-80 text-white px-3 py-1 rounded-full text-sm">
                {current + 1} / {photos.length}
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#2F3E48] mb-2">
            {item.entry_name}
          </h3>
          <div className="space-y-2">
            <p className="text-[#2F3E48]">
              <span className="font-medium">Tipo:</span>{" "}
              <span className="text-[#61A043]">{item.type}</span>
            </p>
            {item.notes && (
              <p className="text-[#2F3E48] whitespace-pre-wrap">
                <span className="font-medium">Notas:</span> {item.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
