<template>
  <IBox>
    <el-form ref="testForm" :model="testData" :rules="rules" label-width="15%">
      <div v-for="field in safeFields" :key="field.name">
        <div v-if="Array.isArray(field)">
          <el-form-item label-width="8%">
            <el-col v-for="item in field" :key="item.name" :span="getSpan(field)">
              <el-form-item :label="item.label" :prop="item.name" label-width="80px">
                <template #label>
                  {{ item.label }}
                  <el-tooltip v-if="item.tip" :content="item.tip" :open-delay="500" placement="top">
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
              <el-tooltip v-if="field.tip" :content="field.tip" :open-delay="500" placement="top">
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
        <Term ref="xterm" :xterm-config="xtermConfig" style="border: solid 1px #dddddd" />
      </el-form-item>
      <el-form-item>
        <el-button v-if="!isTesting" size="small" type="primary" @click="submitTest">
          <i class="fa fa-play" style="margin-right: 4px" />{{ $t('Test') }}
        </el-button>
        <el-button v-if="hasStop && isTesting" size="small" type="danger" @click="interruptTest">
          <i class="fa fa-stop" style="margin-right: 4px" />{{ $t('Stop') }}
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
/*
 * 本表单为原生 el-form（非 DataForm）。统一为与 DataForm / profile 信息更改一致的单层边框方案：
 * 边框只画在 .el-input__wrapper / .el-select__wrapper 上（关掉 EP 的 inset box-shadow、改用真实
 * 1px border），内部 .el-input__inner 彻底去边框，避免 wrapper 与 inner 各描一层形成 border 套 border。
 * 整体高度 30px / 内部 28px，与表单标准统一。
 *
 * 注意：TagInput 的 .filter-field 自带单层容器边框，必须排除在 wrapper 描边规则之外，否则双层。
 */
:deep(.el-form-item) {
  // FormItem 间距统一 20px
  margin-bottom: 20px;

  // 标签与 30px 高的输入框垂直居中对齐（覆盖全局 line-height: 32px 造成的错位）
  .el-form-item__label {
    height: 30px;
    line-height: 30px;
    display: inline-flex;
    align-items: center;
  }

  // 内部嵌套的 el-form-item（数组字段的 el-col 组合）不再叠加底部间距
  .el-form-item {
    margin-bottom: 0;
  }
}

:deep(.el-form-item__content) {
  // 普通输入框 / 下拉框：单层 wrapper 边框
  .el-input:not(.filter-field .el-input),
  .el-select {
    --el-input-height: 30px;
  }

  .el-input:not(.filter-field .el-input) .el-input__wrapper,
  .el-select__wrapper {
    min-height: 30px;
    height: 30px;
    border-radius: 0;
    box-shadow: none !important;
    border: 1px solid var(--el-border-color);

    &:hover {
      border-color: var(--el-border-color-hover);
    }

    &.is-focus,
    &.is-focused {
      border-color: var(--el-color-primary);
    }
  }

  // 内部 inner 去除自身边框 / box-shadow，仅保留 28px 高度
  .el-input:not(.filter-field .el-input) .el-input__inner {
    height: 28px;
    line-height: 28px;
    border: 0 !important;
    box-shadow: none !important;
  }

  // TagInput 自带容器边框，内部 input 不再描边
  .filter-field .el-input__inner {
    height: 28px;
  }
}
</style>
