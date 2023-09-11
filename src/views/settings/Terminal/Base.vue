<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" />
  </IBox>
</template>
<script>
import IBox from '@/components/IBox'
import { GenericCreateUpdateForm } from '@/layout/components'

export default {
  name: 'Terminal',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    const comp = this.$t('common.Component')
    return {
      fields: [
        [
          this.$t('common.Basic'),
          [
            'SECURITY_SERVICE_ACCOUNT_REGISTRATION'
          ]
        ],
        [
          `SSH ${comp}(KoKo)`,
          [
            'TERMINAL_KOKO_SSH_ENABLED',
            'TERMINAL_PASSWORD_AUTH', 'TERMINAL_PUBLIC_KEY_AUTH',
            'TERMINAL_ASSET_LIST_SORT_BY',
            'TERMINAL_ASSET_LIST_PAGE_SIZE'
          ]
        ],
        [
          `RDP ${comp}(Razor)`,
          [
            'TERMINAL_RAZOR_ENABLED'
          ]
        ],
        [
          `DB ${comp}(Magnus)`,
          [
            'TERMINAL_MAGNUS_ENABLED'
          ]
        ]
      ],
      fieldsMeta: {
        TERMINAL_KOKO_SSH_ENABLED: {
          helpText: this.$i18n.t('common.Info') + ': ' + this.$i18n.t('setting.EnableKoKoSSHHelpText')
        },
        TERMINAL_RAZOR_ENABLED: {
          helpText: this.$i18n.t('common.Info') + ': ' + this.$i18n.t('setting.SettingInEndpointHelpText'),
          hidden: () => {
            return !this.$store.getters.hasValidLicense
          },
          el: {
            hiddenGroup: true
          }
        },
        TERMINAL_MAGNUS_ENABLED: {
          helpText: this.$i18n.t('common.Info') + ': ' + this.$i18n.t('setting.SettingInEndpointHelpText')
        }
      },
      getUrl: () => '/api/v1/settings/setting/?category=terminal',
      hasDetailInMsg: false,
      submitMethod() {
        return 'put'
      },
      cleanFormValue(data) {
        Object.keys(data).forEach(
          function(key) {
            if (data[key] === null) {
              delete data[key]
            }
          }
        )
        return data
      }
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
