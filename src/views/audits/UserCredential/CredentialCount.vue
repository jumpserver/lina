<template>
  <DetailFormatter
    v-if="existsOnly ? cellValue : cellValue.total"
    :row="row"
    :col="col"
    :cell-value="cellValue"
    role="button"
    tabindex="0"
    :aria-label="
      existsOnly
        ? $t('UserCredentialPresenceAction', { user: row.username, type: col.label })
        : $t('UserCredentialCountAction', { user: row.username, type: col.label, ...cellValue })
    "
    @keydown.enter.prevent="col.formatterArgs.onClick({ row })"
    @keydown.space.prevent="col.formatterArgs.onClick({ row })"
  >
    {{ displayValue }}
  </DetailFormatter>
  <span v-else>{{ displayValue }}</span>
</template>

<script>
import BaseFormatter from '@/components/Table/TableFormatters/base.vue'
import DetailFormatter from '@/components/Table/TableFormatters/DetailFormatter.vue'

export default {
  name: 'CredentialCount',
  components: { DetailFormatter },
  extends: BaseFormatter,
  computed: {
    existsOnly() {
      return this.col.formatterArgs.existsOnly
    },
    displayValue() {
      if (this.existsOnly) {
        return this.$t(this.cellValue ? 'UserCredentialPresent' : 'UserCredentialAbsent')
      }
      return `${this.cellValue.enabled} / ${this.cellValue.total}`
    }
  }
}
</script>
