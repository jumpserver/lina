<template>
  <DataForm
    v-if="!loading"
    :disabled="disabled"
    :fields="iFields"
    :form="form"
    style="margin-left: -26%;margin-right: -6%"
    v-bind="kwargs"
    @change="form = $event"
    @input="form = $event"
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
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      iForm: Object.assign({}, this.value),
      formJson: JSON.stringify(this.value),
      kwargs: {
        hasReset: false,
        hasSaveContinue: false,
        hasButtons: false
      }
    }
  },
  computed: {
    form: {
      get() {
        return this.iForm
      },
      set(val) {
        this.iForm = Object.assign(this.iForm, val)
        this.formJson = JSON.stringify(this.iForm)
        this.$emit('input', this.iForm)
      }
    },
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
  watch: {
    value: {
      handler(val) {
        const valJson = JSON.stringify(val)
        if (valJson !== this.formJson) {
          this.loading = true
          this.form = val
          setTimeout(() => {
            this.loading = false
          })
        }
      },
      deep: true
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
