<template>
  <TabPage
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
import { ChoicesFormatter } from '@/components/TableFormatters'

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
        submenu: [
          {
            name: 'host',
            title: this.$t('assets.Host'),
            icon: 'fa-inbox'
          },
          {
            name: 'device',
            title: this.$t('assets.Device'),
            icon: 'fa-microchip'
          },
          {
            name: 'database',
            title: this.$t('assets.Database'),
            icon: 'fa-database'
          },
          {
            name: 'cloud',
            title: this.$t('assets.Cloud'),
            icon: 'fa-cloud'
          },
          {
            name: 'web',
            title: this.$t('assets.Web'),
            icon: 'fa-globe'
          }
        ],
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
        hasRightActions: true,
        createRoute: 'PlatformCreate',
        canCreate: () => {
          return this.$hasPerm('assets.add_platform')
        },
        handleImportClick: ({ selectedRows }) => {
          this.$eventBus.$emit('showImportDialog', {
            selectedRows,
            url: '/api/v1/assets/platforms/',
            name: this?.name
          })
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
  updated() {
    this.changeMoreCreates()
  },
  methods: {
    changeMoreCreates() {
      this.tableConfig.url = this.url
      this.headerActions.moreCreates.dropdown = this.$store.state.assets.assetCategoriesDropdown.filter(item => {
        return item.category === this.tab.activeMenu
      })
    }
  }
}
</script>

<style>

</style>
