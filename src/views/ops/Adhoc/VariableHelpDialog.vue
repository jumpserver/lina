<template>
  <Dialog
    :show-cancel="false"
    :show-confirm="false"
    :title="title"
    :visible="visible"
    top="8vh"
    width="640px"
    @update:visible="$emit('update:visible', $event)"
  >
    <p class="help-intro">{{ $t('VariableHelpText') }}</p>
    <table class="help-table">
      <thead>
        <tr>
          <th scope="col">{{ $t('Variable') }}</th>
          <th scope="col">{{ $t('Description') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(description, key) in variables" :key="key">
          <td>
            <button
              :aria-label="`${$t('ClickCopy')} ${key}`"
              :title="$t('ClickCopy')"
              class="variable-copy"
              type="button"
              @click="onCopy(key)"
            >
              <code>{{ key }}</code>
              <el-icon aria-hidden="true"><CopyDocument /></el-icon>
            </button>
          </td>
          <td>{{ description }}</td>
        </tr>
      </tbody>
    </table>
  </Dialog>
</template>

<script>
import { Dialog } from '@/components'
import { copy } from '@/utils/common/index'

export default {
  components: {
    Dialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible'],
  data() {
    return {
      title: this.$t('BuiltinVariable'),
      variables: {}
    }
  },
  mounted() {
    this.$axios.get('/api/v1/ops/variables/help/').then((data) => {
      this.variables = data
    })
  },
  methods: {
    onCopy(key) {
      copy(key)
    }
  }
}
</script>

<style lang="scss" scoped>
.help-intro {
  margin: 0 0 16px;
  color: var(--el-text-color-regular);
}

.help-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  line-height: 1.5;

  th,
  td {
    padding: 8px 12px;
    text-align: start;
    overflow-wrap: anywhere;
  }

  th {
    background: var(--el-fill-color-light);
    color: var(--el-text-color-regular);
    font-weight: 600;
  }

  th:first-child {
    width: 40%;
  }

  td {
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
}

.variable-copy {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  min-height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--el-text-color-primary);
  font: inherit;
  text-align: start;
  cursor: pointer;

  code {
    min-width: 0;
    font-family: ui-monospace, Menlo, Consolas, monospace;
  }

  .el-icon {
    color: var(--el-text-color-secondary);
  }

  &:hover,
  &:focus-visible {
    color: var(--el-color-primary);

    .el-icon {
      color: inherit;
    }
  }
}
</style>
