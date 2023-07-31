<template>
  <IBox>
    <el-form ref="testForm" :model="testData" :rules="rules" label-width="15%">
      <el-form-item v-for="f in fields" :key="f.name" :label="f.label" :prop="f.name">
        <Select2 v-if="f.options" v-model="testData[f.name]" :options="f.options" />
        <TagInput
          v-else-if="f.type === 'multiInput'"
          :value="testData[f.name]"
          @change="onTagInputChange(f.name, $event)"
        />
        <el-input v-else v-model="testData[f.name]" :placeholder="f.placeholder" :type="f.type" />
      </el-form-item>
      <el-form-item :label="$tc('ops.output')">
        <Term ref="xterm" :xterm-config="xtermConfig" style="border: solid 1px #dddddd" />
      </el-form-item>
      <el-form-item>
        <el-button
          :loading="isTesting"
          size="mini"
          type="primary"
          @click="submitTest"
        >
          {{ $t('setting.testTools') }}
        </el-button>
      </el-form-item>
    </el-form>
  </IBox>
</template>

<script>
import { IBox } from '@/components'
import Term from '@/components/Widgets/Term'
import { Select2, TagInput } from '@/components/Form/FormFields'

export default {
  name: 'Base',
  components: {
    IBox,
    Term,
    Select2,
    TagInput
  },
  props: {
    taskType: {
      type: String,
      required: true
    },
    rules: {
      type: Object,
      default: () => {}
    },
    fields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      xtermConfig: { rows: 10 },
      isTesting: false,
      ws: null,
      testData: {}
    }
  },
  computed: {
    xterm() {
      return this.$refs.xterm.xterm
    },
    iTestData() {
      return Object.assign({ tool_type: this.taskType }, this.testData)
    }
  },
  methods: {
    enableWS() {
      const scheme = document.location.protocol === 'https:' ? 'wss' : 'ws'
      const port = document.location.port ? ':' + document.location.port : ''
      const url = '/ws/setting/tools/'
      const wsURL = scheme + '://' + document.location.hostname + port + url
      this.xterm.clear()
      this.ws = new WebSocket(wsURL)
      this.setWsCallback()
    },
    setWsCallback() {
      this.ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        this.xterm.write(data.msg)
      }
      this.ws.onopen = (e) => {
        this.$log.debug('websocket connected: ', e)
        this.ws.send(JSON.stringify(this.iTestData))
        this.isTesting = true
      }
      this.ws.onerror = (e) => {
        this.xterm.write(this.$tc('common.WebSocketDisconnect'))
        this.isTesting = false
      }
      this.ws.onclose = (e) => {
        this.xterm.write(this.$tc('common.TaskDone'))
        this.isTesting = false
      }
    },
    onTagInputChange(key, val) {
      this.testData[key] = val
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
</style>
