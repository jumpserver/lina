<template>
  <TabPage :active-menu.sync="tab.activeMenu" :submenu="tab.submenu" @tab-click="changeMoreCreates">
    <keep-alive>
      <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
    </keep-alive>
  </TabPage>
</template>

<script>
import { GenericListTable, TabPage } from '@/layout/components'
import { ChoicesDisplayFormatter } from '@/components/TableFormatters'
import { Categories } from '@/views/assets/const'

export default {
  components: {
    TabPage,
    GenericListTable
  },
  data() {
    const vm = this
    return {
      show: true,
      tab: {
        submenu: Categories,
        activeMenu: 'host'
      },
      tableConfig: {
        url: '/api/v1/assets/platforms/',
        columns: [
          'name', 'category', 'type',
          'comment', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'category', 'type', 'actions']
        },
        columnsMeta: {
          type: {
            formatter: ChoicesDisplayFormatter
          },
          category: {
            formatter: ChoicesDisplayFormatter
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
        hasMoreActions: false,
        hasBulkDelete: false,
        createRoute: 'PlatformCreate',
        canCreate: () => {
          return this.$hasPerm('assets.add_platform')
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
      categoriesDropdown: this.$store.state.assets.assetCategoriesDropdown
    }
  },
  computed: {
    url() {
      return `/api/v1/assets/platforms/?category=${this.tab.activeMenu}`
    }
  },
  mounted() {
    this.changeMoreCreates()
  },
  methods: {
    changeMoreCreates() {
      this.tableConfig.url = this.url
      this.headerActions.moreCreates.dropdown = this.categoriesDropdown.filter(item => {
        return item.category === this.tab.activeMenu
      })
    }
  }
}
</script>

<style>

</style>
