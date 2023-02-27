<template>
  <div>
    <el-checkbox-group v-model="choicesSelected">
      <el-checkbox
        v-for="(i) in choices"
        :key="i.label"
        :label="i.value"
        @change="handleCheckboxCheck(i, $event)"
      >
        {{ i.label }}
      </el-checkbox>
    </el-checkbox-group>
    <TagInput
      v-if="showSpecAccounts"
      :autocomplete="autocomplete"
      :value="specAccountsInput"
      @change="handleTagChange"
    />
  </div>
</template>

<script>
import { TagInput } from '@/components/FormFields'
import { AccountLabelMapper, AllAccount, ManualINPUT, SameUSER, SPECAccount } from '@/views/perms/const'

export default {
  components: {
    TagInput
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
    }
  },
  data() {
    const vm = this
    const choices = [
      {
        label: AccountLabelMapper[AllAccount],
        value: AllAccount
      },
      {
        label: AccountLabelMapper[SPECAccount],
        value: SPECAccount
      },
      {
        label: AccountLabelMapper[ManualINPUT],
        value: ManualINPUT
      },
      {
        label: AccountLabelMapper[SameUSER],
        value: SameUSER
      }
    ]
    return {
      ALL: AllAccount,
      SPEC: SPECAccount,
      choices: choices,
      choicesSelected: [],
      defaultChoices: [this.ALL],
      specAccountsInput: [],
      showSpecAccounts: false,
      autocomplete: (query, cb) => {
        this.$axios.get('/api/v1/accounts/accounts/username-suggestions/', {
          params: {
            username: query,
            assets: this.assets.slice(0, 20).join(','),
            nodes: this.nodes.slice(0, 20).map(item => {
              if (typeof item === 'object') {
                return item.pk
              } else {
                return item.pk
              }
            }).join(',')
          }
        }).then(res => {
          const data = res
            .filter(item => vm.value.indexOf(item) === -1)
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
        choicesSelected = [...this.choicesSelected, ...this.specAccountsInput]
      }
      this.$emit('input', choicesSelected)
      this.$emit('change', choicesSelected)
    }
  }
}
</script>

<style scoped>
.select >>> .el-input.el-input--suffix {
  width: 100px
}

.help-text {
  font-size: 12px;
  color: #999999;
}
</style>
