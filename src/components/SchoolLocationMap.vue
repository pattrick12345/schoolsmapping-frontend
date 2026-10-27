<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
const props = defineProps({
  latitude: Number,
  longitude: Number,
});
const mapElement = ref(null);
let map;

onMounted(() => {
  const position = [props.latitude, props.longitude];
  map = L.map(mapElement.value).setView(position, 15);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(map);
  L.circleMarker(position, { radius: 8 }).addTo(map);
});
onBeforeUnmount(() => {
  if (map) map.remove();
});
</script>
<template>
    <div ref="mapElement" class="school-map"></div>
</template>
<style scoped>
    .school-map {
    height: 300px;
    width: 100%;
    }
</style>