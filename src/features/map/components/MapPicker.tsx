
"use client"

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import { useEffect, useState } from "react"
import L, { type LeafletMouseEvent } from "leaflet"
import "leaflet/dist/leaflet.css"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import { Location } from "@/lib/utils"

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src ?? markerIcon2x,
  iconUrl: markerIcon.src ?? markerIcon,
  shadowUrl: markerShadow.src ?? markerShadow
})

function LocationMarker({ setLocation }: { setLocation: (loc: Location) => void }){
  useMapEvents({
    click(e: LeafletMouseEvent){
      setLocation({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      })
    }
  })

  return null
}

export default function MapPicker({ defaultLoc, onChange }:{ defaultLoc?: Location | null, onChange: (pos: Location | null)=>void }){
  const [location, setLocation] = useState<Location | null>(defaultLoc||null);

  useEffect(()=>{
    if(!location){
      navigator.geolocation.getCurrentPosition((loc) => setLocation({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      }));
    }
  },[])
  useEffect(()=>{
    onChange(location)
  }, [location])

  const center: [number, number] = location ? [location.lat, location.lng] : [13.7563, 100.5018];

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

      <LocationMarker setLocation={setLocation} />

      {location && <Marker position={[location.lat, location.lng]} />}
    </MapContainer>
  )
}