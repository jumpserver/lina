<template>
  <el-form class="account-content" @submit.native.prevent>
    <el-form-item>
      <el-checkbox-group v-model="choicesSelected">
        <el-checkbox
          v-for="(i) in choices"
          :key="i.label"
          :label="i.value"
          @change="handleCheckboxCheck(i, $event)"
        >
          {{ i.label }}
          <el-tooltip :content="i.tip" :open-delay="500" placement="top">
            <i class="fa fa-question-circle-o" />
          </el-tooltip>
        </el-checkbox>

        <div v-if="showSpecAccounts" class="spec-accounts spec-zone">
          <div class="group-title">{{ $t('SpecAccount') }}</div>
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
            <span class="help-block">
              {{ addTemplateHelpText }}
            </span>
          </span>
        </div>

        <div v-if="showVirtualAccountCheckbox" class="spec-zone">
          <div class="group-title">{{ $t('VirtualAccounts') }}</div>
          <el-checkbox
            v-for="i in virtualAccounts"
            :key="i.label"
            :label="i.value"
            @change="handleCheckboxCheck(i, $event)"
          >
            {{ i.label }}
            <el-tooltip :content="i.tip" :open-delay="500" placement="top">
              <i class="fa fa-question-circle-o" />
            </el-tooltip>
          </el-checkbox>
        </div>
      </el-checkbox-group>
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
        return this.$t('TemplateHelpText')
      }
    }
  },
  data() {
    const vm = this
    const virtual = '@VIRTUAL'
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
      },
      {
        label: this.$t('VirtualAccounts'),
        value: virtual,
        tip: this.$t('VirtualAccountHelpMsg'),
        disabled: !this.showVirtualAccount
      }
    ]
    return {
      ALL: AllAccount,
      SPEC: SpecAccount,
      VIRTUAL: virtual,
      showTemplateDialog: false,
      choices: choices,
      virtualAccounts: [
        {
          label: AccountLabelMapper[ManualAccount],
          value: ManualAccount,
          tip: this.$t('ManualAccountTip')
        },
        {
          label: AccountLabelMapper[SameAccount],
          value: SameAccount,
          tip: this.$t('SameAccountTip')
        },
        {
          label: AccountLabelMapper[AnonymousAccount],
          value: AnonymousAccount,
          tip: this.$t('AnonymousAccountTip')
        }
      ],
      virtualAccountsNames: [ManualAccount, SameAccount, AnonymousAccount],
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
  computed: {
    showVirtualAccountCheckbox() {
      if (!this.showVirtualAccount) {
        return false
      }
      const hasVirtual = this.choicesSelected.filter(i => {
        return i && i.startsWith('@') && i !== '@ALL' && i !== '@SPEC'
      })
      return hasVirtual.length > 0
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
      const choicesSelected = this.value.filter(i => {
        return i.startsWith('@') && i !== this.SPEC && i !== this.VIRTUAL
      })
      // 是否添加特定账号选择
      const specAccountsInput = this.value.filter(i => !i.startsWith('@') && i !== this.SPEC)
      if (specAccountsInput.length > 0 && !choicesSelected.includes(this.ALL)) {
        choicesSelected.push(this.SPEC)
        this.showSpecAccounts = true
      }
      // 是否添加虚拟账号选择
      const hasVirtual = this.value.filter(i => {
        return i && i.startsWith('@') && i !== '@ALL' && i !== '@SPEC'
      })
      if (hasVirtual.length > 0 && !choicesSelected.includes(this.VIRTUAL)) {
        choicesSelected.push(this.VIRTUAL)
      }

      // 如果没有就设置 ALL
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
      } else if (item.value === this.SPEC) {
        this.choicesSelected = this.choicesSelected.filter(i => i !== this.ALL)
      } else if (item.value === this.VIRTUAL) {
        if (!checked) {
          this.choicesSelected = this.choicesSelected.filter(i => !this.virtualAccountsNames.includes(i))
        }
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
  padding-bottom: 5px;

  &:last-child {
    border-bottom: none;
  }
}

.account-content {
  ::v-deep {
    .el-form-item__content {
      width: 90% !important;
    }
  }
}

</style>
