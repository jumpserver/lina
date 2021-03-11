<template>
  <DataForm
    :fields="iFields"
    :form="value"
    style="margin-left: -26%;margin-right: -6%"
    v-bind="kwargs"
    v-on="$listeners"
  />
</template>

<script>
import { DataForm } from '@/components'

export default {
  name: 'NestedField',
  components: {
    DataForm
  },
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => ({})
    },
    errors: {
      type: [Object, String],
      default: ''
    }
  },
  data() {
    return {
      kwargs: {
        hasReset: false,
        hasSaveContinue: false,
        defaultButton: false
      }
    }
  },
  computed: {
    iFields() {
      const fields = this.fields
      if (this.errors && typeof this.errors === 'object') {
        for (const [name, error] of Object.entries(this.errors)) {
          const field = fields.find((v) => v.prop === name)
          if (!field) {
            continue
          }
          this.$log.debug(`${name}: ${error}`)
          field.attrs.error = error.toString()
        }
      }
      this.$log.debug('Fields change: ', fields, this.errors)
      return fields
    }
  },
  methods: {
    setFieldError(name, error) {
      const field = this.totalFields.find((v) => v.prop === name)
      if (!field) {
        return
      }
      if (field.attrs.error === error) {
        error += '.'
      }
      field.attrs.error = error
    }
  }
}
</script>

<style scoped>

</style>
