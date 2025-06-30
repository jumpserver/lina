<template>
  <el-form class="account-content" @submit.native.prevent>
    <el-form-item>
      <el-radio-group v-model="realRadioSelected" @input="handleRadioChanged">
        <el-radio
          v-for="(i) in realChoices"
          :key="i.label"
          :disabled="i.disabled"
          :label="i.value"
        >
          {{ i.label }}
          <el-tooltip :content="i.tip" :open-delay="500" placement="top">
            <i class="fa fa-question-circle-o" />
          </el-tooltip>
        </el-radio>
      </el-radio-group>

      <div v-if="showSpecZone" class="spec-accounts spec-zone">
        <div class="group-title">{{ $t('SpecAccount') }}</div>
        <TagInput
          v-model="specAccountsInput"
          :autocomplete="autocomplete"
          :tag-type="getTagType"
          @change="handleTagChange"
        />
        <span v-if="showAddTemplate">
          <el-button size="mini" type="primary" @click="showTemplateDialog=true">
            {{ $t('TemplateAdd') }}
          </el-button>
          <span v-if="showAddAccount">
            <el-button size="mini" type="primary" @click="showAccountSelectDialog=true">
              {{ $t('AssetAccount') }}
            </el-button>
          </span>
          <span class="help-block">
            {{ addTemplateHelpText }}
            {{ addAccountSelectHelpText }}
          </span>
        </span>
      </div>

      <!--      <div v-if="showNotAccounts" class="not-accounts spec-zone">-->
      <!--        <div class="group-title">{{ $t('ExcludeAccount') }}</div>-->
      <!--        <TagInput v-model="excludeAccountsInput" @change="handleTagChange" />-->
      <!--      </div>-->

      <div v-if="enableVirtualAccount" class="spec-zone virtual-choices">
        <el-checkbox v-model="virtualChecked" @change="handleVirtualChecked">
          {{ virtualAccount.label }}
        </el-checkbox>
        <el-select
          v-if="virtualChecked"
          v-model="virtualSelected"
          :multiple="true"
          :placeholder="$t('SelectVirtualAccount')"
          @change="handleVirtualChecked"
        >
          <el-option
            v-for="i in virtualAccounts"
            :key="i.label"
            :label="i.label"
            :value="i.value"
          >
            {{ i.label }}
            <el-tooltip :content="i.tip" :open-delay="500" placement="top">
              <i class="fa fa-question-circle-o" />
            </el-tooltip>
          </el-option>
        </el-select>
      </div>
    </el-form-item>

    <Dialog
      v-if="showTemplateDialog"
      :title="$tc('AccountTemplate')"
      :visible.sync="showTemplateDialog"
      @cancel="handleAccountTemplateCancel"
      @confirm="handleAccountTemplateConfirm"
    >
      <ListTable ref="templateTable" v-bind="accountTemplateTable" />
    </Dialog>
    <AccountSelectDialog
      v-if="showAccountSelectDialog"
      :value="value"
      :visible.sync="showAccountSelectDialog"
      v-bind="$attrs"
      @cancel="handleCancel"
      @confirm="handleConfirm"
      v-on="$listeners"
    />
  </el-form>
</template>

<script>
import { TagInput } from '@/components/Form/FormFields'
import {
  accountTemplateTable,
  AllAccount,
  AnonymousAccount,
  ManualAccount,
  NotAccount,
  realChoices,
  SameAccount,
  SpecAccount,
  virtualAccount,
  virtualAccounts
} from '@/views/perms/const'
import ListTable from '@/components/Table/ListTable'
import Dialog from '@/components/Dialog'
import AccountSelectDialog from '@/components/Apps/AccountSelect/dialog.vue'

export default {
  components: {
    AccountSelectDialog,
    TagInput,
    ListTable,
    Dialog
  },
  props: {
    value: {
      type: [Array, String],
      default: () => []
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
    addTemplateHelpText: {
      type: String,
      default() {
        return this.$t('TemplateHelpText')
      }
    },
    addAccountSelectHelpText: {
      type: String,
      default() {
        return this.$t('AccountSelectHelpText')
      }
    },
    showAddAccount: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const vm = this
    const virtual = '@VIRTUAL'
    return {
      ALL: AllAccount,
      SPEC: SpecAccount,
      VIRTUAL: virtual,
      EXCLUDE: NotAccount,
      showTemplateDialog: false,
      showAccountSelectDialog: false,
      realRadioSelected: this.ALL,
      realChoices: realChoices,
      virtualChecked: false,
      virtualSelected: [],
      output: [],
      excludeAccountsInput: [],
      virtualAccounts: virtualAccounts,
      virtualAccountsNames: [ManualAccount, SameAccount, AnonymousAccount],
      specAccountsInput: [],
      specAccountsTemplate: [],
      showSpecZone: false,
      getTagType: (tag) => {
        if (vm.specAccountsTemplate.filter(i => i.username === tag).length > 0) {
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
          assets: this.assets.slice(0, 20),
          nodes: this.nodes.slice(0, 20).map(item => {
            return typeof item === 'object' ? item.pk : item
          })
        }
        this.$axios.post(
          '/api/v1/accounts/accounts/username-suggestions/',
          data, { params: { oid: this.oid }}
        ).then(res => {
          if (!res) res = []
          const data = res
            .filter(item => vm.value.indexOf(item) === -1)
            .map(v => ({ value: v, label: v }))
          cb(data)
        })
      }
    }
  },
  computed: {
    virtualAccount() {
      return virtualAccount
    }
  },
  watch: {
    realRadioSelected(val) {
      this.showSpecZone = val === this.SPEC
      this.showExcludeZone = val === this.EXCLUDE
    }
  },
  mounted() {
    this.initDefaultChoice()
  },
  methods: {
    getVirtualChoices(val) {
      return this.virtualAccounts.filter(i => {
        return val.includes(i.value)
      }).map(i => i.value)
    },
    getExcludeChoices(val) {
      return val.filter(i => i.startsWith('!')).map(i => i.substring(1))
    },
    getSpecValues(val) {
      return val.filter(i => !i.startsWith('@') && !i.startsWith('!'))
    },
    initDefaultChoice() {
      const value = this.value || []
      if (value.length === 0) {
        value.push(this.ALL)
      }

      const specAccountsInput = this.getSpecValues(value)
      // const excludeAccountsInput = this.getExcludeChoices(value)
      // 先清理 radio
      const isAll = value.includes(this.ALL)
      if (isAll) {
        this.realRadioSelected = this.ALL
      } else if (specAccountsInput.length > 0) {
        this.realRadioSelected = this.SPEC
        this.specAccountsInput = specAccountsInput
        // } else if (excludeAccountsInput.length > 0) {
        //   this.realRadioSelected = this.EXCLUDE
        //   this.excludeAccountsInput = excludeAccountsInput
      } else {
        this.realRadioSelected = this.ALL
      }

      // 清理虚拟账号
      const virtualChoices = this.getVirtualChoices(this.value)
      if (virtualChoices.length > 0) {
        this.virtualChecked = true
        this.virtualSelected = virtualChoices
      }
    },
    handleAccountTemplateCancel() {
      this.showTemplateDialog = false
    },
    handleAccountTemplateConfirm() {
      this.specAccountsTemplate = this.$refs.templateTable.selectedRows
      const added = this.specAccountsTemplate.map(i => i.username)
      this.specAccountsInput = this.specAccountsInput.filter(i => !added.includes(i)).concat(added)
      this.outputValue()
      setTimeout(() => {
        this.showTemplateDialog = false
        this.outputValue()
      }, 100)
    },
    handleVirtualChecked(evt, checked) {
      console.log('Vhcek cch')
      this.outputValue()
    },
    handleRadioChanged(value) {
      this.outputValue()
    },
    handleTagChange() {
      this.outputValue()
    },
    outputValue() {
      // 这是真是的
      let choicesSelected = []
      if (this.realRadioSelected === this.ALL) {
        choicesSelected = [this.ALL]
      } else if (this.realRadioSelected === this.SPEC && this.showSpecZone) {
        const templateIds = this.specAccountsTemplate.map(i => `%${i.id}`)
        choicesSelected = [this.realRadioSelected, ...this.specAccountsInput, ...templateIds]
      }
      // else if (this.realRadioSelected === this.EXCLUDE && this.excludeAccountsInput) {
      //   choicesSelected = [...this.excludeAccountsInput].map(i => '!' + i)
      // }

      if (this.virtualChecked) {
        choicesSelected = [...choicesSelected, ...this.virtualSelected]
      }

      this.$log.debug('choicesSelected', choicesSelected)

      this.$emit('input', choicesSelected)
      this.$emit('change', choicesSelected)
    },
    handleConfirm(valueSelected, rowsAdd) {
      if (valueSelected === undefined) { return }
      const newUsernames = [...new Set(rowsAdd.map(row => row.username))]
      this.specAccountsInput = [...new Set([...this.specAccountsInput, ...newUsernames])]
      this.outputValue()
      setTimeout(() => {
        this.showAccountSelectDialog = false
        this.outputValue()
      }, 100)
    },
    handleCancel() {
      this.showAccountSelectDialog = false
    }
  }
}
</script>

<style lang="scss" scoped>
.select ::v-deep .el-input.el-input--suffix {
  width: 100px
}

.spec-accounts {
  ::v-deep {
    .filter-field {
      width: 100%;
      margin-bottom: 3px !important;
    }
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
  border-bottom: dashed 1px var(--color-border);
  padding-bottom: 10px;

  &:last-child {
    border-bottom: none;
  }
}

.virtual-choices {
  .el-select {
    width: 100%;
  }
}

.account-content {
  ::v-deep {
    .el-form-item__content {
      width: 90% !important;
    }
  }
}

.el-dialog__wrapper ::v-deep .el-dialog__body {
  padding: 0 0 0 3px;

  .tree-table {
    .left {
      padding: 5px 0;

      .ztree {
        height: 100%;
      }
    }

    .right {
      .transition-box {
        padding-left: 0;
      }
    }

    .mini {
      padding-top: 8px;
      width: 1px;
    }

    .transition-box {
      padding: 10px 5px;
    }
  }
}

</style>
