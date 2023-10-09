<template>
  <IBox>
    <GenericCreateUpdateForm
      v-if="!loading"
      :fields="fields"
      :fields-meta="fieldsMeta"
      :initial="object"
      :submit-method="submitMethod"
      :url="url"
      :clean-form-value="cleanFormValue"
      class="password-update"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'
import BoolTextReadonly from '@/components/Form/FormFields/BoolTextReadonly'

export default {
  name: 'AllPreferenceUpdate',
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
      default: 'luna'
    }
  },
  data() {
    return {
      fields: [],
      fieldsMeta: {},
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
      const fieldsMeta = {}
      for (const k in this.remoteMeta) {
        if (this.remoteMeta.hasOwnProperty(k)) {
          fields.push([this.remoteMeta[k].label, [k]])
          fieldsMeta[k] = { 'fields': Object.keys(this.remoteMeta[k].children).filter(
            // todo: remove this when we have a better solution
            (key) => key !== 'terminal_theme_name') }
        }
      }

      if (this.category === 'lina') {
        fieldsMeta.basic.fieldsMeta = {
          has_secret_key: {
            label: this.$t('users.SetStatus'),
            component: BoolTextReadonly,
            el: {
              trueText: this.$t('users.Set'),
              falseText: this.$t('users.NotSet')
            },
            disabled: true
          }
        }
      }
      this.fields = fields
      this.fieldsMeta = fieldsMeta
    },
    submitMethod() {
      return 'patch'
    },
    cleanFormValue(value) {
      if (this.category === 'koko') {
        // todo: remove this when we have a better solution
        delete value['basic']['terminal_theme_name']
      }
      return value
    }
  }
}
</script>

<style lang="scss" scoped>
.password-update > > > .el-input {
  width: 600px;
  max-width: 600px;
}
</style>
