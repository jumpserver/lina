<template>
  <el-form @submit.native.prevent>
    <el-form-item>
      <el-checkbox-group v-model="choicesSelected">
        <el-checkbox
          v-for="(i) in choices"
          :key="i.label"
          :label="i.value"
          @change="handleCheckboxCheck(i, $event)"
        >
          {{ i.label }}
          <el-tooltip :content="i.tip" placement="top">
            <i class="fa fa-question-circle-o" />
          </el-tooltip>
        </el-checkbox>
      </el-checkbox-group>

      <div v-if="showSpecAccounts" class="spec-accounts">
        <TagInput
          :autocomplete="autocomplete"
          :tag-type="getTagType"
          :value="specAccountsInput"
          @change="handleTagChange"
        />
        <span v-if="showAddTemplate">
          <el-button size="mini" type="primary" @click="showTemplateDialog=true">
            {{ $t('common.TemplateAdd') }}
          </el-button>
          <span class="help-block" style="display: inline">
            {{ addTemplateHelpText }}
          </span>
        </span>
      </div>
    </el-form-item>

    <Dialog
      v-if="showTemplateDialog"
      :title="$tc('accounts.AccountTemplate')"
      :visible.sync="showTemplateDialog"
      @cancel="handleAccountTemplateCancel"
      @confirm="handleAccountTemplateConfirm"
    >
      <ListTable ref="templateTable" v-bind="accountTemplateTable" />
    </Dialog>
  </el-form>
</template>

<script>
import { TagInput } from '@/components/Form/FormFields'
import {
  AccountLabelMapper, AllAccount, AnonymousAccount, ManualAccount, SameAccount, SpecAccount
} from '@/views/perms/const'
import ListTable from '@/components/Table/ListTable'
import Dialog from '@/components/Dialog'

export default {
  components: {
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
    showVirtualAccount: {
      type: Boolean,
      default: true
    },
    addTemplateHelpText: {
      type: String,
      default() {
        return this.$t('common.TemplateHelpText')
      }
    }
  },
  data() {
    const vm = this
    const choices = [
      {
        label: AccountLabelMapper[AllAccount],
        value: AllAccount,
        tip: this.$t('perms.AllAccountTip')
      },
      {
        label: AccountLabelMapper[SpecAccount],
        value: SpecAccount,
        tip: this.$t('perms.SpecAccountTip')
      },
      {
        label: AccountLabelMapper[ManualAccount],
        value: ManualAccount,
        tip: this.$t('perms.ManualAccountTip')
      },
      {
        label: AccountLabelMapper[SameAccount],
        value: SameAccount,
        tip: this.$t('perms.SameAccountTip')
      },
      {
        label: AccountLabelMapper[AnonymousAccount],
        value: AnonymousAccount,
        tip: this.$t('perms.AnonymousAccountTip')
      }
    ]
    return {
      ALL: AllAccount,
      SPEC: SpecAccount,
      showTemplateDialog: false,
      choices: choices.filter(i => {
        const isVirtualAccount = [SameAccount, ManualAccount, AnonymousAccount].includes(i.value)
        return !(isVirtualAccount && !this.showVirtualAccount)
      }),
      choicesSelected: [this.ALL],
      specAccountsInput: [],
      specAccountsTemplate: [],
      showSpecAccounts: false,
      getTagType: (tag) => {
        if (vm.specAccountsTemplate.filter(i => i.username === tag).length > 0) {
          return 'primary'
        } else {
          return 'info'
        }
      },
      accountTemplateTable: {
        tableConfig: {
          url: '/api/v1/accounts/account-templates/',
          columns: [
            'name', 'username', 'has_secret', 'comment',
            'date_created', 'date_updated'
          ],
          columnsMeta: {
            name: {
              formatterArgs: {
                openInNewPage: true,
                getRoute({ row, col, cellValue }) {
                  return {
                    name: 'AccountTemplateDetail',
                    params: {
                      id: row.id
                    }
                  }
                }
              }
            },
            has_secret: {
              formatterArgs: {
                showFalse: false
              }
            },
            actions: {
              has: false
            }
          }
        },
        headerActions: {
          hasLeftActions: false,
          hasImport: false,
          hasExport: false
        }
      },
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
  mounted() {
    this.initDefaultChoice()
    setTimeout(() => {
      if (this.value.length === 0) {
        this.$emit('input', ['@ALL'])
      } else {
        this.$emit('input', this.value)
      }
    })
  },
  methods: {
    initDefaultChoice() {
      const choicesSelected = this.value.filter(i => i.startsWith('@'))
      const specAccountsInput = this.value.filter(i => !i.startsWith('@'))
      if (specAccountsInput.length > 0 && !choicesSelected.includes(this.ALL)) {
        choicesSelected.push(this.SPEC)
        this.showSpecAccounts = true
      }
      if (this.value.indexOf(this.SPEC) > -1) {
        this.showSpecAccounts = true
      }
      if (choicesSelected.length === 0) {
        choicesSelected.push(this.ALL)
      }
      this.choicesSelected = choicesSelected
      this.specAccountsInput = specAccountsInput
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
    handleCheckboxCheck(item, checked) {
      if (item.value === this.SPEC) {
        this.showSpecAccounts = checked
      } else if (item.value === this.ALL) {
        this.showSpecAccounts = checked ? false : checked
      }
      if (item.value === this.ALL) {
        this.choicesSelected = this.choicesSelected.filter(i => i !== this.SPEC)
      }
      if (item.value === this.SPEC) {
        this.choicesSelected = this.choicesSelected.filter(i => i !== this.ALL)
      }
      this.outputValue()
    },
    handleTagChange(val) {
      this.specAccountsInput = val
      this.outputValue()
    },
    outputValue() {
      let choicesSelected = this.choicesSelected
      if (this.showSpecAccounts) {
        const templateIds = this.specAccountsTemplate.map(i => `%${i.id}`)
        choicesSelected = [...this.choicesSelected, ...this.specAccountsInput, ...templateIds]
      }
      this.$emit('input', choicesSelected)
      this.$emit('change', choicesSelected)
    }
  }
}
</script>

<style lang="scss" scoped>
.select >>> .el-input.el-input--suffix {
  width: 100px
}

.spec-accounts {
  >>> .el-select {
    width: 100%;
  }
}

.help-text {
  font-size: 12px;
  color: #999999;
}
</style>
