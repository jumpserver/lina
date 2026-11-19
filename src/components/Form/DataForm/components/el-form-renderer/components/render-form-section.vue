<template>
  <section
    v-if="group"
    v-show="!group.hidden"
    class="form-section-card"
    :class="{ 'form-section-card--collapsed': group.collapsed }"
  >
    <div class="form-section-card__header">
      <slot name="header" />
    </div>
    <div v-show="!group.collapsed" class="form-section-card__body">
      <slot />
    </div>
  </section>
  <slot v-else />
</template>

<script>
export default {
  props: {
    group: {
      type: Object,
      default: null
    }
  }
}
</script>
