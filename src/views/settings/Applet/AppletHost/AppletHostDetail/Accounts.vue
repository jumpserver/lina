<template>
  <TwoCol>
    <template #default>
      <Account :url="url" :columns-meta="columnsMeta" :object="object" />
    </template>
    <template #right>
      <QuickActions :actions="quickActions" type="primary" />
    </template>
  </TwoCol>
</template>

<script>
import { createVNode as createVNodeCompat } from 'vue'
import { QuickActions } from '@/components'
import Account from '@/views/assets/Asset/AssetDetail/Account'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
export default {
  name: 'Accounts',
  components: {
    TwoCol,
    Account,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      columnsMeta: {
        name: {
          formatter: (row) => createVNodeCompat('span', null, [row.name])
        },
        asset: {
          label: this.$t('Asset'),
          formatter: (row) => createVNodeCompat('span', null, [row.asset.name])
        }
      },
      quickActions: [
        {
          title: this.$t('GenerateAccounts'),
          attrs: {
            type: 'primary',
            label: this.$t('Generate')
          },
          callbacks: {
            click: function () {
              this.$axios
                .put(`/api/v1/terminal/applet-hosts/${this.object.id}/generate-accounts/`)
                .then((res) => {
                  this.$message.success(this.$tc('GenerateSuccessMsg'))
                })
            }.bind(this)
          }
        }
      ]
    }
  }
}
</script>
