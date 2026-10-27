<template>
  <main class="page">
    <RouterLink to="/schools" class="back">Back to schools</RouterLink>

    <div v-if="loading" class="panel" aria-hidden="true">
      <span class="bar bar-title"></span>
      <span class="bar"></span>
      <span class="bar bar-short"></span>
    </div>

    <div v-else-if="errorMessage" class="notice" role="alert">
      <div>
        <p class="notice-title">Could not load this school</p>
        <p class="notice-detail">{{ errorMessage }}</p>
      </div>
      <button type="button" class="btn" @click="loadSchool">Try again</button>
    </div>

    <section v-else-if="school" class="school-detail">
      <header class="head">
        <h1>{{ school.name_th }}</h1>
        <p v-if="school.name_en" class="en">{{ school.name_en }}</p>
      </header>

      <dl class="panel facts">
        <div>
          <dt>Province</dt>
          <dd>{{ school.province_name_th }}</dd>
        </div>
        <div>
          <dt>District</dt>
          <dd>{{ school.district_name_th }}</dd>
        </div>
        <div>
          <dt>Subdistrict</dt>
          <dd>{{ school.subdistrict_name_th }}</dd>
        </div>
        <div>
          <dt>SMIS code</dt>
          <dd>{{ school.smis_code }}</dd>
        </div>
      </dl>

      <h2>Location</h2>
      <div v-if="location" class="map-wrap">
        <SchoolLocationMap
          :key="route.params.id"
          :latitude="location.latitude"
          :longitude="location.longitude"
        />
      </div>
      <p v-else-if="locationMessage" class="panel muted">{{ locationMessage }}</p>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { fetchSchool, fetchSchoolLocation } from "../services/schoolsApi";
import SchoolLocationMap from "../components/SchoolLocationMap.vue";

const route = useRoute();
const school = ref(null);
const location = ref(null);
const locationMessage = ref("");
const loading = ref(false);
const errorMessage = ref("");

async function loadSchool() {
  const id = route.params.id;
  loading.value = true;
  errorMessage.value = "";
  school.value = null;
  location.value = null;
  locationMessage.value = "";
  try {
    const data = await fetchSchool(id);
    if (id !== route.params.id) return;
    school.value = data;
  } catch (error) {
    if (id !== route.params.id) return;
    errorMessage.value = error.message;
    loading.value = false;
    return;
  }
  try {
    const data = await fetchSchoolLocation(id);
    if (id !== route.params.id) return;
    location.value = data;
  } catch (error) {
    if (id !== route.params.id) return;
    locationMessage.value = "Location not available for this school.";
  }
  loading.value = false;
}
onMounted(loadSchool);
watch(() => route.params.id, loadSchool);
</script>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 4rem;
}

.back {
  display: inline-block;
  padding: 0.25rem 0;
  color: var(--ink-soft);
  font-weight: 500;
  text-decoration: none;
}
.back:hover {
  color: var(--ink);
  text-decoration: underline;
}

.head {
  margin: 1rem 0 1.5rem;
}
.head h1 {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
}
.en {
  margin-top: 0.2rem;
  font-size: 1.05rem;
  color: var(--ink-soft);
}

h2 {
  margin: 2rem 0 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.panel {
  padding: 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
}

/* details list */
.facts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem 2rem;
  margin: 0;
}
.facts dt {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink-soft);
}
.facts dd {
  margin: 0.1rem 0 0;
  font-size: 1.05rem;
  font-weight: 500;
}

/* map: wrapper only, so the map component keeps control of its own size */
.map-wrap {
  overflow: hidden;
  isolation: isolate;
  border: 1px solid var(--line);
  border-radius: 14px;
}

.muted {
  color: var(--ink-soft);
}

/* loading placeholder (static) */
.bar {
  display: block;
  height: 0.9rem;
  margin: 0.6rem 0;
  background: #e9ecf1;
  border-radius: 4px;
}
.bar-title { height: 1.8rem; width: 60%; margin-top: 0; }
.bar-short { width: 35%; }

/* error */
.notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1.25rem;
  background: #fdf5f4;
  border: 1px solid #e3b5b1;
  border-radius: 14px;
  color: var(--danger);
}
.notice-title {
  font-weight: 600;
}
.notice-detail {
  font-size: 0.9rem;
}

.btn {
  height: 40px;
  padding: 0 1rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.btn:hover {
  border-color: var(--navy);
}

@media (max-width: 640px) {
  .head h1 { font-size: 1.6rem; }
  .facts { grid-template-columns: 1fr; }
  .notice { flex-direction: column; align-items: flex-start; }
}
</style>
