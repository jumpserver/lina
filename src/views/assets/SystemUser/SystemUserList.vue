<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :help-message="helpMessage" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { ActionsFormatter, DetailFormatter } from '@/components/ListTable/formatters'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/system-users/',
        columns: [
          {
            prop: 'name',
            label: this.$t('assets.Name'),
            sortable: 'custom',
            formatter: DetailFormatter,
            showOverflowTooltip: true
          },
          {
            prop: 'username',
            label: this.$t('assets.Username')
          },
          {
            prop: 'protocol',
            label: this.$t('assets.Protocol'),
            width: '100px',
            'column-key': `protocol`,
            filters: [
              {
                'value': 'ssh',
                'text': 'ssh'
              }, {
                'value': 'rdp',
                'text': 'rdp'
              }, {
                'value': 'telnet',
                'text': 'telnet'
              }, {
                'value': 'vnc',
                'text': 'vnc'
              }, {
                'value': 'mysql',
                'text': 'mysql'
              }, {
                'value': 'oracle',
                'text': 'oracle'
              }, {
                'value': 'mariadb',
                'text': 'mariadb'
              }, {
                'value': 'postgresql',
                'text': 'postgresql'
              }, {
                'value': 'k8s',
                'text': 'k8s'
              }]
          },
          {
            prop: 'login_mode',
            label: this.$t('assets.LoginModel'),
            sortable: 'custom',
            width: '120px'
          },
          {
            prop: 'assets_amount',
            label: this.$t('setting.AssetCount'),
            width: '80px'
          },
          {
            prop: 'comment',
            label: this.$t('assets.Comment')
          },
          {
            prop: 'actions',
            label: this.$t('common.Actions'),
            align: 'center',
            width: '150px',
            formatter: ActionsFormatter,
            formatterArgs: {
              hasClone: true
            }
          }
        ]
      },
      headerActions: {
        hasMoreActions: false,
        hasColumnSetting: true,
        defaultColumn: ['name', 'username', 'protocol', 'assets_amount', 'comment', 'actions'],
        createRoute: 'SystemUserCreate'
      },
      helpMessage: this.$t('assets.SystemUserListHelpMessage')
    }
  }
}
</script>

<style>

</style>
