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
    return {
      fields: [
        [
          this.$t('Basic'),
          [
            'SECURITY_SERVICE_ACCOUNT_REGISTRATION'
          ]
        ],
        [
          `SSH & KoKo`,
          [
            'TERMINAL_KOKO_SSH_ENABLED',
            'TERMINAL_PASSWORD_AUTH', 'TERMINAL_PUBLIC_KEY_AUTH',
            'TERMINAL_ASSET_LIST_SORT_BY',
            'TERMINAL_ASSET_LIST_PAGE_SIZE'
          ]
        ],
        [
          `RDP & Razor`,
          [
            'TERMINAL_RAZOR_ENABLED'
          ]
        ],
        [
          `DB & Magnus`,
          [
            'TERMINAL_MAGNUS_ENABLED'
          ]
        ]
      ],
      fieldsMeta: {
        TERMINAL_RAZOR_ENABLED: {
          hidden: () => {
            return !this.$store.getters.hasValidLicense
          },
          el: {
            hiddenGroup: true
          }
        },
        TERMINAL_MAGNUS_ENABLED: {
          hidden: () => {
            return !this.$store.getters.hasValidLicense
          },
          el: {
            hiddenGroup: true
          }
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
