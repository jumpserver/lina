<template>
  <IBox>
    <GenericCreateUpdateForm
      v-if="!loading"
      ref="form"
      :clean-form-value="cleanFormValue"
      :fields="fields"
      :fields-meta="iFieldsMeta"
      :has-buttons="!autoSave"
      :initial="object"
      :submit-method="submitMethod"
      :url="url"
      class="password-update"
      @get-object-done="handleGetObjectDone"
    />
  </IBox>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import set from 'lodash/set'
import { h } from 'vue'
import { ElLink } from 'element-plus'
import { getActionMeta } from '@/api/common'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'
import { encryptPassword } from '@/utils/session-encrypt'

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
    },
    autoSave: {
      type: Boolean,
      default: false
    },
    canRestoreDefault: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fields: [],
      iFieldsMeta: {},
      encryptedFields: ['secret_key', 'secret_key_again'],
      loading: true,
      url: `/api/v1/users/preference/?category=${this.category}`,
      savedPreferenceValues: {},
      autoSaveQueues: {},
      autoSaveVersions: {}
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
      this.remoteMeta = getActionMeta(data, 'PATCH')
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

      if (this.autoSave) {
        this.decorateAutoSaveFields(fieldsMeta)
      }

      this.fields = fields
      this.iFieldsMeta = fieldsMeta
    },
    decorateAutoSaveFields(fieldsMeta) {
      for (const [groupName, groupMeta] of Object.entries(fieldsMeta)) {
        groupMeta.fieldsMeta = groupMeta.fieldsMeta || {}
        for (const fieldName of groupMeta.fields) {
          const fieldMeta = groupMeta.fieldsMeta[fieldName] || {}
          const originalChange = fieldMeta.on?.change
          fieldMeta.on = {
            ...fieldMeta.on,
            change: (args, updateForm) => {
              this.queuePreferenceSave(groupName, fieldName, args[0], updateForm)
              if (originalChange) {
                originalChange(args, updateForm)
              }
            }
          }
          if (this.canRestoreDefault) {
            fieldMeta.helpTextFormatter = () =>
              h(
                ElLink,
                {
                  type: 'primary',
                  underline: 'hover',
                  onClick: (event) => {
                    event.preventDefault()
                    this.restoreGlobalDefault(groupName, fieldName)
                  }
                },
                () => this.$t('UseGlobalDefault')
              )
          }
          groupMeta.fieldsMeta[fieldName] = fieldMeta
        }
      }
    },
    handleGetObjectDone(values) {
      this.savedPreferenceValues = cloneDeep(values)
    },
    nextAutoSaveVersion(fieldKey) {
      const version = (this.autoSaveVersions[fieldKey] || 0) + 1
      this.autoSaveVersions[fieldKey] = version
      return version
    },
    enqueueAutoSave(fieldKey, task) {
      const previous = this.autoSaveQueues[fieldKey] || Promise.resolve()
      const current = previous.catch(() => {}).then(task)
      this.autoSaveQueues[fieldKey] = current
      current.finally(() => {
        if (this.autoSaveQueues[fieldKey] === current) {
          delete this.autoSaveQueues[fieldKey]
        }
      })
      return current
    },
    queuePreferenceSave(groupName, fieldName, value, updateForm) {
      const fieldKey = `${groupName}.${fieldName}`
      const fieldPath = [groupName, fieldName]
      const nextValue = cloneDeep(value)
      const version = this.nextAutoSaveVersion(fieldKey)

      return this.enqueueAutoSave(fieldKey, async () => {
        const previousValue = cloneDeep(get(this.savedPreferenceValues, fieldPath))
        if (isEqual(previousValue, nextValue)) {
          return
        }
        try {
          await this.$axios.patch(this.url, {
            [groupName]: {
              [fieldName]: nextValue
            }
          })
          set(this.savedPreferenceValues, fieldPath, cloneDeep(nextValue))
          if (this.autoSaveVersions[fieldKey] === version) {
            this.$message.success(this.$t('SaveSuccess'))
          }
        } catch (error) {
          if (this.autoSaveVersions[fieldKey] === version) {
            updateForm?.({ [fieldName]: previousValue })
          }
        }
      })
    },
    restoreGlobalDefault(groupName, fieldName) {
      const fieldKey = `${groupName}.${fieldName}`
      const version = this.nextAutoSaveVersion(fieldKey)

      return this.enqueueAutoSave(fieldKey, async () => {
        try {
          const values = await this.$axios.delete(this.url, {
            data: { names: [fieldName] }
          })
          const fieldPath = [groupName, fieldName]
          const restoredValue = cloneDeep(get(values, fieldPath))
          set(this.savedPreferenceValues, fieldPath, restoredValue)
          if (this.autoSaveVersions[fieldKey] === version) {
            const formRenderer = this.$refs.form?.$refs.form?.dataForm?.elForm
            const currentGroupValue = cloneDeep(
              get(formRenderer?.getFormValue?.(), [groupName], {})
            )
            set(currentGroupValue, [fieldName], restoredValue)
            formRenderer?.updateForm({
              [groupName]: currentGroupValue
            })
            this.$message.success(this.$t('SaveSuccess'))
          }
        } catch (error) {
          // Request errors are displayed by the shared request interceptor.
        }
      })
    },
    cleanFormValue(value) {
      this.fieldsExclude.forEach((name) => {
        const nameArray = name.split('.')
        if (nameArray.length === 2) {
          delete value[nameArray[0]][nameArray[1]]
        } else {
          delete value[nameArray[0]]
        }
      })

      if (value.file && typeof value.file === 'object') {
        this.encryptedFields.forEach((name) => {
          const fieldValue = value.file[name]
          if (fieldValue && typeof fieldValue === 'string') {
            value.file[name] = encryptPassword(fieldValue)
          }
        })
      }

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

<style lang="scss" scoped></style>
