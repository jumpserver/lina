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
      :value="specAccountsInput"
      @change="handleTagChange"
    />
  </div>
</template>

<script>
import { TagInput } from '@/components/FormFields'
import {
  AllAccount,
  SPECAccount,
  SameUSER,
  ManualINPUT,
  AccountLabelMapper
} from '@/views/perms/const'

export default {
  components: {
    TagInput
  },
  props: {
    value: {
      type: [Array],
      default: () => []
    }
  },
  data() {
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
      showSpecAccounts: false
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
