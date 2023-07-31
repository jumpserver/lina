<template>
  <IBox>
    <GenericCreateUpdateForm
      :initial="object"
      v-bind="$data"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { PhoneInput } from '@/components/Form/FormFields'
import { IBox } from '@/components'

export default {
  name: 'ProfileUpdate',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  props: {
    object: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      url: `/api/v1/users/profile/`,
      hasDetailInMsg: false,
      fields: [
        [this.$t('users.Account'), ['username', 'name', 'email']],
        [this.$t('common.Other'), ['phone', 'wechat']]
      ],
      fieldsMeta: {
        username: {
          disabled: true
        },
        name: {
          disabled: true
        },
        email: {
          disabled: true
        },
        phone: {
          component: PhoneInput
        }
      },
      submitMethod() {
        return 'patch'
      }
    }
  }
}
</script>

<style scoped>

</style>
