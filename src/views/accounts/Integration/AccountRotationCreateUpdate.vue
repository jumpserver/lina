<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { Select2 } from '@/components/Form/FormFields'
import { GenericCreateUpdatePage } from '@/layout/components'

const accountOption = (item) => {
  const asset = item.asset || {}
  const account = item.name || item.username
  const assetLabel = asset.name ? `${asset.name} (${asset.address || '-'}) - ` : ''
  return {
    label: `${assetLabel}${account} (${item.username})`,
    value: item.id
  }
}

const accountField = (label) => ({
  label,
  component: Select2,
  el: {
    url: '/api/v1/accounts/accounts/?fields_size=small',
    multiple: false,
    ajax: {
      transformOption: accountOption
    }
  }
})

export default {
  name: 'AccountRotationCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      url: '/api/v1/accounts/credential-policies/',
      fields: [
        [this.$t('Basic'), ['name', 'primary_account', 'backup_account']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        name: {
          label: this.$t('RotationPurpose')
        },
        primary_account: accountField(this.$t('PrimaryAccount')),
        backup_account: accountField(this.$t('BackupAccount')),
        is_active: {
          label: this.$t('IsActive')
        }
      },
      hasSaveContinue: false,
      objectDetailRoute: { name: 'CredentialPolicyDetail' },
      getNextRoute: () => ({
        name: 'IntegrationApplicationList',
        query: { tab: 'rotations' }
      })
    }
  }
}
</script>
