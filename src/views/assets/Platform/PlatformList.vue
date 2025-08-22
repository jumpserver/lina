<template>
  <TabPage
    v-if="!loading"
    :active-menu.sync="tab.activeMenu"
    :help-tip="platformPageHelpMsg"
    :submenu="tab.submenu"
    @tab-click="changeMoreCreates"
  >
    <keep-alive>
      <GenericListTable
        ref="genericListTable"
        :create-drawer="createDrawer"
        :detail-drawer="detailDrawer"
        :header-actions="headerActions"
        :table-config="tableConfig"
      />
    </keep-alive>
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import { ChoicesFormatter, ProtocolsFormatter } from '@/components/Table/TableFormatters'
import GenericListTable from '@/components/Table/DrawerListTable/index.vue'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'

export default {
  components: {
    TabPage,
    GenericListTable
  },
  data() {
    const vm = this
    return {
      createDrawer: () => import('@/views/assets/Platform/PlatformCreateUpdate.vue'),
      detailDrawer: () => import('@/views/assets/Platform/PlatformDetail/index.vue'),
      loading: true,
      platformPageHelpMsg: this.$t('PlatformPageHelpMsg'),
      tab: {
        submenu: [],
        activeMenu: 'host'
      },
      tableConfig: {
        url: '/api/v1/assets/platforms/',
        columnsExclude: ['automation'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'assets_amount', 'category', 'type', 'actions']
        },
        columnsMeta: {
          assets_amount: {
            width: '160px',
            formatter: AmountFormatter,
            formatterArgs: {
              async: true,
              permissions: 'assets.view_asset',
              getRoute({ row }) {
                return {
                  name: 'PlatformDetail',
                  params: {
                    id: row.id
                  },
                  query: {
                    tab: 'Assets'
                  }
                }
              }
            }
          },
          type: {
            formatter: ChoicesFormatter
          },
          category: {
            formatter: ChoicesFormatter
          },
          gateway_enabled: {
            formatterArgs: {
              showFalse: false
            }
          },
          su_enabled: {
            width: '200px',
            formatterArgs: {
              showFalse: false
            }
          },
          su_method: {
            width: '200px',
            formatter: (row) => {
              if (!row.su_enabled) {
                return '-'
              }
              return row?.su_method?.label || '-'
            }
          },
          protocols: {
            showFullContent: true,
            formatter: ProtocolsFormatter
          },
          base: {
            width: '140px'
          },
          internal: {
            width: '100px',
            formatterArgs: {
              showFalse: false
            }
          },
          actions: {
            formatterArgs: {
              canClone: () => vm.$hasPerm('assets.add_platform'),
              onClone({ row }) {
                vm.$refs.genericListTable.onClone({ row, query: { type: row.type.value, category: row.category.value } })
              },
              canUpdate: ({ row }) => !row.internal && vm.$hasPerm('assets.change_platform'),
              canDelete: ({ row }) => !row.internal && vm.$hasPerm('assets.delete_platform'),
              onUpdate({ row, col }) {
                vm.$refs.genericListTable.onUpdate({
                  row,
                  col,
                  query: { type: row.type.value, category: row.category.value }
                })
              }
            }
          }
        }
      },
      headerActions: {
        hasLabelSearch: true,
        hasBulkDelete: false,
        hasMoreActions: false,
        hasRightActions: true,
        createRoute: 'PlatformCreate',
        canCreate: () => this.$hasPerm('assets.add_platform'),
        importOptions: {
          url: vm.url
        },
        exportOptions: {
          url: vm.url
        },
        moreCreates: {
          callback: (item) => {
            this.$refs.genericListTable.onCreate({ query: { type: item.name, category: item.category } })
          },
          dropdown: []
        }
      },
      lastTab: ''
    }
  },
  computed: {
    url() {
      return `/api/v1/assets/platforms/?category=${this.tab.activeMenu}`
    }
  },
  activated() {
  },
  async mounted() {
    try {
      await this.setCategoriesTab()
    } finally {
      this.loading = false
    }

    const name = this.$route.query?.name
    const platform = this.$route.query?.id

    if (platform) {
      this.$nextTick(() => {
        this.$refs.genericListTable.onDetail({ row: { id: platform, name } })
      })
    }
  },
  updated() {
    this.changeMoreCreates()
  },
  methods: {
    changeMoreCreates() {
      this.tableConfig.url = this.url
      this.headerActions.importOptions.url = this.url
      this.headerActions.exportOptions.url = this.url
      const types = this.$store.state.assets.assetCategoriesDropdown.filter(item => {
        return item.category === this.tab.activeMenu
      }).map(item => {
        if (item.group && !item.group.includes(this.$t('Type'))) {
          item.group += this.$t('WordSep') + this.$t('Type')
        }
        return item
      })
      this.headerActions.moreCreates.dropdown = types
    },
    async setCategoriesTab() {
      const categoryIcon = {
        host: 'fa-inbox',
        device: 'fa-microchip',
        database: 'fa-database',
        cloud: 'fa-cloud',
        web: 'fa-globe',
        gpt: 'fa-comment',
        ds: 'fa-id-card-o',
        custom: 'fa-cube'
      }
      const state = await this.$store.dispatch('assets/getAssetCategories')
      for (const item of state.assetCategories) {
        this.tab.submenu.push({
          name: item.value,
          title: item.label,
          icon: categoryIcon[item.value]
        })
      }
    }
  }
}
</script>
