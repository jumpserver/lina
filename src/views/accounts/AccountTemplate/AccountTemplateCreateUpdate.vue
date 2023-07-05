<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { templateFields, templateFieldsMeta } from './const.js'
import { encryptPassword } from '@/utils/crypto'

export default {
  name: 'GatewayCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    return {
      initial: { secret_type: 'password' },
      url: '/api/v1/accounts/account-templates/',
      hasDetailInMsg: false,
      fields: [
        ...templateFields(this)
      ],
      fieldsMeta: {
        ...templateFieldsMeta(this)
      },
      afterGetFormValue(value) {
        vm.fieldsMeta['push_params'].el.platforms = value['platforms']
        return value
      },
      cleanFormValue(value) {
        Object.keys(value).forEach((item, index, arr) => {
          if (['ssh_key', 'token', 'access_key'].includes(item)) {
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
