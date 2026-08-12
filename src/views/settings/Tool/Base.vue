<template>
  <IBox>
    <el-form ref="testForm" class="tool-form" :model="testData" :rules="rules" label-width="15%">
      <div v-for="field in safeFields" :key="field.name">
        <div v-if="Array.isArray(field)">
          <el-form-item label-width="8%">
            <el-col v-for="item in field" :key="item.name" :span="getSpan(field)">
              <el-form-item :label="item.label" :prop="item.name" label-width="80px">
                <template #label>
                  {{ item.label }}
                  <el-tooltip v-if="item.tip" :content="item.tip" :show-after="500" placement="top">
                    <i class="fa fa-question-circle-o" />
                  </el-tooltip>
                </template>
                <component
                  v-bind="item.el"
                  :is="item.component ? item.component : 'el-input'"
                  v-model="testData[item.name]"
                  :value="testData[item.name]"
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
              <el-tooltip v-if="field.tip" :content="field.tip" :show-after="500" placement="top">
                <i class="fa fa-question-circle-o" />
              </el-tooltip>
            </template>
            <component
              v-bind="field.el"
              :is="field.component ? field.component : 'el-input'"
              v-model="testData[field.name]"
              :value="testData[field.name]"
              @change="onChange(field.name, $event)"
            />
          </el-form-item>
        </div>
      </div>
      <el-form-item :label="$tc('Output')">
        <Term
          ref="xterm"
          class="tool-output"
          :xterm-config="xtermConfig"
          style="border: solid 1px #dddddd"
        />
      </el-form-item>
      <el-form-item class="tool-actions">
        <el-button v-if="!isTesting" size="small" type="primary" @click="submitTest">
          <i class="fa fa-solid fa-play" style="margin-right: 4px" />{{ $t('Test') }}
        </el-button>
        <el-button v-if="hasStop && isTesting" size="small" type="danger" @click="interruptTest">
          <i class="fa fa-solid fa-stop" style="margin-right: 4px" />{{ $t('Stop') }}
        </el-button>
      </el-form-item>
    </el-form>
  </IBox>
</template>

<script>
import { markRaw, toRaw } from 'vue'
import { IBox } from '@/components'
import { Select2, TagInput } from '@/components/Form/FormFields'
import Term from '@/components/Widgets/Term'

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
      default: () => {
        return true
      }
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
    safeFields() {
      function mark(fields) {
        if (!Array.isArray(fields)) return fields
        return fields.map((f) => {
          if (Array.isArray(f)) return mark(f)
          if (f && f.component && typeof f.component !== 'string') {
            return { ...f, component: markRaw(toRaw(f.component)) }
          }
          return f
        })
      }
      return mark(this.fields)
    },
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
        this.xterm.write(this.$tc('WebSocketDisconnect'))
        this.isTesting = false
      }
      this.ws.onclose = (e) => {
        this.xterm.write(this.$tc('TaskDone'))
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
:deep(.tool-form) {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

:deep(.tool-form > .el-form-item),
:deep(.tool-form > div > .el-form-item) {
  // 由容器 gap 统一管理字段间距，避免被全局 el-form 规则覆盖或叠加。
  margin-bottom: 0 !important;
}

:deep(.tool-form .el-form-item__label) {
  height: 30px;
  line-height: 30px;
  display: inline-flex;
  align-items: center;
}

:deep(.tool-form .el-form-item .el-form-item) {
  margin-bottom: 0;
}

:deep(.tool-form > .tool-actions .el-form-item__content) {
  // 小尺寸按钮默认按 30px 行高基线居中，会让可见边框比其它控件多出约 5px 间隙。
  align-items: flex-start;
  line-height: normal;
}

:deep(.tool-output) {
  width: 100%;
  min-width: 0;
}
</style>
