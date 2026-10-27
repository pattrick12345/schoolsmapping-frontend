<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
const mapElement = ref(null);
let map;
onMounted(() => {
 map = L.map(mapElement.value).setView([13.7563, 100.5018], 12);
 L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
 attribution: '&copy; OpenStreetMap contributors',
 maxZoom: 19
 }).addTo(map);
 L.circleMarker([13.7563, 100.5018], { radius: 8 })
 .addTo(map).bindPopup("Example location");
});
onBeforeUnmount(() => { if (map) map.remove(); });
</script>
<template><div ref="mapElement" class="map-demo"></div></template>
<style scoped>
.map-demo { 
    height: 300px; 
    width: 100%; 
}
</style>
