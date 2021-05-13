<template>
  <i :class="'fa ' + iconClass" />
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'ChoicesFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          iconChoices: {
            true: 'fa-check text-primary',
            false: 'fa-times text-danger'
          },
          typeChange(val) {
            return !!val
          }
        }
      }
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    }
  },
  computed: {
    iconClass() {
      const key = this.formatterArgs.typeChange(this.cellValue)
      return this.formatterArgs.iconChoices[key]
    }
  }
}
</script>

<style scoped>

</style>
