<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import * as api from '../services/schoolsApi'

const PAGE_SIZE = 20

const provinces = ref([])
const districts = ref([])
const subdistricts = ref([])

const keyword = ref('')
const appliedKeyword = ref('')
const provinceId = ref('')
const districtId = ref('')
const subdistrictId = ref('')

const items = ref([])
const total = ref(0)
const offset = ref(0)
const loading = ref(true)
const error = ref('')

let requestId = 0

const hasFilters = computed(
  () => !!(appliedKeyword.value || provinceId.value || districtId.value || subdistrictId.value)
)
const page = computed(() => Math.floor(offset.value / PAGE_SIZE) + 1)
const pages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const from = computed(() => (total.value ? offset.value + 1 : 0))
const to = computed(() => Math.min(offset.value + PAGE_SIZE, total.value))

const fmt = (n) => n.toLocaleString('en-US')
const whereText = (s) =>
  [s.subdistrict_name_th, s.district_name_th, s.province_name_th].filter(Boolean).join(', ')

async function load() {
  const id = ++requestId
  loading.value = true
  error.value = ''
  try {
    const data = await api.fetchSchools({
      keyword: appliedKeyword.value,
      province_id: provinceId.value,
      district_id: districtId.value,
      subdistrict_id: subdistrictId.value,
      limit: PAGE_SIZE,
      offset: offset.value,
    })
    if (id !== requestId) return
    items.value = data.items
    total.value = data.total
  } catch {
    if (id !== requestId) return
    error.value = 'Could not reach the schools server. Check that the backend is running, then try again.'
  } finally {
    if (id === requestId) loading.value = false
  }
}

function search() {
  appliedKeyword.value = keyword.value.trim()
  offset.value = 0
  load()
}

function clearAll() {
  keyword.value = ''
  appliedKeyword.value = ''
  provinceId.value = ''
  districtId.value = ''
  subdistrictId.value = ''
  offset.value = 0
  load()
}

function goTo(delta) {
  offset.value = Math.max(0, offset.value + delta * PAGE_SIZE)
  load()
  window.scrollTo({ top: 0 })
}

onMounted(async () => {
  load()
  try {
    provinces.value = await api.fetchProvinces()
  } catch {
    /* the error banner from load() covers this */
  }
})

watch(provinceId, async (id) => {
  districtId.value = ''
  subdistrictId.value = ''
  districts.value = []
  subdistricts.value = []
  if (id) districts.value = await api.fetchDistricts(id)
})

watch(districtId, async (id) => {
  subdistrictId.value = ''
  subdistricts.value = []
  if (id) subdistricts.value = await api.fetchSubdistricts(id)
})

// dropdown filters apply immediately; the keyword applies on Search / Enter
watch([provinceId, districtId, subdistrictId], () => {
  offset.value = 0
  load()
})
</script>

<template>
  <main class="page">
    <header class="head">
      <h1>Find a school</h1>
      <p class="lead">Search {{ fmt(total || 28840) }} schools across Thailand by name or location.</p>
    </header>

    <form class="filters" role="search" @submit.prevent="search">
      <div class="search-row">
        <input
          v-model="keyword"
          type="search"
          placeholder="School name in Thai or English"
          aria-label="School name"
        />
        <button type="submit" class="btn btn-primary">Search</button>
        <button type="button" class="btn btn-quiet" :disabled="!hasFilters && !keyword" @click="clearAll">
          Clear
        </button>
      </div>

      <div class="select-row">
        <label>
          <span>Province</span>
          <select v-model="provinceId">
            <option value="">All provinces</option>
            <option v-for="p in provinces" :key="p.id" :value="p.id">{{ p.name_th }}</option>
          </select>
        </label>
        <label>
          <span>District</span>
          <select v-model="districtId" :disabled="!districts.length">
            <option value="">All districts</option>
            <option v-for="d in districts" :key="d.id" :value="d.id">{{ d.name_th }}</option>
          </select>
        </label>
        <label>
          <span>Subdistrict</span>
          <select v-model="subdistrictId" :disabled="!subdistricts.length">
            <option value="">All subdistricts</option>
            <option v-for="s in subdistricts" :key="s.id" :value="s.id">{{ s.name_th }}</option>
          </select>
        </label>
      </div>
    </form>

    <p class="status" aria-live="polite">
      <template v-if="error" />
      <template v-else-if="loading && !items.length">Loading schools…</template>
      <template v-else-if="total">
        Showing {{ fmt(from) }}–{{ fmt(to) }} of {{ fmt(total) }} schools
      </template>
      <template v-else>No results</template>
    </p>

    <div v-if="error" class="notice notice-error" role="alert">
      <p>{{ error }}</p>
      <button type="button" class="btn btn-quiet" @click="load">Try again</button>
    </div>

    <ul v-else-if="loading && !items.length" class="results" aria-hidden="true">
      <li v-for="n in 6" :key="n" class="row">
        <div class="info">
          <span class="bar bar-lg"></span>
          <span class="bar bar-sm"></span>
        </div>
      </li>
    </ul>

    <div v-else-if="!items.length" class="notice">
      <p>No schools match your search. Try a shorter name, or clear the filters.</p>
      <button type="button" class="btn btn-quiet" @click="clearAll">Clear filters</button>
    </div>

    <ul v-else class="results" :class="{ dim: loading }" :aria-busy="loading">
      <li v-for="s in items" :key="s.id" class="row">
        <div class="info">
          <h2>{{ s.name_th }}</h2>
          <p v-if="s.name_en" class="en">{{ s.name_en }}</p>
          <p class="where">{{ whereText(s) }}</p>
        </div>
        <RouterLink :to="{ name: 'school-detail', params: { id: s.id } }" class="btn btn-outline">View details</RouterLink>
      </li>
    </ul>

    <nav v-if="total > PAGE_SIZE && !error" class="pager" aria-label="Pagination">
      <button class="btn btn-outline" :disabled="page <= 1 || loading" @click="goTo(-1)">Previous</button>
      <span>Page {{ fmt(page) }} of {{ fmt(pages) }}</span>
      <button class="btn btn-outline" :disabled="page >= pages || loading" @click="goTo(1)">Next</button>
    </nav>
  </main>
</template>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
}

.head h1 {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.lead {
  margin-top: 0.4rem;
  color: var(--ink-soft);
}

/* filters */
.filters {
  margin-top: 1.75rem;
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
}

.search-row {
  display: flex;
  gap: 0.5rem;
}

.search-row input {
  flex: 1;
  min-width: 0;
}

input,
select {
  height: 44px;
  padding: 0 0.85rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
}

input::placeholder {
  color: #8993a8;
}

input:hover,
select:hover:not(:disabled) {
  border-color: #b9c0cd;
}

select:disabled {
  background: #f0f2f5;
  color: #8993a8;
}

.select-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 0.85rem;
}

.select-row label {
  display: grid;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink-soft);
}

.select-row select {
  width: 100%;
  font-size: 1rem;
  color: var(--ink);
}

/* buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 1.1rem;
  border: 1px solid transparent;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--navy);
  color: #fff;
}
.btn-primary:hover {
  background: var(--navy-hover);
}

.btn-outline {
  background: var(--surface);
  border-color: var(--line);
  color: var(--ink);
  height: 38px;
  padding: 0 0.9rem;
}
.btn-outline:hover:not(:disabled) {
  border-color: var(--navy);
}

.btn-quiet {
  background: transparent;
  color: var(--ink-soft);
}
.btn-quiet:hover:not(:disabled) {
  background: #e7eaf0;
  color: var(--ink);
}

/* status line */
.status {
  margin: 1.5rem 0 0.6rem;
  font-size: 0.9rem;
  color: var(--ink-soft);
  min-height: 1.5em;
}

/* results */
.results {
  list-style: none;
  margin: 0;
  padding: 0;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
  transition: opacity 0.15s;
}

.results.dim {
  opacity: 0.55;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
}

.row + .row {
  border-top: 1px solid var(--line);
}

.row:hover {
  background: #fafbfc;
}

.info h2 {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
}

.en {
  font-size: 0.9rem;
  color: var(--ink-soft);
}

.where {
  margin-top: 0.15rem;
  font-size: 0.9rem;
  color: var(--ink-soft);
}

/* loading skeleton (static, no animation) */
.bar {
  display: block;
  height: 0.9rem;
  margin: 0.45rem 0;
  background: #e9ecf1;
  border-radius: 4px;
}
.bar-lg { width: 16rem; max-width: 100%; }
.bar-sm { width: 10rem; max-width: 70%; }

/* empty + error */
.notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
}

.notice-error {
  border-color: #e3b5b1;
  background: #fdf5f4;
  color: var(--danger);
}

/* pagination */
.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: none;
  margin-top: 1.25rem;
  padding: 0;
  color: var(--ink-soft);
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .head h1 { font-size: 1.6rem; }
  .search-row { flex-wrap: wrap; }
  .search-row input { flex-basis: 100%; }
  .search-row .btn-primary { flex: 1; }
  .select-row { grid-template-columns: 1fr; }
  .row { flex-direction: column; align-items: flex-start; }
  .notice { flex-direction: column; align-items: flex-start; }
}
</style>
