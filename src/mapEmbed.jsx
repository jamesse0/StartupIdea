import React from 'react';

// The Embed key is public on purpose: it only works for the free Maps Embed API and only on our own sites.
// The paid Geocoding key stays on the server (see service/mapsConfig.json).
const EMBED_KEY = import.meta.env.VITE_GOOGLE_EMBED_KEY;

export const hasMapEmbed = Boolean(EMBED_KEY);

// An interactive Google map pinned at the given coordinates. Renders nothing without coordinates or a key.
export function MapEmbed({ coords, label, className }) {
  if (!EMBED_KEY || !coords) {
    return null;
  }
  const src = `https://www.google.com/maps/embed/v1/place?key=${EMBED_KEY}&q=${coords.lat},${coords.lng}&zoom=17`;
  return (
    <iframe
      className={className}
      title={`Map of ${label}`}
      src={src}
      loading="lazy"
      allowFullScreen
      // Google checks the page's address against the key's Websites restriction, so it has to be sent
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
