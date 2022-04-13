<template>
  <div>
    <el-alert v-if="helpMessage" type="success">
      <span v-html="helpMessage" />
    </el-alert>
    <GenericListTable :table-config="tableConfig" :header-actions="headerActions" :help-message="helpMessage" />
  </div>
</template>

<script>
import { GenericListTable } from '@/layout/components'
import { ApplicationSystemUserTypes } from '@/views/applications/const'
import { AssetProtocols } from '@/views/assets/const'

export default {
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/assets/system-users/?type=common',
        columns: [
          'name', 'username', 'username_same_with_user', 'protocol', 'login_mode',
          'assets_amount', 'applications_amount', 'priority',
          'created_by', 'date_created', 'date_updated', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'username', 'protocol', 'login_mode', 'assets_amount', 'applications_amount', 'comment', 'actions'
          ]
        },
        columnsMeta: {
          username: {
            showOverflowTooltip: true
          },
          protocol: {
            width: '100px'
          },
          username_same_with_user: {
            width: '150px',
            formatterArgs: {
              showFalse: false
            }
          },
          login_mode: {
            width: '120px'
          },
          assets_amount: {
            width: '80px'
          },
          applications_amount: {
            width: '80px'
          },
          actions: {
            formatterArgs: {
              onUpdate: ({ row }) => {
                vm.$router.push({ name: 'SystemUserUpdate', params: { id: row.id }, query: { protocol: row.protocol }})
              },
              onClone: ({ row }) => {
                vm.$router.push({ name: 'SystemUserCreate', query: { protocol: row.protocol, clone_from: row.id }})
              }
            }
          }
        }
      },
      headerActions: {
        hasCreate: false,
        createRoute: 'SystemUserCreate',
        searchConfig: {
          exclude: ['type', 'protocol']
        },
        moreCreates: {
          callback: (option) => {
            vm.$router.push({ name: 'SystemUserCreate', query: { protocol: option.name.toLowerCase() }})
          },
          dropdown: [
            ...AssetProtocols,
            ...ApplicationSystemUserTypes
          ]
        }
      },
      helpMessage: this.$t('assets.SystemUserListHelpMessage')
    }
  }
}
</script>

<style>

</style>
