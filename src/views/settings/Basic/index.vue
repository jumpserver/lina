<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :url="url"
      :fields-meta="fieldsMeta"
      :update-success-next-route="successUrl"
      :create-success-next-route="successUrl"
      :submit-method="submitMethod"
      :has-detail-in-msg="false"
      :on-perform-success="onPerformSuccess"
      class="form"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'
import rules from '@/components/DataForm/rules'
import Announcement from './announcement'

export default {
  name: 'Basic',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    return {
      fields: [
        [
          this.$t('common.BasicInfo'), [
            'SITE_URL', 'USER_GUIDE_URL',
            'GLOBAL_ORG_DISPLAY_NAME'
          ]
        ],
        [
          this.$t('setting.Feature'), [
            'TICKETS_ENABLED', 'ANNOUNCEMENT_ENABLED'
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
      successUrl: { name: 'Settings', params: { activeMenu: 'Basic' }},
      url: '/api/v1/settings/setting/?category=basic'
    }
  },
  methods: {
    submitMethod() {
      return 'patch'
    },
    onPerformSuccess() {
      setTimeout(() => window.location.reload(), 500)
    }
  }
}
</script>

<style scoped>
.form >>> .form-buttons {
  padding-top: 30px;
}

</style>
