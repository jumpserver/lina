<template>
  <div>
    <el-alert type="info">
      <b>{{ Tips.title }}</b>: <span>{{ Tips.body }}</span>
    </el-alert>
    <el-row :gutter="20">
      <el-col :md="20" :sm="24">
        <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
      </el-col>
      <el-col :md="4" :sm="24" />
    </el-row>
  </div>
</template>

<script>
import ListTable from '@/components/ListTable'

export default {
  name: 'SwitchToUserList',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      Tips: {
        title: this.$t('common.Info'),
        body: this.$t('assets.SwitchToUserListTips')
      },
      tableConfig: {
        url: `/api/v1/assets/system-users/${this.object.id}/su-to/`,
        columns: [
          'name', 'username', 'username_same_with_user', 'protocol', 'login_mode',
          'assets_amount', 'applications_amount', 'priority',
          'created_by', 'date_created', 'date_updated', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'username', 'protocol', 'login_mode', 'comment', 'actions'
          ]
        },
        columnsMeta: {
          actions: {
            formatterArgs: {
              updateRoute: { name: 'SystemUserUpdate', query: { id: this.$route.params.id }},
              hasUpdate: true, // can set function(row, value)
              hasDelete: false, // can set function(row, value)
              hasClone: false,
              moreActionsTitle: this.$t('common.More'),
              extraActions: [
              ]
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasBulkDelete: false,
        hasImport: false,
        hasCreate: false,
        searchConfig: {
          exclude: ['type', 'protocol']
        }
      }
    }
  },
  methods: {
  }
}
</script>

<style lang='less' scoped>

</style>
