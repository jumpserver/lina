<template>
  <Dialog v-bind="$attrs" :show-cancel="false" :title="title" width="960px" @confirm="closeDialog">
    <el-alert style="margin-bottom: 10px" type="info">
      <span v-for="item of summary" :key="item.key"
        ><b>{{ item.label }}</b
        >: {{ item.value }}
      </span>
    </el-alert>
    <DataTable :config="config" />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import DataTable from '@/components/Table/DataTable/index.vue'
import { h } from 'vue'

const StateFormatter = {
  name: 'BulkCreateResultStateFormatter',
  props: {
    row: {
      type: Object,
      default: () => ({})
    }
  },
  render() {
    if (this.row.error) {
      return h('span', { class: 'color-error' }, [this.$t('Error'), ': ', this.row.error])
    }

    if (this.row.state) {
      const stateMap = {
        created: this.$tc('Created'),
        updated: this.$tc('Updated'),
        skipped: this.$tc('Skipped')
      }
      const stateClsMap = {
        created: 'color-primary',
        updated: 'color-success',
        skipped: 'color-default'
      }
      return h(
        'span',
        { class: stateClsMap[this.row.state] },
        stateMap[this.row.state] || this.row.state
      )
    }

    return h('span', '-')
  }
}

export default {
  name: 'ResultDialog',
  components: {
    StateFormatter,
    DataTable,
    Dialog
  },
  props: {
    result: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      title: this.$t('AddAccountResult'),
      config: {
        columns: [
          {
            prop: 'asset',
            label: this.$t('Asset')
          },
          {
            prop: 'account',
            label: this.$t('Account')
          },
          {
            prop: 'state',
            label: this.$t('Status'),
            width: '200px',
            formatter: StateFormatter
          }
        ],
        totalData: this.result
      }
    }
  },
  computed: {
    summary() {
      const labels = {
        total: this.$tc('Total'),
        created: this.$tc('Created'),
        updated: this.$tc('Updated'),
        skipped: this.$tc('Skipped'),
        error: this.$tc('Error')
      }
      const grouped = _.groupBy(this.result, 'state')
      const groupedLength = _.mapValues(grouped, 'length')
      groupedLength['total'] = this.result.length
      return _.map(groupedLength, (value, key) => {
        return {
          label: labels[key],
          value: value,
          key: key
        }
      })
    }
  },
  methods: {
    closeDialog() {
      this.$emit('close-all')
    }
  }
}
</script>

<style scoped>
.color-error {
  color: var(--color-danger);
}

.color-primary {
  color: var(--color-primary);
}

.color-success {
  color: var(--color-success);
}

:deep(.el-data-table .el-table .el-table__row > td > div > span) {
  white-space: inherit;
}
</style>
