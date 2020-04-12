<template>
  <div>
    <i :class="'fa ' + iconClass" />
  </div>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'ChoicesFormatter',
  extends: BaseFormatter,
  data() {
    return {
      defaultIconChoices: {
        true: 'fa-check text-primary',
        false: 'fa-times text-danger'
      }
    }
  },
  computed: {
    iconClass() {
      const key = !!this.cellValue
      return this.defaultIconChoices[key]
    }
  }
}
</script>

<style scoped>

</style>
