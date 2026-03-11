
"use client"

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import { useEffect, useState } from "react"
import L, { type LeafletMouseEvent } from "leaflet"
import "leaflet/dist/leaflet.css"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src ?? markerIcon2x,
  iconUrl: markerIcon.src ?? markerIcon,
  shadowUrl: markerShadow.src ?? markerShadow
})

export type Position = {
  lat: number
  lng: number
}

function LocationMarker({ setPosition }: { setPosition: (pos: Position) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      })
    }
  })

  return null
}

export default function MapPicker({ defaultPos, onChange }:{ defaultPos?: Position|null, onChange: (pos: Position | null)=>void }) {
  const [position, setPosition] = useState<Position | null>(defaultPos||null);

  useEffect(()=>{
    if(!position){
      navigator.geolocation.getCurrentPosition((pos) => setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      }));
    }
  },[])
  useEffect(()=>{
    onChange(position)
  }, [position])

  const center: [number, number] = position ? [position.lat, position.lng] : [13.7563, 100.5018];

  return (
    <MapContainer
      center={center}
      zoom={9}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='© OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationMarker setPosition={setPosition} />

      {position && <Marker position={[position.lat, position.lng]} />}
    </MapContainer>
  )
}