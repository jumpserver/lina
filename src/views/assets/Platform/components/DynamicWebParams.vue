<template>
  <div class="dynamic-form-list">
    <div class="form-items-container">
      <transition-group name="form-item" tag="div" class="form-items">
        <div
          v-for="(item, index) in formItems"
          :key="item.id"
          class="form-item"
        >
          <div class="form-field main-selector">
            <label class="field-label">{{ $tc('Action') }}</label>
            <Select2
              v-model="item.action"
              :options="actionOptions"
              :multiple="false"
              :clearable="false"
              @change="onActionChange(index)"
            />
          </div>
          <div class="conditional-fields">
            <template v-if="item.action === 'click' || item.action === 'iframe' || item.action === 'input'">
              <div class="form-field">
                <label class="field-label">{{ $tc('Selector') }}</label>
                <el-input
                  v-model="item.config.selector"
                  :placeholder="$tc('SelectorPlaceholder')"
                  @input="onFieldChange(index)"
                />
              </div>
            </template>

            <template v-if="item.action === 'sleep'">
              <div class="form-field">
                <label class="field-label">{{ $tc('Sleep') }}</label>
                <el-input
                  v-model="item.config.value"
                  type="number"
                  :min="0"
                  @input="onFieldChange(index)"
                >
                  <template slot="append">s</template>
                </el-input>
              </div>
            </template>

            <template v-if="item.action === 'input'">
              <div class="form-field">
                <label class="field-label">{{ $tc('Value') }}</label>
                <Select2
                  v-model="item.config.value"
                  :options="valueOptions"
                  :multiple="false"
                  :clearable="false"
                  :allow-create="true"
                  @change="onFieldChange(index)"
                />
              </div>
            </template>

            <template v-if="item.action === 'check'">
              <div class="form-field">
                <label class="field-label">{{ $tc('Check') }}</label>
                <Select2
                  v-model="item.config.type"
                  :options="checkTypeOptions"
                  :multiple="false"
                  :clearable="false"
                  @change="onCheckTypeChange(index)"
                />
              </div>
              <div v-if="item.config && item.config.type" class="form-field">
                <label class="field-label">
                  {{ getCheckFieldLabel(item.config.type) }}
                </label>
                <el-input
                  v-if="item.config.type === 'wait_for_url'"
                  v-model="item.config.url"
                  :placeholder="$tc('Address')"
                  @input="onFieldChange"
                />
                <el-input
                  v-else-if="item.config.type === 'wait_for_selector'"
                  v-model="item.config.selector"
                  :placeholder="$tc('SelectorPlaceholder')"
                  @input="onFieldChange"
                />
                <div
                  v-else-if="item.config.type === 'check_response'"
                  class="response-check-form"
                >
                  <div class="url-row">
                    <label class="field-label">{{ $tc('URL') }}</label>
                    <el-input
                      v-model="item.config.url"
                      :placeholder="$tc('Address')"
                      @input="onFieldChange"
                    />
                  </div>
                  <div class="method-status-row">
                    <div class="field-group">
                      <label class="field-label">{{ $tc('Method') }}</label>
                      <Select2
                        v-model="item.config.method"
                        :options="checkMethodOptions"
                        :multiple="false"
                        :clearable="false"
                        @change="onFieldChange"
                      />
                    </div>
                    <div class="field-group">
                      <label class="field-label">{{ $tc('StatusCode') }}</label>
                      <el-input
                        v-model="item.config.status"
                        type="number"
                        :placeholder="$tc('StatusCode')"
                        @input="onFieldChange"
                      />
                    </div>
                  </div>
                  <div class="url-row">
                    <el-tooltip
                      :open-delay="500"
                      :tabindex="-1"
                      placement="top"
                      effect="dark"
                    >
                      <div slot="content" v-sanitize="$t('ResponseExpressionTip')" class="help-tip-content" />
                      <label class="field-label" for="response-expression-input">
                        {{ $tc('ResponseExpression') }}
                        <i class="fa fa-question-circle-o help-tip-icon" />
                      </label>
                    </el-tooltip>
                    <el-input
                      id="response-expression-input"
                      v-model="item.config.body_expr"
                      :placeholder="$tc('ResponseExpression')"
                      @input="onFieldChange"
                    />
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div class="form-actions">
            <el-button
              type="primary"
              icon="el-icon-plus"
              style="flex-shrink: 0;"
              @click="addItem(index)"
            />
            <el-button
              type="danger"
              icon="el-icon-minus"
              :disabled="formItems.length <= 1"
              @click="deleteItem(index)"
            />
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import Select2 from '@/components/Form/FormFields/Select2'

export default {
  name: 'DynamicFormList',
  components: {
    Select2
  },
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      actionOptions: [
        { label: this.$t('Click'), value: 'click' },
        { label: this.$t('Input'), value: 'input' },
        { label: this.$t('Check'), value: 'check' },
        { label: this.$t('iframe'), value: 'iframe' },
        { label: this.$t('Sleep'), value: 'sleep' }
      ],
      valueOptions: [
        { label: this.$t('LoginUsername'), value: 'login_username' },
        { label: this.$t('LoginPasswordSetting'), value: 'login_password' },
        { label: this.$t('Username'), value: 'username' },
        { label: this.$t('NewPassword'), value: 'password' }
      ],
      checkTypeOptions: [
        { label: this.$t('WaitForURL'), value: 'wait_for_url' },
        { label: this.$t('WaitForSelector'), value: 'wait_for_selector' },
        { label: this.$t('CheckResponse'), value: 'check_response' }
      ],
      checkMethodOptions: [
        { label: 'GET', value: 'get' },
        { label: 'POST', value: 'post' },
        { label: 'PUT', value: 'put' },
        { label: 'DELETE', value: 'delete' }
      ],
      formItems: []
    }
  },
  mounted() {
    this.syncFromParent()
  },
  methods: {
    getDefaultConfig(action, checkType = null) {
      switch (action) {
        case 'click':
        case 'iframe':
          return { selector: '' }
        case 'input':
          return { selector: '', value: '' }
        case 'sleep':
          return { value: 1 }
        case 'check':
          switch (checkType) {
            case 'wait_for_url':
              return { type: 'wait_for_url', url: '' }
            case 'wait_for_selector':
              return { type: 'wait_for_selector', selector: '' }
            case 'check_response':
              return { type: 'check_response', url: '', method: 'get', status: 200, body_expr: '' }
            default:
              return {}
          }
        default:
          return {}
      }
    },
    syncFromParent() {
      if (this.value && Array.isArray(this.value)) {
        this.formItems = this.value.map(item => {
          const newItem = { ...item }
          if (!newItem.config || typeof newItem.config !== 'object') {
            newItem.config = this.getDefaultConfig(newItem.action, newItem.config?.type)
          } else if (newItem.action === 'check' && !newItem.config.type) {
            newItem.config = this.getDefaultConfig('check', 'wait_for_url')
          }
          return newItem
        })
      } else {
        this.formItems = []
      }
      if (this.formItems.length === 0) {
        this.addItem()
      }
    },
    addItem(index = -1) {
      const newItem = {
        id: `item_${this.formItems.length + 1}`,
        action: 'click',
        config: this.getDefaultConfig('click')
      }
      if (index >= 0) {
        this.formItems.splice(index + 1, 0, newItem)
      } else {
        this.formItems.push(newItem)
      }
    },
    deleteItem(index) {
      if (this.formItems.length <= 1 || index < 0 || index >= this.formItems.length) {
        return
      }
      this.formItems.splice(index, 1)
      this.emitChange()
    },
    onFieldChange() {
      this.emitChange()
    },
    emitChange() {
      this.$emit('input', this.formItems)
    },
    onActionChange(index) {
      const item = this.formItems[index]
      if (!item) {
        return
      }
      item.config = this.getDefaultConfig(item.action, 'wait_for_url')
      this.emitChange()
    },
    onCheckTypeChange(index) {
      const item = this.formItems[index]
      if (!item || !item.config || !item.config.type) {
        return
      }
      item.config = this.getDefaultConfig('check', item.config.type)
      this.emitChange()
    },
    getCheckFieldLabel(checkType) {
      const labels = {
        wait_for_url: this.$t('Address'),
        wait_for_selector: this.$t('Selector'),
        check_response: this.$t('Response')
      }
      return labels[checkType] || this.$t('Value')
    }
  }
}
</script>

<style scoped>
.form-items-container {
  width: 100%;
}

.form-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 15px;
  background: #fbfbfb;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
}

.form-item:hover {
  border-color: #c0c4cc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-field {
  display: flex;
  flex-direction: column;
}

.main-selector {
  flex: 0 0 90px;
}

.conditional-fields {
  display: flex;
  gap: 12px;
  flex: 1;
  flex-wrap: wrap;
}

.conditional-fields .form-field {
  flex: 1;
  min-width: 200px;
}

.field-label {
  font-size: 12px;
  font-weight: 500;
}

.form-actions {
  display: flex;
}

.form-actions .el-button {
  padding: 5px 7px;
  font-size: 10px;
  margin: 0 1px;
}

.el-form {
  margin-right: 0 !important;
}

.response-check-form .method-status-row {
  display: flex;
  gap: 10px;
}

.response-check-form .field-label {
  display: block;
  height: 25px;
  font-size: 10px;
  color: #6a6a6a;
}

.help-tip-content {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
