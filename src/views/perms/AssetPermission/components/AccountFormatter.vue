<template>
  <el-form class="account-content" @submit.prevent>
    <el-form-item>
      <el-radio-group v-model="realRadioSelected" @change="handleRadioChanged">
        <el-radio v-for="i in iRealChoices" :key="i.label" :disabled="i.disabled" :value="i.value">
          {{ i.label }}
          <el-tooltip v-if="i.tip" :content="i.tip" :show-after="500" placement="top">
            <i class="fa fa-question-circle-o" />
          </el-tooltip>
        </el-radio>
      </el-radio-group>

      <div v-if="showSpecZone" class="spec-accounts spec-zone">
        <!-- <div class="group-title">{{ $t('SpecAccount') }}</div> -->
        <TagInput
          v-model="specAccountsInput"
          :autocomplete="autocomplete"
          :tag-type="getTagType"
          @change="handleSpecAccountsChange"
        />
        <span v-if="showAddTemplate">
          <el-button size="small" type="primary" @click="showTemplateDialog = true">
            {{ $t('TemplateAdd') }}
          </el-button>
          <span class="help-block">
            {{ $t(addTemplateHelpText) }}
          </span>
        </span>
      </div>

      <div v-if="showExcludeZone" class="not-accounts spec-zone">
        <!-- <div class="group-title">{{ $t('ExcludeAccount') }}</div> -->
        <TagInput v-model="excludeAccountsInput" @change="handleExcludeAccountsChange" />
      </div>

      <div v-if="enableVirtualAccount" class="spec-zone virtual-choices">
        <el-checkbox v-model="virtualChecked" @change="handleVirtualChecked">
          {{ virtualAccount.label }}
        </el-checkbox>
        <el-select
          v-if="virtualChecked"
          v-model="virtualSelected"
          :multiple="true"
          :placeholder="$t('SelectVirtualAccount')"
          @change="handleVirtualSelectionChanged"
        >
          <el-option v-for="i in virtualAccounts" :key="i.label" :label="i.label" :value="i.value">
            {{ i.label }}
            <el-tooltip :content="i.tip" :show-after="500" placement="top">
              <i class="fa fa-question-circle-o" />
            </el-tooltip>
          </el-option>
        </el-select>
      </div>
    </el-form-item>

    <Dialog
      v-if="showTemplateDialog"
      v-model:visible="showTemplateDialog"
      :title="$tc('AccountTemplate')"
      @cancel="handleAccountTemplateCancel"
      @confirm="handleAccountTemplateConfirm"
    >
      <ListTable v-bind="accountTemplateTable" ref="templateTable" />
    </Dialog>
  </el-form>
</template>

<script>
import { TagInput } from '@/components/Form/FormFields'
import {
  accountTemplateTable,
  AllAccount,
  AnonymousAccount,
  ManualAccount,
  ExcludeAccount,
  realChoices,
  SameAccount,
  SpecAccount,
  virtualAccount,
  virtualAccounts,
  NoneAccount
} from '@/views/perms/const'
import ListTable from '@/components/Table/ListTable'
import Dialog from '@/components/Dialog'

function normalizeResourceIds(values, objectKeys = ['id', 'pk', 'value']) {
  if (!Array.isArray(values)) {
    return []
  }
  return values
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return item
      }
      for (const key of objectKeys) {
        const value = item[key]
        if (value !== undefined && value !== null && value !== '') {
          return value
        }
      }
      return undefined
    })
    .filter((item) => item !== undefined && item !== null && item !== '')
}

export default {
  components: {
    TagInput,
    ListTable,
    Dialog
  },
  emits: ['input', 'change', 'update:modelValue', 'update:model-value'],
  props: {
    value: {
      type: [Array, String],
      default: () => []
    },
    modelValue: {
      type: [Array, String],
      default: undefined
    },
    assets: {
      type: [Array],
      default: () => []
    },
    nodes: {
      type: [Array],
      default: () => []
    },
    oid: {
      type: String,
      default: ''
    },
    showAddTemplate: {
      type: Boolean,
      default: true
    },
    enableVirtualAccount: {
      type: Boolean,
      default: true
    },
    enableNoneAccount: {
      type: Boolean,
      default: false
    },
    enableExcludeAccounts: {
      type: Boolean,
      default: false
    },
    addTemplateHelpText: {
      type: String,
      default() {
        return 'TemplateHelpText'
      }
    }
  },
  data() {
    const vm = this
    const virtual = '@VIRTUAL'
    return {
      ALL: AllAccount,
      SPEC: SpecAccount,
      VIRTUAL: virtual,
      EXCLUDE: ExcludeAccount,
      showTemplateDialog: false,
      realRadioSelected: this.ALL,
      realChoices: realChoices,
      virtualChecked: false,
      virtualSelected: [],
      output: [],
      pendingValueSync: null,
      excludeAccountsInput: [],
      virtualAccounts: virtualAccounts,
      virtualAccountsNames: [ManualAccount, SameAccount, AnonymousAccount],
      specAccountsInput: [],
      specAccountsTemplate: [],
      showSpecZone: false,
      getTagType: (tag) => {
        if (vm.specAccountsTemplate.filter((i) => i.username === tag).length > 0) {
          return 'primary'
        } else {
          return 'info'
        }
      },
      showExcludeZone: false,
      accountTemplateTable: accountTemplateTable,
      autocomplete: (query, cb) => {
        const data = {
          username: query,
          assets: normalizeResourceIds(this.assets).slice(0, 20),
          nodes: normalizeResourceIds(this.nodes, ['pk', 'id', 'value']).slice(0, 20)
        }
        this.$axios
          .post('/api/v1/accounts/accounts/username-suggestions/', data, {
            params: { oid: this.oid }
          })
          .then((res) => {
            if (!res) res = []
            const currentValue = vm.normalizeAccountValue(vm.currentValue)
            const data = res
              .filter((item) => currentValue.indexOf(item) === -1)
              .map((v) => ({ value: v, label: v }))
            cb(data)
          })
      }
    }
  },
  computed: {
    currentValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    virtualAccount() {
      return virtualAccount
    },
    iRealChoices: {
      get() {
        let choices = this.realChoices.slice()
        if (!this.enableNoneAccount) {
          choices = choices.filter((i) => i.value !== NoneAccount)
        }
        if (!this.enableExcludeAccounts) {
          choices = choices.filter((i) => i.value !== ExcludeAccount)
        }
        return choices
      }
    }
  },
  watch: {
    currentValue: {
      handler(value) {
        const normalizedValue = this.normalizeAccountValue(value)
        if (this.isSameAccountValue(normalizedValue, this.pendingValueSync)) {
          return
        }
        this.pendingValueSync = null
        this.initDefaultChoice()
      },
      immediate: true,
      deep: true
    },
    realRadioSelected: {
      handler(val) {
        this.showSpecZone = val === this.SPEC
        this.showExcludeZone = val === this.EXCLUDE
      },
      immediate: true
    }
  },
  methods: {
    getVirtualChoices(val) {
      return this.virtualAccounts
        .filter((i) => {
          return val.includes(i.value)
        })
        .map((i) => i.value)
    },
    normalizeAccountValue(value) {
      if (Array.isArray(value)) return value
      if (!value) return []
      return [value]
    },
    isSameAccountValue(value, expected) {
      if (!Array.isArray(expected) || value.length !== expected.length) return false
      return value.every((item, index) => item === expected[index])
    },
    getExcludeChoices(val) {
      return val.filter((i) => i.startsWith('!')).map((i) => i.substring(1))
    },
    getSpecValues(val) {
      return val.filter((i) => !i.startsWith('@') && !i.startsWith('!'))
    },
    initDefaultChoice() {
      const value = this.normalizeAccountValue(this.currentValue)
      const specAccountsInput = this.getSpecValues(value)
      const excludeAccountsInput = this.getExcludeChoices(value)

      // 每次都完整同步外部值，避免同一组件切换记录时保留上一条记录的账号。
      this.specAccountsInput = specAccountsInput
      this.excludeAccountsInput = excludeAccountsInput

      // 先清理 radio
      const isAll = value.includes(this.ALL)

      if (isAll) {
        this.realRadioSelected = this.ALL
      } else if (specAccountsInput.length > 0 || value.includes(this.SPEC)) {
        this.realRadioSelected = this.SPEC
      } else if (excludeAccountsInput.length > 0 || value.includes(this.EXCLUDE)) {
        this.realRadioSelected = this.EXCLUDE
      } else {
        this.realRadioSelected = NoneAccount
      }

      // 清理虚拟账号
      const virtualChoices = this.getVirtualChoices(value)
      this.virtualChecked = virtualChoices.length > 0
      this.virtualSelected = virtualChoices
    },
    handleAccountTemplateCancel() {
      this.showTemplateDialog = false
    },
    handleAccountTemplateConfirm() {
      this.specAccountsTemplate = this.$refs.templateTable.selectedRows
      const added = this.specAccountsTemplate.map((i) => i.username)
      this.specAccountsInput = this.specAccountsInput
        .filter((i) => !added.includes(i))
        .concat(added)
      this.outputValue()
      setTimeout(() => {
        this.showTemplateDialog = false
        this.outputValue()
      }, 100)
    },
    handleVirtualChecked(checked) {
      this.virtualChecked = Boolean(checked)
      this.outputValue()
    },
    handleVirtualSelectionChanged() {
      this.outputValue()
    },
    handleRadioChanged(value) {
      this.outputValue()
    },
    handleSpecAccountsChange(value) {
      this.specAccountsInput = this.normalizeAccountValue(value)
      this.outputValue()
    },
    handleExcludeAccountsChange(value) {
      this.excludeAccountsInput = this.normalizeAccountValue(value)
      this.outputValue()
    },
    outputValue() {
      // 这是真是的
      let choicesSelected = []

      if (this.realRadioSelected === this.ALL) {
        choicesSelected = [this.ALL]
      } else if (this.realRadioSelected === this.SPEC && this.showSpecZone) {
        const templateIds = this.specAccountsTemplate.map((i) => `%${i.id}`)
        choicesSelected = [this.realRadioSelected, ...this.specAccountsInput, ...templateIds]
      } else if (this.realRadioSelected === NoneAccount) {
        choicesSelected = []
      } else if (this.realRadioSelected === this.EXCLUDE && this.excludeAccountsInput) {
        choicesSelected = [...this.excludeAccountsInput].map((i) => '!' + i)
      }

      if (this.virtualChecked) {
        choicesSelected = [...choicesSelected, ...this.virtualSelected]
      }

      this.$log.debug('choicesSelected', choicesSelected)

      // 空的“排除账号”与“无”都会输出 []。记录本次内部输出，避免父表单将
      // 同一个值同步回来时把当前 radio 误判成“无”；外部真正变更时仍会完整重置。
      const pendingValueSync = choicesSelected.slice()
      this.pendingValueSync = pendingValueSync
      this.$emit('update:modelValue', choicesSelected)
      this.$emit('update:model-value', choicesSelected)
      this.$emit('input', choicesSelected)
      this.$emit('change', choicesSelected)
      this.$nextTick(() => {
        if (this.pendingValueSync === pendingValueSync) {
          this.pendingValueSync = null
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.select :deep(.el-input.el-input--suffix) {
  width: 100px;
}

.spec-accounts {
  :deep(.filter-field) {
    width: 100%;
    margin-bottom: 3px !important;
  }
}

.help-text {
  font-size: 12px;
  color: #999999;
}

.group-title {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.spec-zone {
  width: 100%;
  min-width: 0;
  border-bottom: dashed 1px var(--color-border);
  padding-bottom: 10px;
  padding-top: 5px;
  overflow: hidden;

  &:last-child {
    border-bottom: none;
  }
}

.virtual-choices {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;

  :deep(.el-checkbox) {
    align-self: flex-start;
    margin-right: 0;
  }

  :deep(.el-select) {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }
}

.account-content {
  width: 100%;
  min-width: 0;
  overflow-x: hidden;

  :deep(.el-form-item) {
    width: 100%;
    margin-bottom: 0;
  }

  :deep(.el-form-item__content) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    width: 100% !important;
    min-width: 0;
    overflow-x: hidden;
  }

  :deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    width: 100%;
    min-width: 0;
  }

  :deep(.el-radio) {
    margin-right: 0;
  }
}
</style>
