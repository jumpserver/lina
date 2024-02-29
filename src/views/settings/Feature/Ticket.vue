<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="config" @submitSuccess="submitSuccess" />
  </IBox>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import { IBox } from '@/components'

export default {
  name: 'Announcement',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  props: {
    value: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      visible: false,
      config: {
        fields: [
          [this.$t('common.Basic'), ['TICKETS_ENABLED', 'TICKETS_DIRECT_APPROVE']],
          [this.$t('perms.AssetPermission'), [
            'TICKET_AUTHORIZE_DEFAULT_TIME',
            'TICKET_AUTHORIZE_DEFAULT_TIME_UNIT'
          ]]
        ],
        fieldsMeta: {
        },
        successUrl: { name: 'Settings', params: { activeMenu: 'Basic' }},
        url: '/api/v1/settings/setting/?category=ticket',
        hasReset: false,
        submitMethod() {
          return 'patch'
        }
      }
    }
  },
  methods: {
    submitSuccess(res) {
      this.$emit('input', !!res[this.enableField])
      this.visible = false
    }
  }
}
</script>

<style scoped>

</style>
