<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :update-success-next-route="successUrl"
    :create-success-next-route="successUrl"
    :has-detail-in-msg="false"
    :submit-method="submitMethod"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import rules from '@/components/DataForm/rules'
import Announcement from './announcement'

export default {
  name: 'Basic',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      fields: [
        [
          this.$t('common.BasicInfo'), [
            'SITE_URL', // 'USER_GUIDE_URL',
            'GLOBAL_ORG_DISPLAY_NAME'
          ]
        ],
        [
          this.$t('setting.Feature'), [
            'TICKETS_ENABLED',
            'ANNOUNCEMENT_ENABLED'
          ]
        ]
      ],
      fieldsMeta: {
        SITE_URL: {
          rules: [rules.Required]
        },
        GLOBAL_ORG_DISPLAY_NAME: {
          hidden: () => {
            return !this.$store.getters.hasValidLicense
          }
        },
        TICKETS_ENABLED: {
          hidden: () => {
            return !this.$store.getters.hasValidLicense
          }
        },
        ANNOUNCEMENT_ENABLED: {
          // label: '公告',
          component: Announcement
        }
      },
      successUrl: { name: 'Basic' },
      url: '/api/v1/settings/setting/?category=basic'
    }
  },
  methods: {
    submitMethod() {
      return 'patch'
    }
  }
}
</script>

<style scoped>
</style>
