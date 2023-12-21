<template>
  <TabPage
    v-if="!loading"
    :active-menu.sync="tab.activeMenu"
    :submenu="tab.submenu"
    @tab-click="changeMoreCreates"
  >
    <keep-alive>
      <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
    </keep-alive>
  </TabPage>
</template>

<script>
import { GenericListTable, TabPage } from '@/layout/components'
import { ChoicesFormatter, ProtocolsFormatter } from '../../../components/Table/TableFormatters'

export default {
  components: {
    TabPage,
    GenericListTable
  },
  data() {
    const vm = this
    return {
      loading: true,
      tab: {
        submenu: [],
        activeMenu: 'host'
      },
      tableConfig: {
        url: '/api/v1/assets/platforms/',
        columnsExclude: ['automation'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'category', 'type', 'actions']
        },
        columnsMeta: {
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
            width: '100px',
            formatterArgs: {
              showFalse: false
            }
          },
          protocols: {
            showFullContent: true,
            formatter: ProtocolsFormatter
          },
          base: {
            width: '140px'
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
      }
    }
  },
  computed: {
    url() {
      return `/api/v1/assets/platforms/?category=${this.tab.activeMenu}`
    }
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
        custom: 'fa-th'
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

<style lang="scss" scoped>

</style>
