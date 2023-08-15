<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="config" @submitSuccess="submitSuccess" />
  </IBox>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import { IBox } from '@/components'

export default {
  name: 'Ops',
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
          [this.$t('common.Basic'), [
            'SECURITY_COMMAND_EXECUTION', 'SECURITY_COMMAND_BLACKLIST'
          ]]
        ],
        fieldsMeta: {
        },
        successUrl: { name: 'Settings', params: { activeMenu: 'Basic' }},
        url: '/api/v1/settings/setting/?category=ops',
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
