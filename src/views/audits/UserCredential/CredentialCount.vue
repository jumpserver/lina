<template>
  <el-link
    v-if="hasDetails"
    type="info"
    underline="hover"
    role="button"
    tabindex="0"
    :aria-label="actionLabel"
    @click="openDetails"
    @keydown.enter.prevent="openDetails"
    @keydown.space.prevent="openDetails"
  >
    {{ label }}
  </el-link>
  <span v-else>{{ label }}</span>
</template>

<script>
import BaseFormatter from '@/components/Table/TableFormatters/base.vue'

export default {
  name: 'CredentialCount',
  extends: BaseFormatter,
  computed: {
    existsOnly() {
      return this.col.formatterArgs.existsOnly
    },
    hasDetails() {
      return this.existsOnly ? this.cellValue : this.cellValue.total > 0
    },
    label() {
      if (this.existsOnly) {
        return this.$t(this.cellValue ? 'UserCredentialPresent' : 'UserCredentialAbsent')
      }
      return `${this.cellValue.enabled} / ${this.cellValue.total}`
    },
    actionLabel() {
      const context = { user: this.row.username, type: this.col.label }
      return this.existsOnly
        ? this.$t('UserCredentialPresenceAction', context)
        : this.$t('UserCredentialCountAction', { ...context, ...this.cellValue })
    }
  },
  methods: {
    openDetails() {
      this.col.formatterArgs.onClick({ row: this.row })
    }
  }
}
</script>
