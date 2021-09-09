<template>
  <BaseAuth v-model="value" :title="$t('setting.SMS')">
    <IBox>
      <el-radio v-model="smsType" label="alibaba">阿里</el-radio>
      <el-radio v-model="smsType" label="tencent">腾讯</el-radio>
    </IBox>
    <SMSAlibaba v-if="smsType === 'alibaba'" />
    <SMSTencent v-if="smsType === 'tencent'" />
  </BaseAuth>
</template>
<script>

import BaseAuth from '../Auth/Base'
import { IBox } from '@/components'
import SMSAlibaba from './SMSAlibaba'
import SMSTencent from './SMSTencent'

export default {
  name: 'SMS',
  components: {
    BaseAuth,
    IBox,
    SMSAlibaba,
    SMSTencent
  },
  data() {
    return {
      smsType: 'alibaba'
    }
  },
  mounted() {
  },
  methods: {
  }
}
</script>
