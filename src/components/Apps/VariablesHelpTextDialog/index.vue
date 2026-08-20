<template>
  <Dialog
    :show-cancel="false"
    :show-confirm="false"
    :title="title"
    :visible="visible"
    class="help-dialog"
    top="8vh"
    width="720px"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="variables-help-content">
      <el-alert
        :closable="false"
        :title="variablesHelpMessage"
        class="help-intro"
        show-icon
        type="info"
      />

      <el-table :data="variables" class="help-table" max-height="420" table-layout="fixed">
        <el-table-column :label="$t('Variable')" min-width="220">
          <template #default="{ row }">
            <button
              :aria-label="$t('ClickCopy') + ': ' + row.name"
              class="variable-button"
              type="button"
              @click="onCopy(row.name)"
            >
              <code>{{ row.name }}</code>
              <i aria-hidden="true" class="fa-regular fa-copy" />
            </button>
          </template>
        </el-table-column>
        <el-table-column :label="$t('Description')" min-width="180">
          <template #default="{ row }">
            <span class="variable-description">{{ row.label || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('Example')" min-width="240">
          <template #default="{ row }">
            <code class="example-value">{{ row.default || '—' }}</code>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import { copy } from '@/utils/common/index'

export default {
  components: {
    Dialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    variables: {
      type: Array,
      default: () => []
    },
    variablesHelpText: {
      type: String,
      default() {
        return 'WatermarkVariableHelpText'
      }
    }
  },
  emits: ['update:visible'],
  data() {
    return {
      title: this.$t('BuiltinVariable')
    }
  },
  computed: {
    variablesHelpMessage() {
      const message = this.$tm(this.variablesHelpText)
      return typeof message === 'string' ? message : this.variablesHelpText
    }
  },
  methods: {
    onCopy(key) {
      copy(key)
    }
  }
}
</script>

<style lang="scss" scoped>
.variables-help-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.help-intro {
  --el-alert-padding: 12px 14px;

  align-items: flex-start;

  :deep(.el-alert__icon) {
    margin-top: 3px;
  }

  :deep(.el-alert__title) {
    font-size: 12px;
    line-height: 1.6;
    white-space: normal;
  }
}

.help-table {
  --el-table-header-bg-color: var(--el-fill-color-light);
  --el-table-row-hover-bg-color: var(--el-color-primary-light-9);

  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;

  :deep(&::before) {
    display: none;
  }

  :deep(th.el-table__cell) {
    height: 42px;
    padding: 0;
    color: var(--el-text-color-primary);
    font-weight: 600;
  }

  :deep(td.el-table__cell) {
    padding: 10px 0;
  }
}

.variable-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  padding: 0;
  color: var(--el-color-primary);
  background: transparent;
  border: 0;
  cursor: pointer;

  code {
    min-width: 0;
    padding: 3px 8px;
    font-family: Monaco, Menlo, Consolas, 'Courier New', monospace;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.4;
    overflow-wrap: anywhere;
    background: var(--el-color-primary-light-9);
    border: 1px solid var(--el-color-primary-light-8);
    border-radius: 4px;
  }

  .fa {
    flex-shrink: 0;
    font-size: 12px;
    opacity: 0.55;
    transition: opacity 0.15s ease;
  }

  &:hover .fa,
  &:focus-visible .fa {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary-light-5);
    outline-offset: 3px;
    border-radius: 4px;
  }
}

.variable-description {
  color: var(--el-text-color-regular);
}

.example-value {
  color: var(--el-text-color-secondary);
  font-family: Monaco, Menlo, Consolas, 'Courier New', monospace;
  font-size: 12px;
  overflow-wrap: anywhere;
}
</style>
