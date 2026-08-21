<template>
  <Drawer
    v-bind="$attrs"
    v-if="visible"
    :visible="visible"
    :title="iTitle"
    class="bulk-update-drawer"
    @update:visible="$emit('update:visible', $event)"
  >
    <Page :title="null" class="drawer bulk-update-page">
      <el-alert v-if="tips" type="info">{{ tips }}</el-alert>
      <IBox class="bulk-update-card">
        <div v-if="hasTargetResourceSelector" class="bulk-update-target">
          <div class="bulk-update-target__label">
            <span>{{ targetResourceFieldLabel }}</span>
          </div>
          <ResourceSelect
            v-bind="targetResourceProps"
            v-model="targetResourceValue"
            class="bulk-update-target__control"
          />
        </div>
        <el-row v-if="hasTargetResourceSelector" class="el-row-divider">
          <el-divider />
        </el-row>
        <div class="select-prop">
          <div class="select-prop__label">
            <span>{{ selectPropertiesLabel }}</span>
          </div>
          <div class="select-prop__options">
            <el-checkbox
              :disabled="selectableFieldNames.length === 0"
              :indeterminate="isFieldsSelectionIndeterminate"
              :model-value="areAllFieldsSelected"
              @change="handleSelectAllFields"
            >
              {{ $tc('SelectAll') }}
            </el-checkbox>
            <el-checkbox-group
              v-model="checkedFields"
              class="select-prop__group"
              @change="handleCheckedFieldsChange"
            >
              <el-checkbox
                v-for="field in orderedFieldsMeta"
                :key="field.name"
                :disabled="field.meta.disabled"
                :value="field.name"
              >
                {{ field.meta.label || field.name }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <el-row>
          <el-col :span="24">
            <GenericCreateUpdateForm
              v-bind="iFormSetting"
              :can-submit="canSubmit"
              label-width="90px"
              @after-remote-meta="handleAfterRemoteMeta"
            />
          </el-col>
        </el-row>
      </IBox>
    </Page>
  </Drawer>
</template>

<script>
import Drawer from '@/components/Drawer'
import IBox from '@/components/Common/IBox'
import ResourceSelect from '@/components/Form/FormFields/ResourceSelect'
import { normalizeResourceValue } from '@/components/Form/FormFields/resourceSelectSummary'
import { GenericCreateUpdateForm } from '@/layout/components'
import Page from '@/layout/components/Page'

export default {
  name: 'GenericUpdateFormDialog',
  components: {
    Drawer,
    GenericCreateUpdateForm,
    IBox,
    Page,
    ResourceSelect
  },
  props: {
    selectedRows: {
      type: Array,
      default: () => []
    },
    formSetting: {
      type: Object,
      default: () => ({})
    },
    tips: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    targetResourceSetting: {
      type: Object,
      default: null
    }
  },
  emits: ['update:visible', 'update', 'submitError'],
  data: function () {
    return {
      selectPropertiesLabel: this.$t('SelectProperties'),
      checkedFields: [],
      iFormSetting: {},
      targetResourceValue: []
    }
  },
  computed: {
    iTitle() {
      return this.title || this.$tc('UpdateSelected')
    },
    hasCheckedFields() {
      return this.checkedFields.length > 0
    },
    hasTargetResourceSelector() {
      return !!this.targetResourceSetting?.url
    },
    targetResourceIds() {
      return normalizeResourceValue(this.targetResourceValue, this.targetResourceSetting?.valueKey)
    },
    targetResourceFieldLabel() {
      return this.targetResourceSetting?.label || this.targetResourceSetting?.resourceName || ''
    },
    targetResourceProps() {
      const props = { ...(this.targetResourceSetting || {}) }
      delete props.label
      return props
    },
    effectiveSelectedRows() {
      if (!this.hasTargetResourceSelector) {
        return this.selectedRows
      }
      return this.targetResourceIds.map((id) => ({ id }))
    },
    canSubmit() {
      return (
        this.hasCheckedFields &&
        (!this.hasTargetResourceSelector || this.targetResourceIds.length > 0)
      )
    },
    selectableFieldNames() {
      return this.orderedFieldsMeta
        .filter((field) => !field.meta.disabled)
        .map((field) => field.name)
    },
    areAllFieldsSelected() {
      return (
        this.selectableFieldNames.length > 0 &&
        this.selectableFieldNames.every((name) => this.checkedFields.includes(name))
      )
    },
    isFieldsSelectionIndeterminate() {
      const selectedCount = this.selectableFieldNames.filter((name) =>
        this.checkedFields.includes(name)
      ).length
      return selectedCount > 0 && selectedCount < this.selectableFieldNames.length
    },
    orderedFieldsMeta() {
      const fieldsMeta = this.iFormSetting.fieldsMeta || {}
      const orderedNames = []
      const addedNames = new Set()
      const appendField = (field) => {
        const name = typeof field === 'string' ? field : field?.prop || field?.id || field?.name
        if (!name || !fieldsMeta[name] || addedNames.has(name)) {
          return
        }
        orderedNames.push(name)
        addedNames.add(name)
      }
      const appendFields = (fields) => {
        if (!Array.isArray(fields)) {
          appendField(fields)
          return
        }
        fields.forEach((field) => {
          // 分组字段格式为 [分组标题, [字段列表]]，标题不参与字段排序。
          if (Array.isArray(field) && Array.isArray(field[1])) {
            appendFields(field[1])
          } else {
            appendField(field)
          }
        })
      }

      appendFields(this.iFormSetting.fields || [])
      Object.keys(fieldsMeta).forEach(appendField)

      return orderedNames.map((name) => ({ name, meta: fieldsMeta[name] }))
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(visible, oldVisible) {
        if (visible && !oldVisible) {
          this.initializeFormSetting()
        }
      }
    }
  },
  methods: {
    initializeFormSetting() {
      const defaultFormSetting = this.getDefaultFormSetting()
      const sourceFieldsMeta = this.formSetting.fieldsMeta || {}
      const fieldsMeta = {}
      this.targetResourceValue = this.hasTargetResourceSelector
        ? this.selectedRows.map((row) => ({ ...row }))
        : []
      this.checkedFields = Object.entries(sourceFieldsMeta)
        .filter(([, meta]) => !meta.disabled)
        .map(([name]) => name)

      for (const [name, meta] of Object.entries(sourceFieldsMeta)) {
        fieldsMeta[name] = {
          ...meta,
          hidden: this.getFieldHidden(name, meta.hidden)
        }
      }

      this.iFormSetting = {
        ...defaultFormSetting,
        ...this.formSetting,
        fieldsMeta
      }
    },
    handleAfterRemoteMeta(meta) {
      for (const [name, fieldMeta] of Object.entries(this.iFormSetting.fieldsMeta)) {
        const remoteLabel = meta?.[name]?.label
        if (remoteLabel) {
          fieldMeta.label = remoteLabel
        }
      }
    },
    handleCheckedFieldsChange(values) {
      if (values.length === 0) {
        this.$message.warning(this.$t('SelectAtLeastOneProperty'))
      }
    },
    handleSelectAllFields(checked) {
      const selectableNames = new Set(this.selectableFieldNames)
      const disabledCheckedFields = this.checkedFields.filter((name) => !selectableNames.has(name))
      this.checkedFields = checked
        ? [...disabledCheckedFields, ...this.selectableFieldNames]
        : disabledCheckedFields
      this.handleCheckedFieldsChange(this.checkedFields)
    },
    getFieldHidden(name, originalHidden) {
      return (...args) => {
        if (!this.checkedFields.includes(name)) {
          return true
        }
        return typeof originalHidden === 'function' ? originalHidden(...args) : !!originalHidden
      }
    },
    getDefaultFormSetting() {
      const vm = this
      return {
        needGetObjectDetail: false,
        submitMethod: () => 'patch',
        cleanOtherFormValue: (formValue) => formValue,
        cleanFormValue: (value) => {
          const filterValue = {}
          Object.keys(value)
            .filter((key) => vm.checkedFields?.includes(key))
            .forEach((key) => {
              filterValue[key] = value[key]
            })
          let formValue = []
          let object = {}
          for (const row of vm.effectiveSelectedRows) {
            object = Object.assign({}, filterValue, { id: row.id })
            formValue.push(object)
          }
          if (typeof this.iFormSetting.cleanOtherFormValue === 'function') {
            formValue = this.iFormSetting.cleanOtherFormValue(formValue)
          }
          return formValue
        },
        onSubmit: function (validValues) {
          if (vm.hasTargetResourceSelector && vm.targetResourceIds.length === 0) {
            vm.$message.warning(
              vm.$t('ResourceSelectEmpty', {
                resource: vm.targetResourceSetting?.resourceName || ''
              })
            )
            return
          }
          if (!vm.hasCheckedFields) {
            vm.$message.warning(vm.$t('SelectAtLeastOneProperty'))
            return
          }
          const url = this.url
          const msg = this.$t(this.updateSuccessMsg)
          this.$axios
            .patch(url, validValues)
            .then((res) => {
              vm.$emit('update')
              this.$message.success(msg)
              vm.$emit('update:visible', false)
            })
            .catch((error) => {
              vm.$emit('submitError', error)
              const response = error.response
              const data = response.data
              // 不要逐个设置字段的 attrs.error 或改动 fields 引用。
              // 这样会触发表单 content 重建，导致用户已输入的内容被覆盖/清空，
              // 且可能出现只能显示一个字段错误的现象。
              // 这里改为使用 AutoDataForm 暴露的 setErrors(errors) 覆盖式设置：
              // - 直接同步到 UI 的 el-form-item.validateMessage
              // - 支持同时显示多个字段错误
              // - 不修改 fields/attrs 引用，避免输入丢失
              if (response.status === 400 && data && typeof data === 'object') {
                this.$refs.form.setErrors(data)
              }
            })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// .el-row-divider {
// margin-bottom: 20px;
// }

.select-prop {
  display: flex;
  align-items: flex-start;
  gap: 18px;
}

.bulk-update-card {
  container-name: bulk-update-card;
  container-type: inline-size;
}

.bulk-update-target {
  display: flex;
  align-items: flex-start;
  gap: 18px;
}

.bulk-update-target__label,
.select-prop__label {
  box-sizing: border-box;
  display: inline-flex;
  flex: 0 0 90px;
  align-items: center;
  justify-content: flex-end;
  width: 90px;
  min-height: 30px;
  padding: 0;
  overflow: visible;
  color: var(--color-text-primary);
  font-size: 13px;
  line-height: 30px;

  span {
    display: inline-block;
    max-width: 100%;
    overflow-wrap: anywhere;
    line-height: 16px;
    white-space: normal;
  }
}

.bulk-update-target__control {
  flex: 1 1 auto;
  width: auto;
  min-width: 0;
}

.select-prop__options {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 4px 24px;
  min-width: 0;

  :deep(.el-checkbox) {
    height: 30px;
    margin: 0;
  }
}

.select-prop__group {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 24px;

  :deep(.el-checkbox) {
    height: 30px;
    margin: 0;
  }
}

@container bulk-update-card (max-width: 640px) {
  .bulk-update-target,
  .select-prop {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .bulk-update-target__label,
  .select-prop__label {
    flex: 0 0 auto;
    justify-content: flex-start;
    width: 100%;
    text-align: left;
  }

  .bulk-update-target__control {
    width: 100%;
  }
}
</style>
