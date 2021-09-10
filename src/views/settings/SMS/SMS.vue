<template>
  <BaseAuth :title="$t('setting.SMS')">
    <SMSAlibaba v-if="smsType === 'alibaba'" />
    <SMSTencent v-if="smsType === 'tencent'" />
  </BaseAuth>
</template>
<script>

import BaseAuth from './Base'
import SMSAlibaba from './SMSAlibaba'
import SMSTencent from './SMSTencent'

export default {
  name: 'SMS',
  components: {
    BaseAuth,
    SMSAlibaba,
    SMSTencent
  },
  props: {
    smsType: {
      type: String,
      default: 'alibaba'
    }
  }
}
</script>
