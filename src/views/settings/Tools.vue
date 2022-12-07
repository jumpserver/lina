<template>
  <Page v-bind="$attrs">
    <IBox>
      <el-form ref="testForm" label-width="20%" :model="testData" :rules="testRules">
        <el-form-item :label="$t('setting.basicTools')">
          <el-radio-group v-model="testData.tool_type" @change="changeToolType">
            <el-radio v-for="t in tools" :key="t" :label="t" />
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('setting.destinationIP')" prop="dest_addr">
          <el-input v-model="testData.dest_addr" :placeholder="$t('setting.destinationIP')" />
        </el-form-item>
        <el-form-item v-if="testData.tool_type=='Telnet'" :label="$t('setting.testPort')" prop="port_num">
          <el-input v-model="testData.port_num" :placeholder="$t('setting.testPort')" />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="small"
            :loading="isTesting"
            @click="submitTest"
          >
            {{ $t('setting.testTools') }}
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="testResp"
            type="textarea"
            :readonly="true"
            :rows="8"
            :placeholder="$t('setting.testHelpText')"
          />
        </el-form-item>
      </el-form>
    </IBox>
  </Page>
</template>

<script>
import { IBox } from '@/components'
import { Page } from '@/layout/components'
import rules from '@/components/DataForm/rules'

export default {
  name: 'Tools',
  components: {
    IBox,
    Page
  },
  data() {
    return {
      testRules: {
        dest_addr: rules.Required,
        port_num: rules.Required
      },
      isTesting: false,
      ws: null,
      tools: ['Ping', 'Telnet'],
      testData: {
        dest_addr: '',
        port_num: '',
        tool_type: 'Ping'
      },
      testResp: ''
    }
  },
  methods: {
    changeToolType() {
      this.testResp = ''
    },
    enableWS() {
      this.testResp = ''
      const scheme = document.location.protocol === 'https:' ? 'wss' : 'ws'
      const port = document.location.port ? ':' + document.location.port : ''
      const url = '/ws/setting/tools/'
      const wsURL = scheme + '://' + document.location.hostname + port + url
      this.ws = new WebSocket(wsURL)
      this.setWsCallback()
    },
    setWsCallback() {
      this.ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        this.testResp += data.msg
      }
      this.ws.onopen = (e) => {
        this.$log.debug('websocket connected: ', e)
        this.ws.send(JSON.stringify(this.testData))
        this.isTesting = true
      }
      this.ws.onerror = (e) => {
        this.isTesting = false
      }
      this.ws.onclose = (e) => {
        this.isTesting = false
      }
    },
    submitTest() {
      this.$refs['testForm'].validate((valid) => {
        if (valid) {
          this.enableWS()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-form {
  &>>> .el-form-item {
    margin-bottom: 12px;
  }
  &>>> .el-form-item__content {
    width: 75%;
  }
  &>>> .el-form-item__label {
    padding: 0 30px 0 0;
  }
  &>>> .el-form-item__error {
    position: inherit;
  }
}
</style>
