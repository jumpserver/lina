<template>
  <div v-loading="loading || saving" class="preference-form">
    <AutoDataForm
      v-if="remoteFieldsMeta"
      ref="form"
      :can-submit="fields.length > 0 && !saving && !restoring"
      :disabled="saving || restoring"
      :fields="fields"
      :fields-meta="iFieldsMeta"
      :form="initialValues"
      :has-reset="false"
      :has-save-continue="false"
      :more-buttons="resetButtons"
      :remote-fields-meta="remoteFieldsMeta"
      :url="preferenceUrl(categories[0])"
      method="patch"
      @submit="submitPreferences"
    />
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import set from 'lodash/set'
import { getActionMeta } from '@/api/common'
import AutoDataForm from '@/components/Form/AutoDataForm'
import { getLangCode } from '@/i18n/utils'
import { vueCookie } from '@/utils/storage'

function pickFields(values = {}, names) {
  return Object.fromEntries(
    names.filter((name) => Object.hasOwn(values, name)).map((name) => [name, values[name]])
  )
}

export default {
  name: 'Base',
  components: {
    AutoDataForm
  },
  props: {
    categories: {
      type: Array,
      required: true
    },
    fieldsInclude: {
      type: Array,
      required: true
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
      remoteFieldsMeta: null,
      fieldCategories: {},
      initialValues: {},
      savedPreferenceValues: {},
      loading: true,
      saving: false,
      restoring: false
    }
  },
  computed: {
    resetButtons() {
      return [
        {
          title: this.$t('RestoreDefault'),
          loading: this.restoring,
          disabled: !this.fields.length || this.saving || this.restoring,
          callback: this.restoreSectionDefaults
        }
      ]
    }
  },
  async mounted() {
    try {
      const categories = await Promise.all(
        this.categories.map(async (category) => {
          const url = this.preferenceUrl(category)
          const [metadata, values] = await Promise.all([
            this.$store.dispatch('common/getUrlMeta', { url }),
            this.$axios.get(url)
          ])
          return { category, metadata: getActionMeta(metadata, 'PATCH'), values }
        })
      )
      this.setFormConfig(categories)
    } catch {
      // The shared request interceptor displays loading errors.
    } finally {
      this.loading = false
    }
  },
  methods: {
    preferenceUrl(category) {
      return `/api/v1/users/preference/?category=${category}`
    },
    setFormConfig(categories) {
      const remoteFieldsMeta = {}
      const fieldsMeta = {}
      const values = {}
      const fieldCategories = {}

      for (const { category, metadata, values: categoryValues } of categories) {
        for (const [group, groupMeta] of Object.entries(metadata)) {
          const children = Object.entries(groupMeta.children || {}).filter(([name]) => {
            const path = `${group}.${name}`
            return (
              (this.fieldsInclude.includes(group) || this.fieldsInclude.includes(path)) &&
              !this.fieldsExclude.includes(path)
            )
          })
          if (!children.length) continue

          const names = children.map(([name]) => name)
          const overrides = this.fieldsMeta[group]
          remoteFieldsMeta[group] = { ...groupMeta, children: Object.fromEntries(children) }
          fieldsMeta[group] = { ...overrides, fields: names }
          values[group] = pickFields(categoryValues[group], names)
          fieldCategories[group] = category
        }
      }

      this.fields = Object.keys(fieldsMeta)
      this.iFieldsMeta = fieldsMeta
      this.fieldCategories = fieldCategories
      this.savedPreferenceValues = cloneDeep(values)
      this.initialValues = values
      this.remoteFieldsMeta = remoteFieldsMeta
    },
    getChanges(values) {
      const changes = {}
      for (const group of this.fields) {
        for (const name of this.iFieldsMeta[group].fields) {
          const value = values[group]?.[name]
          if (value !== undefined && !isEqual(value, this.savedPreferenceValues[group]?.[name])) {
            set(changes, [this.fieldCategories[group], group, name], value)
          }
        }
      }
      return changes
    },
    async submitPreferences(values) {
      if (this.saving || this.restoring) return
      const changes = this.getChanges(values)
      if (!Object.keys(changes).length) return

      this.saving = true
      const errors = {}
      let failed = false
      try {
        // Save the language last so an error in another category cannot trigger a reload.
        for (const [category, payload] of Object.entries(changes).reverse()) {
          try {
            await this.$axios.patch(this.preferenceUrl(category), payload)
            for (const [group, fields] of Object.entries(payload)) {
              Object.assign(this.savedPreferenceValues[group], cloneDeep(fields))
            }
          } catch (error) {
            failed = true
            if (error.response?.status === 400) {
              Object.assign(errors, error.response.data)
            }
            break
          }
        }
        this.$refs.form?.setErrors(errors)
        if (!failed) {
          this.$message.success(this.$t('SaveSuccess'))
          this.applyLanguage(changes.lina?.basic?.lang)
        }
      } finally {
        this.saving = false
      }
    },
    async restoreSectionDefaults(_values, form) {
      if (this.saving || this.restoring || !this.fields.length) return

      this.restoring = true
      const defaults = {}
      let failed = false
      try {
        for (const category of [...this.categories].reverse()) {
          const groups = this.fields.filter((group) => this.fieldCategories[group] === category)
          const names = groups.flatMap((group) => this.iFieldsMeta[group].fields)
          if (!names.length) continue

          try {
            const values = await this.$axios.delete(this.preferenceUrl(category), {
              data: { names }
            })
            for (const group of groups) {
              defaults[group] = pickFields(values[group], this.iFieldsMeta[group].fields)
            }
          } catch {
            failed = true
            break
          }
        }

        form.updateForm(defaults)
        Object.assign(this.savedPreferenceValues, cloneDeep(defaults))
        if (!failed) {
          this.$refs.form?.setErrors({})
          this.$message.success(this.$t('ResetSuccessfully'))
          this.applyLanguage(defaults.basic?.lang)
        }
      } finally {
        this.restoring = false
      }
    },
    applyLanguage(language) {
      if (language && language !== getLangCode(true)) {
        vueCookie.setCookie('django_language', language, { expires: 365, path: '/' })
        window.location.reload()
      }
    }
  }
}
</script>
