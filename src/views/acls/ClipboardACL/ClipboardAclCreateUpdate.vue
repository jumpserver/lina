<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import rules from '@/components/Form/DataForm/rules'
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { assetJSONSelectMeta } from '@/views/assets/const'
import AccountFormatter from '@/views/perms/AssetPermission/components/AccountFormatter.vue'
import { userJSONSelectMeta } from '@/views/users/const'
import OperationsCheckbox from './components/OperationsCheckbox.vue'
import {
  filterClipboardOperations,
  getClipboardOperationOptions,
  normalizeClipboardOperationValues
} from './const'

export default {
  name: 'ClipboardAclCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        action: 'accept',
        accounts: ['@ALL'],
        operations: ['copy', 'paste'],
        copy_text_limit: 0,
        paste_text_limit: 0,
        download_file_size_limit: 0,
        upload_file_size_limit: 0
      },
      fields: [
        [this.$t('Basic'), ['name', 'priority']],
        [this.$t('Users'), ['users']],
        [this.$t('Asset'), ['assets']],
        [this.$t('Accounts'), ['accounts']],
        [this.$t('Clipboard'), ['operations']],
        [
          this.$t('Limit'),
          [
            'copy_text_limit',
            'paste_text_limit',
            'download_file_size_limit',
            'upload_file_size_limit'
          ]
        ],
        [this.$t('Action'), ['action']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        priority: {
          rules: [rules.Required]
        },
        assets: assetJSONSelectMeta(this),
        users: userJSONSelectMeta(this),
        accounts: {
          component: AccountFormatter,
          el: {
            showAddTemplate: false,
            enableVirtualAccount: false,
            value: ['@ALL'],
            assets: []
          },
          hidden: (formValue) => {
            const ids = formValue.assets?.ids
            this.fieldsMeta.accounts.el.assets = ids || []
          }
        },
        operations: {
          type: '',
          component: OperationsCheckbox,
          options: getClipboardOperationOptions(this),
          rules: [rules.RequiredChange]
        },
        action: {
          type: 'radio-group',
          options: [
            { label: this.$t('Accept'), value: 'accept' },
            { label: this.$t('Reject'), value: 'reject' }
          ]
        },
        copy_text_limit: {
          helpTip: this.$t('ClipboardCopyTextLimitHelpTip')
        },
        paste_text_limit: {
          helpTip: this.$t('ClipboardPasteTextLimitHelpTip')
        },
        download_file_size_limit: {
          helpTip: this.$t('ClipboardDownloadFileSizeLimitHelpTip')
        },
        upload_file_size_limit: {
          helpTip: this.$t('ClipboardUploadFileSizeLimitHelpTip')
        },
        is_active: {
          type: 'checkbox'
        }
      },
      url: '/api/v1/acls/clipboard-acls/',
      createSuccessNextRoute: { name: 'ClipboardACLList' },
      updateSuccessNextRoute: { name: 'ClipboardACLList' },
      objectDetailRoute: { name: 'ClipboardACLDetail' },
      afterGetFormValue(value) {
        return {
          ...value,
          operations: normalizeClipboardOperationValues(value.operations)
        }
      },
      cleanFormValue(value) {
        return {
          ...value,
          operations: normalizeClipboardOperationValues(value.operations)
        }
      },
      afterGetRemoteMeta(meta) {
        if (meta.operations) {
          meta.operations.type = 'multiple choice'
          meta.operations.choices = filterClipboardOperations(meta.operations.choices, this)
        }
        return meta
      },
      getNextRoute(res, method) {
        return method === 'post' ? this.createSuccessNextRoute : this.updateSuccessNextRoute
      }
    }
  }
}
</script>
