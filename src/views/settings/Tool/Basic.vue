<template>
  <IBox>
    <GenericCreateUpdateForm
      :has-detail-in-msg="false"
      :submit-method="submitMethod"
      v-bind="$data"
    />
  </IBox>
</template>

<script>
import { IBox } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'

export default {
  name: 'Basic',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    return {
      fields: ['TOOL_USER_ENABLED'],
      url: '/api/v1/settings/setting/?category=tool'
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
