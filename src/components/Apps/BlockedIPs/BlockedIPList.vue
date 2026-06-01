<template>
  <div class="blocked-ip-list">
    <TableAction
      :date-pick="() => {}"
      :has-left-actions="headerActions.hasLeftActions"
      :has-right-actions="headerActions.hasRightActions"
      :reload-table="loadBlockedIPs"
      :search-table="() => {}"
      :selected-rows="selectedRows"
      :table-url="blockIPUrl"
      v-bind="headerActions"
      @done="handleActionInitialDone"
    />

    <div class="local-search">
      <el-input
        v-model.trim="keyword"
        size="mini"
        clearable
        :placeholder="$t('Search')"
      >
        <i slot="prefix" class="el-input__icon el-icon-search" />
      </el-input>
    </div>

    <IBox v-loading="!actionInit || loading" class="table-content">
      <DataTable
        v-if="actionInit"
        ref="dataTable"
        :key="tableKey"
        :config="tableConfig"
        @selection-change="handleSelectionChange"
      />
    </IBox>
  </div>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import DataTable from '@/components/Table/DataTable/index.vue'
import TableAction from '@/components/Table/ListTable/TableAction/index.vue'

const BLOCK_IP_URL = '/api/v1/settings/security/block-ip/'
const UNLOCK_IP_URL = '/api/v1/settings/security/unlock-ip/'

const ActionsFormatter = {
  name: 'BlockedIPActionsFormatter',
  props: {
    row: {
      type: Object,
      default: () => ({})
    },
    col: {
      type: Object,
      default: () => ({})
    }
  },
  render(h) {
    const args = this.col.formatterArgs || {}
    if (args.can === false) {
      return null
    }

    return h(
      'el-button',
      {
        props: {
          size: 'mini',
          type: 'primary'
        },
        on: {
          click: () => args.onUnlock(this.row)
        }
      },
      args.title
    )
  }
}

export default {
  name: 'BlockedIPList',
  components: {
    IBox,
    DataTable,
    TableAction
  },
  props: {
    object: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  data() {
    return {
      blockIPUrl: BLOCK_IP_URL,
      actionInit: false,
      loading: false,
      keyword: '',
      rows: [],
      selectedRows: [],
      tableKey: 0
    }
  },
  computed: {
    canChangeSecurity() {
      return this.$hasPerm('settings.change_security')
    },

    filteredRows() {
      const keyword = this.keyword.toLowerCase()
      if (!keyword) {
        return this.rows
      }

      return this.rows.filter(row => {
        return String(row.ip || '').toLowerCase().includes(keyword)
      })
    },

    tableConfig() {
      return {
        name: 'BlockedIPList',
        url: '',
        totalData: this.filteredRows,
        columns: [
          {
            prop: 'ip',
            label: this.$t('IP'),
            minWidth: '180px'
          },
          {
            prop: 'actions',
            label: this.$t('Actions'),
            width: '120px',
            align: 'center',
            formatter: ActionsFormatter,
            formatterArgs: {
              title: this.$t('Unblock'),
              can: this.canChangeSecurity,
              onUnlock: row => this.unlockIPs([row.ip])
            }
          }
        ],
        tableActions: {
          hasEdit: false,
          hasDelete: false
        },
        hasNew: false,
        hasEdit: false,
        hasDelete: false,
        hasSelection: this.canChangeSecurity,
        buttonSize: 'mini',
        defaultAlign: 'left',
        dataPath: 'results',
        totalPath: 'count',
        saveQuery: false,
        persistSelection: true,
        paginationLayout: 'total, sizes, prev, pager, next',
        paginationSize: 15,
        paginationSizes: [15, 30, 50, 100],
        paginationBackground: true,
        tableAttrs: {
          stripe: false,
          border: true,
          fit: true
        }
      }
    },

    headerActions() {
      return {
        hasExport: false,
        hasImport: false,
        hasCreate: false,
        hasSearch: false,
        hasRefresh: true,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasLeftActions: true,
        hasRightActions: true,
        extraMoreActions: [
          {
            name: 'UnlockSelected',
            title: this.$t('UnblockSelected'),
            type: 'primary',
            can: ({ selectedRows }) => selectedRows.length > 0,
            callback: ({ selectedRows }) => {
              this.unlockIPs(selectedRows.map(v => v.ip))
            }
          }
        ]
      }
    }
  },
  watch: {
    keyword() {
      this.selectedRows = []
      this.reloadStaticTable()
    }
  },
  mounted() {
    this.loadBlockedIPs()
  },
  methods: {
    handleActionInitialDone() {
      setTimeout(() => {
        this.actionInit = true
      }, 100)
    },

    handleSelectionChange(rows) {
      this.selectedRows = rows
    },

    reloadStaticTable() {
      this.$nextTick(() => {
        this.$refs.dataTable?.getList()
      })
    },

    async loadBlockedIPs() {
      this.loading = true
      try {
        this.rows = await this.fetchAllBlockedIPs()
        this.selectedRows = []
        this.reloadStaticTable()
      } finally {
        this.loading = false
      }
    },

    async fetchAllBlockedIPs() {
      const limit = 1000
      let offset = 0
      let count = 0
      const rows = []

      do {
        const response = await this.$axios.get(BLOCK_IP_URL, {
          params: {
            offset,
            limit
          }
        })

        const data = response?.data || response || {}
        const pageRows = data.results || []
        const total = Number(data.count)

        count = Number.isNaN(total) ? rows.length + pageRows.length : total
        rows.push(...pageRows)
        offset += limit

        if (pageRows.length === 0) {
          break
        }
      } while (rows.length < count)

      return rows.sort((a, b) => {
        return String(a.ip || '').localeCompare(String(b.ip || ''))
      })
    },

    async unlockIPs(ips) {
      if (!ips || ips.length === 0) {
        return
      }

      await this.$axios.post(UNLOCK_IP_URL, { ips })
      this.$message.success(this.$tc('UnlockSuccessMsg'))
      this.loadBlockedIPs()
    }
  }
}
</script>

<style lang="scss" scoped>
.blocked-ip-list {
  position: relative;

  .local-search {
    position: absolute;
    top: 0;
    right: 90px;
    z-index: 2;
    width: 180px;

    ::v-deep {
      .el-input__inner {
        height: 28px;
        line-height: 28px;
      }

      .el-input__icon {
        line-height: 28px;
      }
    }
  }

  .table-content {
    margin-top: 10px;

    ::v-deep {
      .el-card__body {
        padding: 0;
      }

      .el-table__row .cell {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .el-pagination.is-background .el-pager li {
        margin: 0 1px;
        padding: 0 2px;
      }
    }
  }
}
</style>
