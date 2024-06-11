<template>
  <IBox>
    <GenericCreateUpdateForm
      v-if="!loading"
      :clean-form-value="cleanFormValue"
      :fields="fields"
      :fields-meta="iFieldsMeta"
      :initial="object"
      :submit-method="submitMethod"
      :url="url"
      class="password-update"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'

export default {
  name: 'Base',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  props: {
    object: {
      type: Object,
      default: null
    },
    category: {
      type: String,
      default: 'lina'
    },
    fieldsExclude: {
      type: Array,
      default: () => []
    },
    fieldsMeta: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      fields: [],
      iFieldsMeta: {},
      loading: true,
      url: `/api/v1/users/preference/?category=${this.category}`
    }
  },
  async mounted() {
    try {
      this.loading = true
      await this.getUrlMeta()
      await this.setFormConfig()
    } finally {
      this.loading = false
    }
  },
  methods: {
    async getUrlMeta() {
      const data = await this.$store.dispatch('common/getUrlMeta', { url: this.url })
      this.remoteMeta = data.actions['PATCH'] || {}
    },
    async setFormConfig() {
      const fields = []
      let fieldsMeta = {}
      for (const k in this.remoteMeta) {
        const groupMeta = this.remoteMeta[k]
        const groupLabel = groupMeta.label
        const groupFields = Object.keys(groupMeta.children).filter(
          (name) => this.fieldsExclude.indexOf(`${k}.${name}`) === -1
        )
        fields.push([groupLabel, [k]])
        fieldsMeta[k] = {
          fields: groupFields
        }
      }

      fieldsMeta = this.mergeObjects({}, fieldsMeta, this.fieldsMeta)

      this.fields = fields
      this.iFieldsMeta = fieldsMeta
    },
    cleanFormValue(value) {
      this.fieldsExclude.forEach(name => {
        const nameArray = name.split('.')
        if (nameArray.length === 2) {
          delete value[nameArray[0]][nameArray[1]]
        } else {
          delete value[nameArray[0]]
        }
      })
      return value
    },
    submitMethod() {
      return 'patch'
    },
    mergeObjects(target, ...sources) {
      for (const source of sources) {
        for (const key in source) {
          if (typeof source[key] === 'object' && typeof target[key] === 'object') {
            this.mergeObjects(target[key], source[key])
          } else {
            target[key] = source[key]
          }
        }
      }
      return target
    }
  }
}
</script>

<style lang="scss" scoped>
.password-update ::v-deep .el-input {
  width: 600px;
  max-width: 600px;
}
</style>
