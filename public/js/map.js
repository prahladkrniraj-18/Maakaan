if (typeof mapToken === "undefined" || !mapToken) {
  throw new Error(
    "Map token is missing. Pass MAP_TOKEN from EJS before loading map.js",
  );
}

mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: [corrdinates[0], corrdinates[1]],
  zoom: 10,
});

const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat([corrdinates[0], corrdinates[1]])
  .setPopup(new mapboxgl.Popup().setHTML("<p>Exact location after booking</p>"))
  .addTo(map);
