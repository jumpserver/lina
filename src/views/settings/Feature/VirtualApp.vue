<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="config" @submitSuccess="submitSuccess" />
  </IBox>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import { IBox } from '@/components'
import AddressInput from '@/components/Form/FormFields/AddressInput'
import { isValidAddress, ADDRESS_KINDS } from '@/utils/addressType'
import i18n from '@/i18n/i18n'

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
            component: AddressInput,
            el: {
              kinds: ADDRESS_KINDS.url
            },
            helpTip: this.$t('PandaURLTip'),
            rules: [
              {
                validator: (rule, value, callback) => {
                  value = value?.trim()
                  if (!value) return callback()
                  if (isValidAddress(value, ADDRESS_KINDS.url)) {
                    callback()
                  } else {
                    callback(new Error(i18n.t('InvalidAddress')))
                  }
                },
                trigger: ['blur', 'change']
              }
            ]
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
