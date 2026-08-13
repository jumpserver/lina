<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="config" @submitSuccess="submitSuccess" />
  </IBox>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import { IBox } from '@/components'

export default {
  name: 'VirtualApp',
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
        fields: ['VIRTUAL_APP_ENABLED', 'PANDA_HOST'],
        fieldsMeta: {
          PANDA_HOST: {
            label: 'Panda URL',
            helpTip: this.$t('PandaURLTip')
          }
        },
        successUrl: { name: 'Settings', params: { activeMenu: 'Basic' } },
        url: '/api/v1/settings/setting/?category=virtualapp',
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
