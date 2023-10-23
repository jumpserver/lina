<template>
  <GenericCreateUpdateDrawer v-bind="$data" />
</template>

<script>
import GenericCreateUpdateDrawer from '@/layout/components/GenericCreateUpdateDrawer'
import { templateFields, templateFieldsMeta } from './const.js'
import { encryptPassword } from '@/utils/crypto'

export default {
  name: 'GatewayCreateUpdate',
  components: {
    GenericCreateUpdateDrawer
  },
  data() {
    const vm = this
    return {
      initial: {
        secret_type: 'password',
        push_params: { }
      },
      url: '/api/v1/accounts/account-templates/',
      hasDetailInMsg: false,
      fields: [
        ...templateFields(vm)
      ],
      fieldsMeta: {
        ...templateFieldsMeta(vm)
      },
      cleanFormValue(value) {
        Object.keys(value).forEach((item, index, arr) => {
          if (['ssh_key', 'token', 'access_key', 'api_key'].includes(item)) {
            value['secret'] = value[item]
            delete value[item]
          }
        })
        value['secret'] = encryptPassword(value['secret'])
        return value
      },
      createSuccessNextRoute: { name: 'AccountTemplateList' },
      updateSuccessNextRoute: { name: 'AccountTemplateList' }
    }
  }
}
</script>

<style>

</style>
