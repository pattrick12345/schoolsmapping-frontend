<script setup>
const props = defineProps({
 school: {
 type: Object,
 required: true
 }
});
const emit = defineEmits(["select"]);
function selectThisSchool() {
 emit("select", props.school.id);
}
</script>
<template>
  <article class="school-card">
    <h2>{{ school.name_th }}</h2>
    <p>Province: {{ school.province_name_th }}</p>
    <p>District: {{ school.district_name_th }}</p>
    <p v-if="school.subdistrict_name_th">
      Subdistrict: {{ school.subdistrict_name_th }}
    </p>
    <button @click="emit('select', school.id)">View details</button>
  </article>
</template>
