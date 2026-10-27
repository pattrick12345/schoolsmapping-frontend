import { API_URL } from "../config";

async function getJson(path) {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response.json();
}

// adds ?a=1&b=2 to a path, skipping empty values
function withQuery(path, params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  ).toString();
  return query ? `${path}?${query}` : path;
}

export function fetchSchool(id) {
  return getJson(`/schools/${id}`);
}

export function fetchSchoolLocation(id) {
  return getJson(`/schools/${id}/location`);
}

export function fetchProvinces() {
  return getJson("/provinces");
}

export function fetchDistricts(provinceId) {
  return getJson(withQuery("/districts", { province_id: provinceId }));
}

export function fetchSubdistricts(districtId) {
  return getJson(withQuery("/subdistricts", { district_id: districtId }));
}

export function fetchSchools(params) {
  return getJson(withQuery("/schools", params));
}
