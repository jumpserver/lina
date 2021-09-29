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
import DataForm from '@/components/DataForm'

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
        hasButtons: false
      }
    }
  },
  computed: {
    iFields() {
      const fields = this.fields
      if (this.errors && typeof this.errors === 'object') {
        // eslint-disable-next-line prefer-const
        for (let [name, error] of Object.entries(this.errors)) {
          const field = fields.find((v) => v.prop === name)
          if (!field) {
            continue
          }
          this.$log.debug(`${name}: ${error}`)
          if (typeof error === 'object' && !Array.isArray(error)) {
            error = this.objectToString(error)
          }
          field.attrs.error = error.toString()
        }
      }
      this.$log.debug('Fields change: ', fields, this.errors)
      return fields
    }
  },
  methods: {
    objectToString(obj) {
      let data = ''
      // eslint-disable-next-line prefer-const
      for (let [key, value] of Object.entries(obj)) {
        if (typeof value === 'object') {
          value = this.objectToString(value)
        }
        data += ` ${key}: ${value} `
      }
      return data
    }
  }
}
</script>

<style scoped>

</style>
