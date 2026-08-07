<template>
  <div
    :class="{ 'is-editable': canEdit }"
    :role="canEdit ? 'button' : undefined"
    :tabindex="canEdit ? 0 : undefined"
    class="label-container"
    @click.stop="openEditDialog"
    @keydown.enter.prevent="openEditDialog"
    @keydown.space.prevent="openEditDialog"
  >
    <div class="label-formatter-col">
      <span v-if="!iLabels.length" class="label-empty">-</span>
      <div v-else class="label-wrapper">
        <ILabel
          v-for="label of iLabels"
          :key="getLabelIdentity(label)"
          :el="formatterArgs.config"
          :label="label"
          class="tag-formatter"
        />
      </div>
    </div>

    <Dialog
      v-if="showDialog"
      v-model:visible="showDialog"
      :title="$tc('BindLabel')"
      class="label-bind-dialog"
      width="860px"
      @cancel="handleCancel"
      @closed="handleCancel"
      @confirm="handleConfirm"
    >
      <div class="label-bind-toolbar">
        <template v-if="!quickCreateVisible">
          <DataActions
            v-if="canCreateLabel"
            :actions="quickCreateActions"
            class="label-bind-toolbar__quick-create"
            size="small"
          />

          <el-link class="label-bind-toolbar__list-link" underline="never" @click="goToLabelList">
            {{ $t('TagList') }} <i class="fa fa-external-link" />
          </el-link>
        </template>

        <div v-else class="quick-label-create-inline">
          <GenericCreateUpdateForm
            v-bind="quickLabelFormConfig"
            :key="quickLabelFormKey"
            :can-submit="quickLabelCanSubmit"
            @submit-success="handleQuickLabelCreated"
            @update:form="handleQuickLabelFormChange"
          />
        </div>
      </div>
      <div class="label-bind-layout">
        <section class="label-panel label-key-panel">
          <div class="label-panel__search">
            <el-input
              ref="keySearchInput"
              v-model="keyQuery"
              :placeholder="$t('LabelFilterSearchKey')"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div v-loading="keyLoading" class="label-panel__list">
            <button
              v-for="option in filteredKeyOptions"
              :key="option.value"
              :class="{ 'is-active': option.value === activeKey }"
              class="label-panel__option label-panel__key"
              type="button"
              @click="selectKey(option.value)"
            >
              <span :title="option.label" class="label-panel__option-text">
                {{ option.label }}
              </span>
              <el-icon><ArrowRight /></el-icon>
            </button>
            <div v-if="!keyLoading && !filteredKeyOptions.length" class="label-panel__empty">
              {{ $t('NoData') }}
            </div>
          </div>
        </section>

        <section class="label-panel label-value-panel">
          <div class="label-panel__search">
            <el-input
              v-model="valueQuery"
              :disabled="!activeKey"
              :placeholder="$t('LabelFilterSearchValue')"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div v-if="activeKey" v-loading="valueLoading" class="label-panel__list">
            <div
              v-for="option in filteredValueOptions"
              :key="option.value"
              :aria-checked="isLabelSelected(activeKey, option.value)"
              :class="{ 'is-selected': isLabelSelected(activeKey, option.value) }"
              class="label-panel__option label-panel__value"
              role="checkbox"
              tabindex="0"
              @click="toggleLabel(option.labelData)"
              @keydown.enter.prevent="toggleLabel(option.labelData)"
              @keydown.space.prevent="toggleLabel(option.labelData)"
            >
              <el-checkbox :model-value="isLabelSelected(activeKey, option.value)" tabindex="-1" />
              <span
                :style="{ backgroundColor: option.labelData?.color || 'transparent' }"
                aria-hidden="true"
                class="label-value-color"
              />
              <span :title="option.label" class="label-panel__option-text">
                {{ option.label }}
              </span>
            </div>
            <div v-if="!valueLoading && !filteredValueOptions.length" class="label-panel__empty">
              {{ $t('NoData') }}
            </div>
          </div>
          <div v-else class="label-panel__empty label-panel__empty--center">
            {{ $t('LabelFilterSelectKey') }}
          </div>
        </section>

        <section class="label-panel selected-labels">
          <div class="label-panel__search">
            <el-input
              v-model="selectedQuery"
              :placeholder="$t('LabelFilterSearchSelected')"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="selected-labels__body">
            <div v-if="!filteredDraftLabels.length" class="selected-labels__empty">
              {{ draftLabels.length ? $t('NoData') : $t('NoSelectedLabels') }}
            </div>
            <template v-else>
              <button
                v-for="label of filteredDraftLabels"
                :key="getLabelIdentity(label)"
                :title="$t('Remove')"
                class="selected-labels__row"
                type="button"
                @click="handleCloseTag(label)"
              >
                <ILabel :el="formatterArgs.config" :label="label" class="selected-labels__tag" />
              </button>
            </template>
          </div>
        </section>
      </div>
    </Dialog>
  </div>
</template>

<script>
import _ from 'lodash'
import DataActions from '@/components/Common/DataActions/index.vue'
import Dialog from '@/components/Dialog'
import ILabel from '@/components/Widgets/ILabel'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { getLabelCreateFormConfig } from '@/views/labels/formConfig'
import LabelSelector from '../labelSelector'
import BaseFormatter from './base.vue'

export default {
  name: 'LabelsFormatter',
  components: { DataActions, Dialog, GenericCreateUpdateForm, ILabel },
  extends: BaseFormatter,
  mixins: [LabelSelector],
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          getLabelType() {
            return 'primary'
          },
          getLabels(cellValue) {
            return cellValue
          },
          config: {},
          showEditBtn: true,
          searchOnClick: false
        }
      }
    }
  },
  data() {
    return {
      formatterArgs: Object.assign({}, this.formatterArgsDefault, this.col.formatterArgs),
      initial: [],
      iLabels: [],
      draftLabels: [],
      showDialog: false,
      selectedQuery: '',
      quickCreateVisible: false,
      quickLabelFormKey: 0,
      quickLabelFormConfig: {},
      quickLabelCanSubmit: false
    }
  },
  computed: {
    labelSelectorVisible() {
      return this.showDialog
    },
    canEdit() {
      return this.formatterArgs.showEditBtn && !this.$store.getters.currentOrgIsRoot
    },
    canCreateLabel() {
      return this.canEdit && this.$hasPerm('labels.add_label')
    },
    quickCreateActions() {
      return [
        {
          name: 'actionQuickCreate',
          title: this.$t('QuickCreate'),
          type: 'primary',
          icon: 'plus',
          callback: this.openQuickCreate
        }
      ]
    },
    filteredDraftLabels() {
      const query = this.selectedQuery.trim().toLocaleLowerCase()
      if (!query) {
        return this.draftLabels
      }
      return this.draftLabels.filter((label) => {
        const name = String(label.name ?? '').toLocaleLowerCase()
        const value = String(label.value ?? '').toLocaleLowerCase()
        return name.includes(query) || value.includes(query)
      })
    }
  },
  watch: {
    cellValue: {
      handler(newValue) {
        this.setLabels(this.formatterArgs.getLabels(newValue) || [])
      },
      deep: true
    }
  },
  mounted() {
    this.setLabels(this.formatterArgs.getLabels(this.cellValue) || [])
  },
  methods: {
    openQuickCreate() {
      const config = getLabelCreateFormConfig(this, {
        compact: true,
        stayOnSuccess: true
      })
      config.moreButtons = [
        {
          title: this.$t('Cancel'),
          callback: this.closeQuickCreate
        }
      ]
      this.quickLabelFormConfig = config
      this.quickLabelCanSubmit = false
      this.quickLabelFormKey += 1
      this.quickCreateVisible = true
    },
    closeQuickCreate() {
      this.quickCreateVisible = false
      this.quickLabelFormConfig = {}
      this.quickLabelCanSubmit = false
    },
    handleQuickLabelFormChange(form) {
      this.quickLabelCanSubmit = Boolean(form?.name?.trim() && form?.value?.trim())
    },
    addCreatedLabelOption(label) {
      this.cancelLabelKeySearch()
      this.addLabelToDefaultCache(label)
      const valueOption = {
        value: label.value,
        label: label.value,
        labelData: label
      }
      const keyOption = this.labelOptions.find((option) => option.value === label.name)

      if (keyOption) {
        if (!keyOption.values.some((option) => option.value === label.value)) {
          keyOption.values = _.sortBy([...keyOption.values, valueOption], 'label')
        }
      } else {
        this.labelOptions = _.sortBy(
          [
            ...this.labelOptions,
            {
              value: label.name,
              label: label.name,
              values: [valueOption]
            }
          ],
          'label'
        )
      }

      this.activeKey = label.name
      this.keyQuery = ''
      this.valueQuery = ''
    },
    handleQuickLabelCreated(label) {
      this.addCreatedLabelOption(label)
      if (!this.isLabelSelected(label.name, label.value)) {
        this.draftLabels.push(label)
      }
      this.openQuickCreate()
    },
    setLabels(labels) {
      this.initial = _.cloneDeep(labels)
      this.iLabels = _.cloneDeep(labels)
    },
    openEditDialog() {
      if (!this.canEdit || this.showDialog) return

      this.draftLabels = _.cloneDeep(this.iLabels)
      this.resetLabelSelectorSearch()
      this.selectedQuery = ''
      this.closeQuickCreate()
      this.showDialog = true
      this.$nextTick(() => {
        this.$refs.keySearchInput?.focus()
      })
      this.getLabelOptions('')
    },
    getLabelIdentity(label) {
      return label.id || `${label.name}:${label.value}`
    },
    isLabelSelected(key, value) {
      return this.draftLabels.some((label) => label.name === key && label.value === value)
    },
    toggleLabel(label) {
      if (!label) return
      if (this.isLabelSelected(label.name, label.value)) {
        this.handleCloseTag(label)
      } else {
        this.draftLabels.push(label)
      }
    },
    handleCloseTag(label) {
      const identity = this.getLabelIdentity(label)
      this.draftLabels = this.draftLabels.filter((item) => this.getLabelIdentity(item) !== identity)
    },
    handleCancel() {
      this.resetLabelSelectorSearch()
      this.draftLabels = []
      this.selectedQuery = ''
      this.closeQuickCreate()
      this.showDialog = false
    },
    handleConfirm() {
      const getIdentity = (label) => this.getLabelIdentity(label)
      const origin = _.sortBy(this.initial.map(getIdentity))
      const current = _.sortBy(this.draftLabels.map(getIdentity))
      if (_.isEqual(origin, current)) {
        this.showDialog = false
        return
      }

      const path = new URL(this.url, location.origin).pathname
      const url = `${path}${this.row.id}/`
      this.$axios.patch(url, { labels: this.draftLabels }).then(() => {
        this.iLabels = _.cloneDeep(this.draftLabels)
        this.initial = _.cloneDeep(this.draftLabels)
        this.$emit('input', this.iLabels)
        this.$message.success(this.$tc('UpdateSuccessMsg'))
        this.showDialog = false
      })
    },
    goToLabelList() {
      this.showDialog = false
      this.$router.push({ name: 'LabelList' })
    }
  }
}
</script>

<style lang="scss" scoped>
.label-container {
  position: relative;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  height: 23px;
  min-height: 23px;
  overflow: hidden;
  contain: inline-size;

  &.is-editable {
    padding: 0 6px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.15s ease;

    &:hover,
    &:focus-visible {
      background: var(--el-fill-color-light);
      outline: none;
    }
  }
}

.label-formatter-col {
  width: 100%;
  height: 23px;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.label-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  height: 23px;
  min-width: 0;
  max-width: 100%;
  gap: 6px;
  overflow-x: auto;
  overflow-y: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  .tag-formatter {
    flex: 0 0 auto;
    max-width: none;
    margin: 0;

    :deep(.el-tag__content) {
      flex: 0 0 auto;
      overflow: visible;
    }

    :deep(.label-content) {
      max-width: none;
    }

    :deep(.label-value) {
      overflow: visible;
      text-overflow: clip;
    }
  }
}

.label-empty {
  color: var(--el-text-color-placeholder);
}
</style>

<style lang="scss">
@use '../labelSelector' as labelSelector;

.label-bind-dialog {
  .el-dialog__body {
    padding: 14px 16px !important;
  }

  .label-bind-toolbar {
    --quick-create-control-height: 32px;

    display: flex;
    align-items: center;
    height: var(--quick-create-control-height);
    min-height: var(--quick-create-control-height);
    gap: 10px;
    margin-bottom: 10px;
    overflow: hidden;

    &__quick-create {
      flex: 0 0 auto;
      height: var(--quick-create-control-height);

      .action-item.el-button {
        height: var(--quick-create-control-height);
      }
    }

    &__list-link {
      flex: 0 0 auto;
      margin-left: auto;
    }
  }

  .quick-label-create-inline {
    width: 100%;
    height: var(--quick-create-control-height);
    min-width: 0;
    flex: 1;
    overflow: hidden;

    > .el-loading-parent--relative {
      height: var(--quick-create-control-height);
      min-height: var(--quick-create-control-height);
    }

    > .el-loading-parent--relative > .el-loading-mask {
      display: none;
    }

    .data-form-container {
      container-type: normal;
    }

    .form-fields.el-form {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      align-items: center;
      justify-content: start;
      gap: 0;
      margin: 0;
      padding: 0;

      .form-group-header {
        display: none;
      }

      .el-form-item {
        display: block;
        height: var(--quick-create-control-height);
        min-width: 0;
        margin: 0;

        .el-form-item__label-wrap,
        .el-form-item__label {
          display: none;
        }

        .el-form-item__content {
          width: 100%;
          height: var(--quick-create-control-height);
          min-height: var(--quick-create-control-height);
          align-items: center;
        }

        .el-input {
          height: var(--quick-create-control-height);
          width: 100%;
        }

        .el-input__wrapper {
          min-height: var(--quick-create-control-height);
          border-radius: 0;
        }

        .el-color-picker,
        .el-color-picker__trigger {
          width: var(--quick-create-control-height);
          height: var(--quick-create-control-height);
        }

        .el-color-picker__trigger {
          border-radius: 0;
        }
      }

      .el-form-item-name {
        margin-right: 10px;
        margin-left: 0;
        grid-column: 1;
        grid-row: 1;
      }

      .el-form-item-value {
        margin-right: 10px;
        margin-left: 0;
        grid-column: 2;
        grid-row: 1;
      }

      .el-form-item-color {
        width: var(--quick-create-control-height);
        margin-left: 0;
        grid-column: 3;
        grid-row: 1;
      }

      .form-buttons {
        display: flex;
        flex-wrap: nowrap;
        grid-column: 3;
        grid-row: 1;
        gap: 8px;
        margin: 0 0 0 40px;
        padding: 0;
        white-space: nowrap;

        .el-button {
          height: var(--quick-create-control-height);
          margin-left: 0;
        }

        .form-submit-button {
          order: 1;
        }

        .form-secondary-button {
          order: 2;
        }
      }
    }
  }

  .label-bind-layout {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    height: min(400px, calc(100vh - 240px));
    min-height: 300px;
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 0;
    background: var(--el-bg-color);
  }

  .label-panel {
    display: flex;
    min-width: 0;
    min-height: 0;
    flex-direction: column;
    overflow: hidden;
    background: var(--el-bg-color);

    & + .label-panel {
      border-left: 1px solid var(--el-border-color-lighter);
    }

    &__search {
      @include labelSelector.search-input;
    }

    &__list {
      min-height: 0;
      flex: 1;
      padding: 6px 10px;
      overflow: auto;
      -ms-overflow-style: none;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    &__option {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      width: max-content;
      min-width: 100%;
      height: 36px;
      gap: 10px;
      padding: 0 10px;
      color: var(--el-text-color-regular);
      font-size: 13px;
      text-align: left;
      border: 0;
      border-radius: 0;
      background: transparent;
      cursor: pointer;
      user-select: none;

      &:hover,
      &:focus-visible,
      &.is-active {
        color: var(--el-text-color-primary);
        background: var(--el-fill-color-light);
        outline: none;
      }

      &.is-selected {
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }
    }

    &__option-text {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    &__empty {
      padding: 24px 12px;
      color: var(--el-text-color-placeholder);
      text-align: center;

      &--center {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .label-panel__key {
    .el-icon {
      flex: 0 0 auto;
      margin-left: auto;
    }
  }

  .label-panel__value {
    @include labelSelector.value-color-swatch;

    .el-checkbox {
      flex: 0 0 auto;
      height: auto;
      margin-right: 0;
      pointer-events: none;
    }
  }

  .selected-labels {
    background: var(--el-bg-color);

    &__body {
      min-height: 0;
      flex: 1;
      padding: 6px 10px;
      overflow: auto;
      -ms-overflow-style: none;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    &__row {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      width: max-content;
      min-width: 100%;
      height: 40px;
      padding: 0 10px;
      text-align: left;
      border: 0;
      border-radius: 0;
      background: transparent;
      cursor: pointer;

      &:hover,
      &:focus-visible {
        background: var(--el-color-danger-light-9);
        outline: none;
      }
    }

    &__tag.el-tag {
      width: max-content;
      min-width: 0;
      max-width: none;
      height: 28px;
      margin: 0;
      padding: 0 11px;
      border-radius: 2em;
      opacity: 1;
      pointer-events: none;

      .el-tag__content,
      .label-content {
        max-width: none;
        overflow: visible;
      }

      .label-value {
        overflow: visible;
        text-overflow: clip;
      }
    }

    &__empty {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      color: var(--el-text-color-placeholder);
    }
  }
}

@media (max-width: 900px) {
  .label-bind-dialog {
    .el-dialog__header {
      padding: 12px 18px !important;
    }

    .el-dialog__body {
      padding: 12px !important;
    }

    .el-dialog__footer {
      padding: 12px 18px !important;
    }

    .label-bind-layout {
      height: min(380px, calc(100vh - 220px));
      min-height: 280px;
    }

    .label-panel {
      &__search {
        padding: 8px;
      }

      &__list,
      .selected-labels__body {
        padding: 4px 8px;
      }

      &__option,
      .selected-labels__row {
        padding-right: 8px;
        padding-left: 8px;
      }
    }
  }
}

@media (max-width: 640px) {
  .label-bind-dialog.el-dialog {
    width: calc(100vw - 20px) !important;
    max-width: calc(100vw - 20px);
    max-height: calc(100vh - 20px);
    margin-top: 10px !important;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;

    .el-dialog__header {
      flex: 0 0 auto;
      padding: 10px 14px !important;
    }

    .el-dialog__title {
      font-size: 16px;
    }

    .el-dialog__body {
      min-height: 0;
      flex: 1;
      padding: 10px !important;
      overflow-y: auto;
    }

    .el-dialog__footer {
      flex: 0 0 auto;
      padding: 10px 14px !important;
    }

    .label-bind-toolbar {
      height: auto;
      min-height: var(--quick-create-control-height);
      overflow: visible;
    }

    .quick-label-create-inline {
      height: auto;
      overflow: visible;

      > .el-loading-parent--relative {
        height: auto;
      }

      .form-fields.el-form {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        row-gap: 8px;

        .el-form-item-name {
          grid-column: 1;
          grid-row: 1;
        }

        .el-form-item-value {
          margin-right: 0;
          grid-column: 2;
          grid-row: 1;
        }

        .el-form-item-color {
          grid-column: 1;
          grid-row: 2;
        }

        .form-buttons {
          justify-self: start;
          grid-column: 1 / -1;
          grid-row: 2;
        }
      }
    }

    .label-bind-layout {
      height: auto;
      min-height: 0;
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: repeat(3, minmax(180px, 30vh));
      overflow: visible;
    }

    .label-panel {
      & + .label-panel {
        border-top: 1px solid var(--el-border-color-lighter);
        border-left: 0;
      }
    }
  }
}
</style>
