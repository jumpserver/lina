<template>
  <i :class="'fa ' + iconClass" />
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'BooleanFormatter',
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
          showFalse: true,
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
      if (!key && !this.formatterArgs.showFalse) {
        return ''
      }
      return this.formatterArgs.iconChoices[key]
    }
  }
}
</script>

<style scoped>

</style>
