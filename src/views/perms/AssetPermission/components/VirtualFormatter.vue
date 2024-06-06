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
          <el-tooltip :content="i.tip" :open-delay="500" placement="top">
            <i class="fa fa-question-circle-o" />
          </el-tooltip>
        </el-checkbox>
      </el-checkbox-group>
    </el-form-item>
  </el-form>
</template>

<script>
import { AccountLabelMapper, AnonymousAccount, ManualAccount, SameAccount } from '@/views/perms/const'

export default {
  components: {},
  props: {
    value: {
      type: [Array, String],
      default: () => []
    }
  },
  data() {
    const choices = [
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
    ]
    return {
      choices: choices,
      choicesSelected: []
    }
  },
  mounted() {
    this.initDefaultChoice()
  },
  methods: {
    initDefaultChoice() {
      this.choicesSelected = this.value.filter(i => {
        return i.startsWith('@')
      }).filter(i => {
        return !['@ALL', '@SPEC'].includes(i)
      })
    },
    handleCheckboxCheck() {
      this.outputValue()
    },
    outputValue() {
      console.log('outputValue', this.choicesSelected)
      this.$emit('input', this.choicesSelected)
      this.$emit('change', this.choicesSelected)
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

</style>
