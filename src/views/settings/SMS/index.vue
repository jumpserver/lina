<template>
  <div>
    <IBox>
      <el-radio v-model="smsType" label="alibaba">阿里</el-radio>
      <el-radio v-model="smsType" label="tencent">腾讯</el-radio>
    </IBox>
    <SMSAlibaba v-if="smsType === 'alibaba'" />
    <SMSTencent v-if="smsType === 'tencent'" />
  </div>
</template>
<script>

import { IBox } from '@/components'
import SMSAlibaba from './SMSAlibaba'
import SMSTencent from './SMSTencent'

export default {
  name: 'SMS',
  components: {
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
