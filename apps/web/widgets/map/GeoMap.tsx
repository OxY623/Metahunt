"use client";

import { useEffect } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { divIcon } from "leaflet";

import type { GeoTile } from "../../lib/api";

export type GeoMapViewport = {
  bbox: string;
  zoom: number;
  center: { lat: number; lng: number };
};

type GeoMapProps = {
  tiles: GeoTile[];
  selectedTileId: string | null;
  onSelectTile: (tileId: string) => void;
  onViewportChange: (state: GeoMapViewport) => void;
};

function decodeTileId(tileId: string): { lat: number; lng: number } | null {
  const match = /^x(-?\d+)y(-?\d+)$/i.exec(tileId);
  if (!match) return null;

  const x = Number(match[1]);
  const y = Number(match[2]);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  return {
    lat: x / 10 - 90 + 0.05,
    lng: y / 10 - 180 + 0.05,
  };
}

function archetypeColor(archetype: GeoTile["dominant_archetype"]): string {
  if (archetype === "FOXY") return "#ff3af2";
  if (archetype === "OXY") return "#00f0ff";
  if (archetype === "BEAR") return "#fbbf24";
  if (archetype === "OWL") return "#b794ff";
  return "#7f8ea5";
}

function makeMarker(color: string, selected: boolean) {
  const size = selected ? 20 : 14;
  return divIcon({
    className: "",
    html: `<span style=\"display:block;width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2px solid rgba(11,15,26,0.9);box-shadow:0 0 14px ${color};\"></span>`,
    iconSize: [size, size],
    iconAnchor: [Math.round(size / 2), Math.round(size / 2)],
  });
}

function ViewportSync({
  onViewportChange,
}: {
  onViewportChange: (state: GeoMapViewport) => void;
}) {
  const map = useMapEvents({
    moveend: emit,
    zoomend: emit,
  });

  function emit() {
    const bounds = map.getBounds();
    const center = map.getCenter();
    const bbox = [
      bounds.getSouth().toFixed(6),
      bounds.getWest().toFixed(6),
      bounds.getNorth().toFixed(6),
      bounds.getEast().toFixed(6),
    ].join(",");

    onViewportChange({
      bbox,
      zoom: map.getZoom(),
      center: { lat: center.lat, lng: center.lng },
    });
  }

  useEffect(() => {
    emit();
  }, []);

  return null;
}

export function GeoMap({
  tiles,
  selectedTileId,
  onSelectTile,
  onViewportChange,
}: GeoMapProps) {
  return (
    <div className="h-[460px] w-full overflow-hidden rounded-xl border border-meta-border">
      <MapContainer
        center={[53.9023, 27.5619]}
        zoom={11}
        className="h-full w-full"
        scrollWheelZoom
      >
        <ViewportSync onViewportChange={onViewportChange} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {tiles.map((tile) => {
          const point = decodeTileId(tile.tile_id);
          if (!point) return null;

          const selected = selectedTileId === tile.tile_id;
          const color = archetypeColor(tile.dominant_archetype);
          const radius = 8 + Math.max(0, Math.min(1, tile.intensity)) * 18;

          return (
            <Circle
              key={`heat-${tile.tile_id}`}
              center={[point.lat, point.lng]}
              radius={selected ? radius * 130 : radius * 100}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: selected ? 0.36 : 0.2,
                weight: selected ? 2 : 1,
              }}
              eventHandlers={{
                click: () => onSelectTile(tile.tile_id),
              }}
            />
          );
        })}

        {tiles.map((tile) => {
          const point = decodeTileId(tile.tile_id);
          if (!point) return null;
          const selected = selectedTileId === tile.tile_id;
          const color = archetypeColor(tile.dominant_archetype);

          return (
            <Marker
              key={`marker-${tile.tile_id}`}
              position={[point.lat, point.lng]}
              icon={makeMarker(color, selected)}
              eventHandlers={{
                click: () => onSelectTile(tile.tile_id),
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div><strong>Tile:</strong> {tile.tile_id}</div>
                  <div><strong>Intensity:</strong> {tile.intensity.toFixed(2)}</div>
                  <div><strong>Archetype:</strong> {tile.dominant_archetype ?? "none"}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
