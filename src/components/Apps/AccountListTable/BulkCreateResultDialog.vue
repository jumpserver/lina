<template>
  <Dialog
    :show-cancel="false"
    :title="title"
    v-bind="$attrs"
    @confirm="closeDialog"
    v-on="$listeners"
  >
    <el-alert style="margin-bottom: 10px" type="success">
      <span v-for="item of summary" :key="item.key"><b>{{ item.label }}</b>: {{ item.value }} </span>
    </el-alert>
    <DataTable :config="config" />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import DataTable from '@/components/Table/DataTable/index.vue'

export default {
  name: 'ResultDialog',
  components: {
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
    const errorProp = this.$t('common.Error')
    const stateMap = {
      'created': this.$tc('common.Created'),
      'updated': this.$tc('common.Updated'),
      'skipped': this.$tc('common.Skipped')
    }
    const stateClsMap = {
      'created': 'color-primary',
      'updated': 'color-success',
      'skipped': 'color-default'
    }
    return {
      title: this.$t('accounts.AddAccountResult'),
      config: {
        columns: [
          {
            prop: 'asset',
            label: this.$t('assets.Asset')
          },
          {
            prop: 'state',
            label: this.$t('common.Status'),
            width: '200px',
            formatter: (row) => {
              if (row.error) {
                return <span class='color-error'>{ errorProp }: { row.error }</span>
              } else if (row.state) {
                const colorCls = stateClsMap[row.state]
                const state = stateMap[row.state]
                return <span class={ colorCls }>{ state }</span>
              }
            }
          }
        ],
        totalData: this.result
      }
    }
  },
  computed: {
    summary() {
      const labels = {
        total: this.$tc('common.Total'),
        created: this.$tc('common.Created'),
        updated: this.$tc('common.Updated'),
        skipped: this.$tc('common.Skipped'),
        error: this.$tc('common.Error')
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
      this.$emit('update:visible', false)
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

.color-default {
}

::v-deep .el-data-table .el-table .el-table__row > td > div > span {
  white-space: inherit;
}

</style>
