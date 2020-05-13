<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { mapGetters } from 'vuex'
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/users/users/',
        columns: [
          'name', 'username', 'groups_display', 'role', 'source', 'is_valid', 'actions'
        ],
        columnsMeta: {
          source: {
            width: '100px'
          },
          role: {
            width: '100px'
          },
          groups_display: {
            width: '200px',
            showOverflowTooltip: true
          },
          actions: {
            hasDelete: this.currentOrgIsDefault(),
            extraActions: [
              {
                title: 'Remove',
                type: 'warning',
                has: !this.currentOrgIsDefault()
              }
            ]
          }
        }
      },
      headerActions: {
        extraMoreActions: [
          {
            name: 'disableSelected',
            title: this.$t('common.actions.disableSelected'),
            callback: () => {
              console.log('disableSelected')
            }
          },
          {
            name: 'activateSelected',
            title: this.$t('common.actions.activateSelected'),
            callback: () => {
              console.log('activateSelected')
            }
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'currentOrg'
    ])
  },
  methods: {
    currentOrgIsDefault() {
      console.log(this.currentOrg)
      return false
      // return this.currentOrg.id === 'DEFAULT'
    }
  }
}
</script>

<style lang="less" scoped>

</style>
