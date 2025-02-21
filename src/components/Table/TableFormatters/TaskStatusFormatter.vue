<template>
  <ChoicesFormatter :formatter-args-default="iFormatterArgsDefault" v-bind="$props" />
</template>

<script>
import ChoicesFormatter from './ChoicesFormatter.vue'

export default {
  name: 'TaskStatusFormatter',
  components: {
    ChoicesFormatter
  },
  extends: ChoicesFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          faChoices: {
            ready: 'fa-clock-o',
            pending: 'fa-clock-o',
            running: 'fa-spinner',
            success: 'fa-check-circle',
            failed: 'fa-times-circle',
            error: 'fa-exclamation-circle',
            canceled: 'fa-ban'
          },
          classChoices: {
            success: 'text-primary',
            failed: 'text-danger',
            error: 'text-danger'
          },
          textChoices: {
            ready: this.$t('Ready'),
            pending: this.$t('Pending'),
            running: this.$t('Running'),
            success: this.$t('Success'),
            failed: this.$t('Failed'),
            error: this.$t('Error'),
            canceled: this.$t('Canceled')
          }
        }
      }
    }
  },
  data() {
    return {
      iFormatterArgsDefault: Object.assign({}, ChoicesFormatter.formatterArgsDefault, this.formatterArgsDefault)
    }
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>
