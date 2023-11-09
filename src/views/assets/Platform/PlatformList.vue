<template>
  <div>
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
    <PlatformCreateUpdate :action="action" :category="category" :row="row" :type="type" :visible.sync="showDrawer" />
  </div>
</template>

<script>
import { GenericListTable, TabPage } from '@/layout/components'
import { ChoicesFormatter, ProtocolsFormatter } from '@/components/Table/TableFormatters'
import PlatformCreateUpdate from '@/views/assets/Platform/PlatformCreateUpdate.vue'

export default {
  components: {
    PlatformCreateUpdate,
    TabPage,
    GenericListTable
  },
  data() {
    const vm = this
    const url = '/api/v1/assets/platforms/'
    return {
      loading: true,
      showDrawer: false,
      category: '',
      type: '',
      action: 'create',
      row: {},
      tab: {
        submenu: [],
        activeMenu: 'host'
      },
      tableConfig: {
        url: url,
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
              onUpdate: ({ row }) => {
                this.category = row.category.value
                this.type = row.type.value
                this.action = 'update'
                this.row = row
                this.showDrawer = true
              },
              onClone: ({ row }) => {
                this.category = row.category.value
                this.type = row.type.value
                this.action = 'clone'
                this.row = row
                this.showDrawer = true
              }
            }
          }
        }
      },
      headerActions: {
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
            this.action = 'create'
            this.category = item.category
            this.type = item.name
            this.showDrawer = true
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
