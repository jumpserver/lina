<template>
  <TwoCol>
    <template>
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </template>
    <template #right>
      <QuickActions :actions="quickActions" type="primary" />
    </template>
  </TwoCol>
</template>

<script lang="jsx">
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import { QuickActions } from '@/components'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'Detail',
  components: {
    TwoCol,
    AutoDetailCard,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      quickActions: [
        {
          title: this.$t('PrivilegedTemplate'),
          type: 'switch',
          attrs: {
            model: this.object?.privileged,
            disabled: !this.$hasPerm('accounts.change_accounttemplate')
          },
          callbacks: {
            change: function(val) {
              this.$axios.patch(
                `/api/v1/accounts/account-templates/${this.object.id}/`,
                { privileged: val }
              ).then(res => {
                this.$message.success(this.$tc('UpdateSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$tc('UpdateErrorMsg' + ' ' + err))
              })
            }.bind(this)
          }
        }
      ],
      url: `/api/v1/accounts/account-templates/${this.object.id}/`,
      excludes: ['privileged', 'secret', 'passphrase', 'spec_info'],
      detailFields: [
        'id', 'name', 'username', 'secret_type', 'auto_push',
        'secret_strategy', 'created_by', 'comment',
        {
          key: this.$t('SuFrom'),
          formatter: () => {
            const su_from = this.object.su_from
            if (!su_from) return <span>-</span>
            return <span>{su_from.name}({su_from.username})</span>
          }
        },
        'is_active', 'date_created', 'date_updated'
      ]
    }
  },
  computed: {}
}
</script>

<style scoped>

</style>
