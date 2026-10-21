<template>
  <div v-if="item.editor" class="detail-card-editable">
    <template v-if="editing">
      <div
        ref="editorHost"
        class="detail-card-editor jms-form-controls"
        @keydown.enter="onEnter"
        @keydown.esc="onEscape"
      >
        <component
          :is="editor.component || 'el-input'"
          ref="input"
          v-bind="inputProps"
          v-on="inputEvents"
        />
        <div v-if="error" class="detail-card-editor-error" role="alert">{{ error }}</div>
      </div>
      <div class="detail-card-editor-actions">
        <el-button :loading="saving" :disabled="!canEdit" type="primary" @click="save">
          {{ $t('Save') }}
        </el-button>
        <el-button :disabled="saving" @click="cancel">{{ $t('Cancel') }}</el-button>
      </div>
    </template>
    <template v-else>
      <slot :value="displayValue" />
      <button
        v-if="canEdit"
        :aria-label="$t('Edit') + ' ' + item.key"
        :title="$t('Edit') + ' ' + item.key"
        class="detail-card-edit-button"
        type="button"
        @click="startEditing"
      >
        <el-icon><EditPen /></el-icon>
      </button>
    </template>
  </div>
  <slot v-else :value="item.value" />
</template>

<script>
import { cloneDeep } from 'lodash'
import { getErrorResponseMsg } from '@/utils/common'

export default {
  name: 'EditableDetailItem',
  props: {
    item: { type: Object, required: true },
    object: { type: Object, default: () => ({}) },
    url: { type: String, default: '' }
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
    editor() {
      return this.item.editor === true ? {} : this.item.editor || {}
    },
    field() {
      return this.item.field
    },
    canEdit() {
      return !!(
        this.item.editor &&
        this.field &&
        !this.editor.disabled &&
        (!this.editor.permission || this.$hasPerm(this.editor.permission)) &&
        (this.editor.save || this.editor.url || this.url)
      )
    },
    displayValue() {
      return this.hasSavedValue ? this.savedValue : this.item.value
    },
    sourceValue() {
      return Object.prototype.hasOwnProperty.call(this.object, this.field)
        ? this.object[this.field]
        : this.displayValue
    },
    inputProps() {
      return {
        ...this.editor.props,
        [this.editor.valueProp || 'modelValue']: this.draft,
        disabled: this.saving || !this.canEdit,
        'aria-label': this.item.key
      }
    },
    inputEvents() {
      return { [this.editor.changeEvent || 'update:modelValue']: this.updateDraft }
    }
  },
  watch: {
    'item.value': {
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
      this.save()
    },
    onEscape(event) {
      if (event.defaultPrevented) return
      event.preventDefault()
      this.cancel()
    },
    async save() {
      if (!this.editing || this.saving || !this.canEdit) return
      this.saving = true
      this.error = ''
      const value = cloneDeep(this.draft)
      const context = { field: this.field, item: this.item, object: this.object }
      try {
        if (this.editor.validate) {
          const error = await this.editor.validate(value, context)
          if (error) {
            this.error = error
            return
          }
        }
        if (!this.canEdit) return
        const response = this.editor.save
          ? await this.editor.save(value, context)
          : await this.$axios.patch(
              this.editor.url || this.url,
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
.detail-card-editable {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.detail-card-edit-button {
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

.detail-card-editor {
  flex: 1 1 180px;
  min-width: 0;
}

.detail-card-editor-error {
  color: var(--el-color-danger);
  font-size: 12px;
  line-height: 18px;
  overflow-wrap: anywhere;
}

.detail-card-editor-actions {
  display: flex;
  gap: 8px;

  .el-button + .el-button {
    margin-left: 0;
  }
}
</style>
