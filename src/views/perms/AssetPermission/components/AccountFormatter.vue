<template>
  <div>
    <el-checkbox-group v-model="select">
      <el-checkbox
        v-for="(i) in checkboxGroup"
        :key="i.label"
        :label="i.value"
        :disabled="isDisabled(i)"
        @change="handleItemChange"
      >
        {{ i.label }}
      </el-checkbox>
    </el-checkbox-group>
    <TagInput
      v-if="showInput"
      :value="customTags"
      @change="handleTagChange"
    />
  </div>
</template>

<script>
import { TagInput } from '@/components/FormFields'

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
    const checkboxGroup = [
      {
        label: this.$t('perms.AllAccounts'),
        value: '@ALL'
      },
      {
        label: this.$t('perms.ManualInput'),
        value: '@INPUT'
      },
      {
        label: this.$t('perms.SameAccount'),
        value: '@USER'
      },
      {
        label: this.$t('perms.SpecifyInput'),
        value: 'INPUT'
      }
    ]
    return {
      checkboxGroup,
      defaultOptions: ['@ALL', '@INPUT', '@USER'],
      select: [],
      customTags: [],
      showInput: false
    }
  },
  computed: {
    isDisabled() {
      return (item) => (['@INPUT', '@USER'].includes(item.value) && this.select.includes('@ALL'))
    }
  },
  created() {
    this.init()
    if (this.customTags.length > 0) {
      this.select.push('INPUT')
      this.showInput = true
    }
  },
  methods: {
    init() {
      const select = []
      const customTags = []
      this.value.filter(i => {
        if (this.defaultOptions.includes(i)) {
          select.push(i)
        } else {
          customTags.push(i)
        }
      })
      this.select = select
      this.customTags = customTags
    },
    handleItemChange(val, event) {
      if (val && event.target.defaultValue === '@ALL') {
        this.select = Array.from(new Set([...this.select, ...this.defaultOptions]))
      }
      if (this.select.includes('INPUT')) {
        this.showInput = true
      } else {
        this.showInput = false
      }
      this.setValue()
    },
    handleTagChange(val) {
      if (this.select.includes('INPUT')) {
        this.customTags = val
        this.setValue()
      }
    },
    setValue() {
      const selectValue = this.select.filter(i => i !== 'INPUT')
      if (this.select.includes('INPUT')) {
        this.$emit('change', [...selectValue, ...this.customTags])
      } else {
        this.$emit('change', selectValue)
      }
    }
  }
}
</script>

<style scoped>
.select >>> .el-input.el-input--suffix {
  width: 100px
}
</style>
