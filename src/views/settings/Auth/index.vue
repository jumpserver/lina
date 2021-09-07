<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" />
  </IBox>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import IBox from '@/components/IBox'
import CAS from './CAS'
import OIDC from './OIDC'
import Radius from './Radius'

export default {
  name: 'Auth',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    return {
      url: '/api/v1/settings/setting/?category=auth',
      defaultButton: false,
      fields: [
        [
          '集中认证', ['AUTH_CAS', 'AUTH_OPENID']
        ],
        [
          '其它认证', ['AUTH_RADIUS']
        ]
      ],
      fieldsMeta: {
        AUTH_CAS: {
          component: CAS
        },
        AUTH_OPENID: {
          component: OIDC
        },
        AUTH_RADIUS: {
          component: Radius
        }
      },
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
