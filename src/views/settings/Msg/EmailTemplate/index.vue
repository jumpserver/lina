<template>
  <div>
    <IBox>
      <GenericCreateUpdateForm
        :create-success-next-route="successUrl"
        :update-success-next-route="successUrl"
        v-bind="$data"
      />
    </IBox>
  </div>

</template>

<script>
import { IBox } from '@/components'
import { GenericCreateUpdateForm } from '@/layout/components'
import richEditor from '@/views/settings/Msg/Email/richEditor.vue'

export default {
  name: 'EmailTemplate',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    return {
      helpText: this.$t('EmailHelpText'),
      encryptedFields: ['EMAIL_HOST_PASSWORD'],
      fields: [
        [this.$t('Basic'), [
          'EMAIL_TEMPLATE_NAME',
          'EMAIL_TEMPLATE_CONTENT'
        ]
        ]
      ],
      fieldsMeta: {
        EMAIL_TEMPLATE_CONTENT: {
          component: richEditor
        }
      },
      successUrl: { name: 'Msg' },
      url: '/api/v1/settings/setting/?category=email_template',
      submitMethod() {
        return 'patch'
      }
    }
  },
  methods: {}

}
</script>

<style scoped>

</style>
