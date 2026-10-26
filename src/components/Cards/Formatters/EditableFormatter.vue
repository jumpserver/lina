<template>
  <div class="editable-formatter">
    <template v-if="editing">
      <div
        ref="editorHost"
        class="editable-formatter-input jms-form-controls"
        @keydown.enter="onEnter"
        @keydown.esc="onEscape"
      >
        <component :is="inputComponent" ref="input" v-bind="controlProps" v-on="controlEvents" />
        <div v-if="error" class="editable-formatter-input-error" role="alert">{{ error }}</div>
      </div>
      <div class="editable-formatter-input-actions">
        <el-button :loading="saving" :disabled="!canEdit" type="primary" @click="submit">
          {{ $t('Save') }}
        </el-button>
        <el-button :disabled="saving" @click="cancel">{{ $t('Cancel') }}</el-button>
      </div>
    </template>
    <template v-else>
      <slot :value="displayValue" :item="item" :edit="startEditing">
        <component
          :is="displayComponent"
          v-if="displayComponent"
          v-bind="displayProps"
          :item="item"
          :value="displayValue"
        />
        <ItemValue v-else :item="item" :formatter="formatter" :value="displayValue" />
      </slot>
      <button
        v-if="canEdit"
        :aria-label="$t('Edit') + ' ' + accessibleLabel"
        :title="$t('Edit') + ' ' + accessibleLabel"
        class="editable-formatter-edit-button"
        type="button"
        @click="startEditing"
      >
        <el-icon><EditPen /></el-icon>
      </button>
    </template>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'
import { getErrorResponseMsg } from '@/utils/common'
import ItemValue from '../DetailCard/ItemValue.vue'

export default {
  name: 'EditableFormatter',
  components: { ItemValue },
  props: {
    value: { default: undefined },
    item: { type: Object, default: () => ({}) },
    field: { type: String, required: true },
    label: { type: String, default: '' },
    object: { type: Object, default: () => ({}) },
    url: { type: String, default: '' },
    formatter: { type: Function, default: null },
    displayComponent: { type: [String, Object, Function], default: null },
    displayProps: { type: Object, default: () => ({}) },
    inputComponent: { type: [String, Object, Function], default: 'el-input' },
    inputProps: { type: Object, default: () => ({}) },
    valueProp: { type: String, default: 'modelValue' },
    changeEvent: { type: String, default: 'update:modelValue' },
    disabled: { type: Boolean, default: false },
    permission: { type: String, default: '' },
    validate: { type: Function, default: null },
    save: { type: Function, default: null }
  },
  emits: ['updated'],
  data() {
    return {
      editing: false,
      saving: false,
      draft: null,
      savedValue: undefined,
      hasSavedValue: false,
      error: ''
    }
  },
  computed: {
    accessibleLabel() {
      return this.label || this.item.key || this.field
    },
    canEdit() {
      return !!(
        this.field &&
        !this.disabled &&
        (!this.permission || this.$hasPerm(this.permission)) &&
        (this.save || this.url)
      )
    },
    displayValue() {
      return this.hasSavedValue ? this.savedValue : this.value
    },
    sourceValue() {
      return Object.prototype.hasOwnProperty.call(this.object, this.field)
        ? this.object[this.field]
        : this.displayValue
    },
    controlProps() {
      return {
        ...this.inputProps,
        [this.valueProp]: this.draft,
        disabled: this.saving || !this.canEdit,
        'aria-label': this.accessibleLabel
      }
    },
    controlEvents() {
      return { [this.changeEvent]: this.updateDraft }
    }
  },
  watch: {
    value: {
      deep: true,
      handler() {
        this.hasSavedValue = false
      }
    }
  },
  methods: {
    startEditing() {
      if (!this.canEdit || this.saving) return
      this.draft = cloneDeep(this.sourceValue)
      this.error = ''
      this.editing = true
      this.$nextTick(() => {
        if (this.$refs.input?.focus) {
          this.$refs.input.focus()
        } else {
          this.$refs.editorHost?.querySelector('input:not([role="combobox"]), textarea')?.focus()
        }
      })
    },
    updateDraft(value) {
      if (this.saving) return
      this.draft = value
      this.error = ''
    },
    cancel() {
      if (this.saving) return
      this.editing = false
      this.draft = null
      this.error = ''
    },
    onEnter(event) {
      if (event.defaultPrevented || event.isComposing || event.target?.tagName !== 'INPUT') return
      event.preventDefault()
      if (event.target?.closest('.el-select, .el-cascader, .el-date-editor')) return
      this.submit()
    },
    onEscape(event) {
      if (event.defaultPrevented) return
      event.preventDefault()
      this.cancel()
    },
    async submit() {
      if (!this.editing || this.saving || !this.canEdit) return
      this.saving = true
      this.error = ''
      const value = cloneDeep(this.draft)
      const context = { field: this.field, item: this.item, object: this.object }
      try {
        if (this.validate) {
          const error = await this.validate(value, context)
          if (error) {
            this.error = error
            return
          }
        }
        if (!this.canEdit) return
        const response = this.save
          ? await this.save(value, context)
          : await this.$axios.patch(
              this.url,
              { [this.field]: value },
              { disableFlashErrorMsg: true }
            )
        const savedValue = Object.prototype.hasOwnProperty.call(response || {}, this.field)
          ? response[this.field]
          : value
        this.savedValue = cloneDeep(savedValue)
        this.hasSavedValue = true
        this.editing = false
        this.draft = null
        this.$emit('updated', { field: this.field, value: savedValue, response })
        this.$message.success(this.$t('UpdateSuccessMsg'))
      } catch (error) {
        this.error = getErrorResponseMsg(error) || this.$t('UpdateErrorMsg')
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.editable-formatter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.editable-formatter-edit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: var(--el-text-color-secondary);
  cursor: pointer;

  &:hover,
  &:focus-visible {
    color: var(--el-color-primary);
    background: var(--el-fill-color-light);
  }
}

.editable-formatter-input {
  flex: 1 1 180px;
  min-width: 0;
}

.editable-formatter-input-error {
  color: var(--el-color-danger);
  font-size: 12px;
  line-height: 18px;
  overflow-wrap: anywhere;
}

.editable-formatter-input-actions {
  display: flex;
  gap: 8px;

  .el-button + .el-button {
    margin-left: 0;
  }
}
</style>
