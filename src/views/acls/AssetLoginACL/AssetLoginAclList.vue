<template>
  <GenericListPage
    :header-actions="headerActions"
    :help-tip="helpMsg"
    :table-config="tableConfig"
  />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      helpMsg: this.$t('AssetLoginACLHelpMsg'),
      tableConfig: {
        url: '/api/v1/acls/login-asset-acls/',
        columnOrder: 'configured',
        columns: [
          'id',
          'name',
          'priority',
          'action',
          'notice_enabled',
          'recipients',
          'reason_enabled',
          'mfa_enabled',
          'face_verify_enabled',
          'review_enabled',
          'reviewers',
          'review_duration',
          'push_account_enabled',
          'face_online_enabled',
          'change_secret_enabled',
          'is_active',
          'comment',
          'date_created',
          'date_updated',
          'created_by',
          'org_name',
          'org_id',
          'actions'
        ],
        columnsExclude: ['users', 'assets', 'accounts', 'rules'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'priority', 'is_active', 'comment', 'actions']
        },
        columnsMeta: Object.fromEntries(
          [
            'reason',
            'mfa',
            'review',
            'notice',
            'face_verify',
            'face_online',
            'push_account',
            'change_secret'
          ].map((field) => [
            `${field}_enabled`,
            { formatterArgs: { showText: false, showFalse: false } }
          ])
        )
      },
      updateRoute: 'AssetACLUpdate',
      headerActions: {
        createRoute: 'AssetACLCreate',
        hasRefresh: true,
        hasExport: false,
        hasImport: false
      }
    }
  }
}
</script>
