<template>
  <IBox>
    <el-form ref="testForm" :model="testData" :rules="rules" label-width="15%">
      <div v-for="field in fields" :key="field.name">
        <div v-if="Array.isArray(field)">
          <el-form-item label-width="8%">
            <el-col v-for="item in field" :key="item.name" :span="getSpan(field)">
              <el-form-item :label="item.label" :prop="item.name" label-width="80px">
                <template #label>
                  {{ item.label }}
                  <el-tooltip v-if="item.tip" :content="item.tip" placement="top">
                    <i class="fa fa-question-circle-o" />
                  </el-tooltip>
                </template>
                <component
                  :is="item.component ? item.component : 'el-input'"
                  v-model="testData[item.name]"
                  :value="testData[item.name]"
                  v-bind="item.el"
                  @change="onChange(item.name, $event)"
                />
              </el-form-item>
            </el-col>
          </el-form-item>
        </div>
        <div v-else>
          <el-form-item :label="field.label" :prop="field.name">
            <template #label>
              {{ field.label }}
              <el-tooltip v-if="field.tip" :content="field.tip" placement="top">
                <i class="fa fa-question-circle-o" />
              </el-tooltip>
            </template>
            <component
              :is="field.component ? field.component : 'el-input'"
              v-model="testData[field.name]"
              :value="testData[field.name]"
              v-bind="field.el"
              @change="onChange(field.name, $event)"
            />
          </el-form-item>
        </div>
      </div>
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
          {{ $t('common.Test') }}
        </el-button>
        <el-button
          v-if="hasStop"
          :disabled="!isTesting"
          size="mini"
          type="danger"
          @click="interruptTest"
        >
          {{ $t('common.Stop') }}
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
    hasStop: {
      type: Boolean,
      default: () => { return true }
    },
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
      return this.$refs.xterm
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
      this.xterm.reset()
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
    onChange(key, val) {
      this.testData[key] = val
    },
    submitTest() {
      this.$refs['testForm'].validate((valid) => {
        if (valid) {
          this.enableWS()
        }
      })
    },
    interruptTest() {
      this.ws.close()
      this.isTesting = false
    },
    getSpan(fields) {
      const span = 24 / fields.length
      return span >= 12 ? span : 12
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-field >>> .el-input__inner {
  height: 30px;
}
</style>
