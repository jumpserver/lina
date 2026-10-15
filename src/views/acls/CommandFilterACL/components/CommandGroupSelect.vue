<template>
  <div class="command-group-select" :style="$attrs.style">
    <ResourceSelect
      ref="resourceSelect"
      :disabled="disabled"
      :model-value="selectedValue"
      :resource-name="resourceName"
      :url="url"
      @update:model-value="handleSelectionChange"
    />

    <div v-if="canCreate" class="command-group-select__actions">
      <el-button
        :disabled="isDisabled"
        class="command-group-select__create"
        size="small"
        type="primary"
        @click="openCreateDialog"
      >
        <el-icon><Plus /></el-icon>
        {{ $t('CommandGroupCreate') }}
      </el-button>
    </div>

    <Dialog
      v-if="createDialogVisible"
      v-model:visible="createDialogVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :show-buttons="false"
      :title="$t('CommandGroupCreate')"
      width="760px"
    >
      <el-alert
        :closable="false"
        :title="$t('CommandGroupImmediateSaveHelp')"
        class="command-group-select__notice"
        show-icon
        type="info"
      />
      <GenericCreateUpdateForm :key="createFormKey" v-bind="createFormConfig" />
    </Dialog>
  </div>
</template>

<script>
import { Dialog } from '@/components'
import { ResourceSelect } from '@/components/Form/FormFields'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { normalizeResourceValue } from '@/components/Form/FormFields/resourceSelectSummary'
import { getCommandGroupFormConfig } from './commandGroupForm'

const COMMAND_GROUP_URL = '/api/v1/acls/command-groups/'

export default {
  name: 'CommandGroupSelect',
  components: {
    Dialog,
    GenericCreateUpdateForm,
    ResourceSelect
  },
  inheritAttrs: false,
  props: {
    value: {
      type: [Array, String, Number, Object],
      default: undefined
    },
    modelValue: {
      type: [Array, String, Number, Object],
      default: undefined
    },
    url: {
      type: String,
      default: COMMAND_GROUP_URL
    },
    resourceName: {
      type: String,
      default: ''
    },
    disabled: {
      type: [Boolean, Function],
      default: false
    }
  },
  emits: ['input', 'change', 'update:modelValue', 'update:model-value'],
  data() {
    return {
      createDialogVisible: false,
      createFormKey: 0
    }
  },
  computed: {
    selectedValue() {
      const value = this.modelValue !== undefined ? this.modelValue : this.value
      return normalizeResourceValue(value)
    },
    isDisabled() {
      return typeof this.disabled === 'function' ? this.disabled() : this.disabled
    },
    canCreate() {
      return this.$hasPerm('acls.add_commandgroup') && !this.$store.getters.currentOrgIsRoot
    },
    createFormConfig() {
      return {
        ...getCommandGroupFormConfig(this),
        url: COMMAND_GROUP_URL,
        getUrl: () => COMMAND_GROUP_URL,
        submitMethod: 'post',
        needGetObjectDetail: false,
        hasDetailInMsg: false,
        hasReset: false,
        hasSaveContinue: false,
        onPerformSuccess: this.handleGroupCreated
      }
    }
  },
  methods: {
    emitSelection(value) {
      const payload = [...value]
      this.$emit('input', payload)
      this.$emit('update:modelValue', payload)
      this.$emit('update:model-value', payload)
      this.$emit('change', payload)
    },
    handleSelectionChange(value) {
      this.emitSelection(normalizeResourceValue(value))
    },
    openCreateDialog() {
      if (this.isDisabled) {
        return
      }
      this.createFormKey += 1
      this.createDialogVisible = true
    },
    handleGroupCreated(group) {
      this.$refs.resourceSelect?.cacheSummaryResources(group)
      const nextValue = [...this.selectedValue]
      if (!nextValue.some((id) => String(id) === String(group.id))) {
        nextValue.push(group.id)
      }
      this.emitSelection(nextValue)
      this.createDialogVisible = false
      this.$message.success(this.$t('CommandGroupCreatedAndSelected'))
    }
  }
}
</script>

<style lang="scss" scoped>
.command-group-select {
  width: 100%;
  min-width: 0;
}

.command-group-select__actions {
  margin-top: 8px;
}

.command-group-select__create {
  margin: 0;

  :deep(.el-icon) {
    margin-right: 4px;
  }
}

.command-group-select__notice {
  margin-bottom: 16px;
}
</style>
