<template>
  <TabPage
    v-if="!loading"
    :active-menu.sync="tab.activeMenu"
    :help-tip="platformPageHelpMsg"
    :submenu="tab.submenu"
    @tab-click="changeMoreCreates"
  >
    <keep-alive>
      <GenericListTable ref="genericListTable" :header-actions="headerActions" :table-config="tableConfig" />
    </keep-alive>
  </TabPage>
</template>

<script>
import { GenericListTable, TabPage } from '@/layout/components'
import { ChoicesFormatter, ProtocolsFormatter } from '../../../components/Table/TableFormatters'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'

export default {
  components: {
    TabPage,
    GenericListTable
  },
  data() {
    const vm = this
    return {
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
          domain_enabled: {
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
              canUpdate: ({ row }) => !row.internal && vm.$hasPerm('assets.change_platform'),
              canDelete: ({ row }) => !row.internal && vm.$hasPerm('assets.delete_platform'),
              updateRoute: ({ row }) => {
                return {
                  name: 'PlatformUpdate',
                  params: { id: row.id },
                  query: {
                    category: row.category.value,
                    type: row.type.value
                  }
                }
              },
              cloneRoute: ({ row }) => {
                return {
                  name: 'PlatformCreate',
                  query: {
                    category: row.category.value,
                    type: row.type.value,
                    clone_from: row.id
                  }
                }
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
            this.$router.push({
              name: 'PlatformCreate',
              query: { type: item.name, category: item.category }
            })
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
  deactivated() {
    window.localStorage.setItem('lastTab', this.tab.activeMenu)
  },
  activated() {
    setTimeout(() => {
      this.tab.activeMenu = window.localStorage.getItem('lastTab') || 'host'
      this.$refs.genericListTable.reloadTable()
    }, 300)
  },
  async mounted() {
    try {
      await this.setCategoriesTab()
    } finally {
      this.loading = false
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
      this.headerActions.moreCreates.dropdown = this.$store.state.assets.assetCategoriesDropdown.filter(item => {
        return item.category === this.tab.activeMenu
      })
    },
    async setCategoriesTab() {
      const categoryIcon = {
        host: 'fa-inbox',
        device: 'fa-microchip',
        database: 'fa-database',
        cloud: 'fa-cloud',
        web: 'fa-globe',
        gpt: 'fa-comment',
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
