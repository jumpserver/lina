<template>
  <el-form @submit.native.prevent>
    <el-form-item>
      <el-radio-group v-model="choiceSelected" @input="handleRadioCheck">
        <el-radio
          v-for="(i) in choices"
          :key="i.label"
          :label="i.value"
        >
          {{ i.label }}
          <el-tooltip :content="i.tip" :open-delay="500" placement="top">
            <i class="fa fa-question-circle-o" />
          </el-tooltip>
        </el-radio>
      </el-radio-group>
      <div v-if="showSpecAccounts" class="spec-accounts">
        <TagInput
          :autocomplete="autocomplete"
          :tag-type="getTagType"
          :value="specAccountsInput"
          @change="handleTagChange"
        />
        <span v-if="showAddTemplate">
          <el-button size="mini" type="primary" @click="showTemplateDialog=true">
            {{ $t('TemplateAdd') }}
          </el-button>
          <span class="help-block" style="display: inline">
            {{ addTemplateHelpText }}
          </span>
        </span>
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
  </el-form>
</template>

<script>
import { TagInput } from '@/components/Form/FormFields'
import { AccountLabelMapper, AllAccount, SpecAccount } from '@/views/perms/const'
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
    addTemplateHelpText: {
      type: String,
      default() {
        return this.$t('TemplateHelpText')
      }
    }
  },
  data() {
    const vm = this
    const choices = [
      {
        label: AccountLabelMapper[AllAccount],
        value: AllAccount,
        tip: this.$t('AllAccountTip')
      },
      {
        label: AccountLabelMapper[SpecAccount],
        value: SpecAccount,
        tip: this.$t('SpecAccountTip')
      }
    ]
    return {
      ALL: AllAccount,
      SPEC: SpecAccount,
      showTemplateDialog: false,
      choices: choices,
      choiceSelected: this.ALL,
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
            'name', 'username', 'has_secret', 'comment'
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
  },
  methods: {
    initDefaultChoice() {
      this.choiceSelected = this.value.indexOf(this.ALL) >= 0 ? this.ALL : this.SPEC
      this.specAccountsInput = this.value.filter(i => !i.startsWith('@'))
      if (this.choiceSelected === this.SPEC) {
        this.showSpecAccounts = true
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
    handleRadioCheck(item) {
      this.showSpecAccounts = item === this.SPEC
      this.outputValue()
    },
    handleTagChange(val) {
      this.specAccountsInput = val
      this.outputValue()
    },
    outputValue() {
      let choicesSelected = []
      if (this.choiceSelected === this.ALL) {
        choicesSelected = [this.ALL]
      } else {
        const templateIds = this.specAccountsTemplate.map(i => `%${i.id}`)
        choicesSelected = [...this.specAccountsInput, ...templateIds]
      }
      this.$emit('input', choicesSelected)
      this.$emit('change', choicesSelected)
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
    .el-select {
      width: 100%;
      margin-bottom: 3px;
    }

    .help-block {
      display: block !important;
    }
  }
}

.help-text {
  font-size: 12px;
  color: #999999;
}

.group-title {
  font-size: 12px;
  color: var(--color-text-secondary);
}

//::v-deep .el-checkbox-group {
//  display: grid;
//  grid-template-columns: repeat(3, 1fr);
//}
//
//::v-deep .el-checkbox-group label:nth-child(1),
//::v-deep .el-checkbox-group label:nth-child(2) {
//  grid-row: 1 / 2;
//}
//
//::v-deep .el-checkbox-group label:nth-child(3),
//::v-deep .el-checkbox-group label:nth-child(4),
//::v-deep .el-checkbox-group label:nth-child(5) {
//  grid-row: 2 / 3;
//}
</style>
