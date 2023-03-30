<template>
  <el-form>
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
    </el-form-item>

    <div v-if="showSpecAccounts" class="spec-accounts">
      <el-form-item label="选择账号">
        <TagInput
          :autocomplete="autocomplete"
          :tag-type="getTagType"
          :value="specAccountsInput"
          @change="handleTagChange"
        />
        <span v-if="showAddTemplate">
          <el-button size="small" type="primary" style="margin-left: 10px" @click="showAccountTemplateDialog=true">
            {{ $t('common.TemplateAdd') }}
          </el-button>
          {{ addTemplateHelpText }}
        </span>
      </el-form-item>
    </div>

    <Dialog
      v-if="showAccountTemplateDialog"
      :title="$tc('accounts.AccountTemplate')"
      :visible.sync="showAccountTemplateDialog"
      @confirm="handleAccountTemplateConfirm"
      @cancel="handleAccountTemplateCancel"
    >
      <ListTable ref="templateTable" v-bind="accountTemplateTable" />
    </Dialog>
  </el-form>
</template>

<script>
import { TagInput } from '@/components/FormFields'
import { AccountLabelMapper, AllAccount, ManualAccount, SameAccount, SpecAccount } from '@/views/perms/const'
import ListTable from '@/components/ListTable'
import Dialog from '@/components/Dialog'

export default {
  components: {
    TagInput,
    ListTable,
    Dialog
  },
  props: {
    value: {
      type: [Array],
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
      default: false
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
      }
    ]
    return {
      ALL: AllAccount,
      SPEC: SpecAccount,
      showAccountTemplateDialog: false,
      choices: choices,
      choicesSelected: [],
      defaultChoices: [this.ALL],
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
        this.$axios.get('/api/v1/accounts/accounts/username-suggestions/', {
          params: {
            username: query,
            assets: this.assets.slice(0, 20).join(','),
            nodes: this.nodes.slice(0, 20).map(item => {
              if (typeof item === 'object') {
                return item.pk
              } else {
                return item
              }
            }).join(','),
            oid: this.oid
          }
        }).then(res => {
          if (!res) {
            res = []
          }
          const data = res.filter(item => vm.value.indexOf(item) === -1)
            .map(v => ({ value: v, label: v }))
          cb(data)
        })
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      const choicesSelected = this.value.filter(i => i.startsWith('@'))
      const specAccountsInput = this.value.filter(i => !i.startsWith('@'))
      if (specAccountsInput.length > 0 && !choicesSelected.includes(this.ALL)) {
        choicesSelected.push(this.SPEC)
        this.showSpecAccounts = true
      }
      if (this.value.indexOf(this.SPEC) > -1) {
        this.showSpecAccounts = true
      }
      this.choicesSelected = choicesSelected
      this.specAccountsInput = specAccountsInput
    },
    handleAccountTemplateCancel() {
      this.showAccountTemplateDialog = false
    },
    handleAccountTemplateConfirm() {
      this.specAccountsTemplate = this.$refs.templateTable.selectedRows
      const added = this.specAccountsTemplate.map(i => i.username)
      this.specAccountsInput = this.specAccountsInput.filter(i => !added.includes(i)).concat(added)
      this.outputValue()
      setTimeout(() => {
        this.showAccountTemplateDialog = false
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

<style lang='scss' scoped>
.select >>> .el-input.el-input--suffix {
  width: 100px
}

.spec-accounts {
  border: solid 1px #f3f3f4;
  padding: 10px 10px 0;

  &>>> .el-form-item {
    display: flex;
  }
  &>>> .el-form-item__content {
    width: 80% !important;
    flex: 1;
  }
  &>>> .filter-field {
    width: calc(100% - 94px);
    display: inline-block;
  }
}

.help-text {
  font-size: 12px;
  color: #999999;
}
</style>
