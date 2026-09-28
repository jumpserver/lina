<template>
  <span v-if="!compact && !inline">{{ displayValues.join(', ') || '-' }}</span>
  <div v-else class="ticket-value-list" :class="{ 'is-inline': inline }">
    <span class="ticket-value-list__count">{{
      countLabel || $t('TicketListCount', { count: items.length })
    }}</span>
    <div class="ticket-value-list__preview" :class="{ 'is-expanded': expanded }">
      <template v-if="!expanded">
        <span
          v-for="(value, index) in displayValues.slice(0, 3)"
          :key="index"
          :title="value"
          class="ticket-value-list__item"
        >
          {{ value }}
        </span>
      </template>
      <button
        v-if="compact"
        type="button"
        class="ticket-value-list__toggle"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{
          expanded
            ? $t('TicketListCollapse')
            : expandLabel || $t('TicketListExpand', { count: items.length })
        }}
      </button>
    </div>
    <ul v-if="expanded && inline" class="ticket-value-list__names" :aria-label="label">
      <li v-for="(value, index) in displayValues" :key="index">{{ value }}</li>
    </ul>
    <div v-else-if="expanded" class="ticket-value-list__results">
      <table :aria-label="label">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">{{ label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, index) in displayValues" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ value }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TicketValueList',
  props: {
    items: { type: Array, default: () => [] },
    label: { type: String, default: '' },
    inline: { type: Boolean, default: false },
    countLabel: { type: String, default: '' },
    expandLabel: { type: String, default: '' }
  },
  data() {
    return { expanded: false }
  },
  computed: {
    displayValues() {
      return this.items.map((value) => String(value ?? '-'))
    },
    compact() {
      return this.items.length > 3 || this.displayValues.some((value) => value.length > 100)
    }
  }
}
</script>

<style scoped>
.ticket-value-list {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  width: 100%;
  padding: 4px 0 16px;
  line-height: 22px;
}
.ticket-value-list__count {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.ticket-value-list__preview {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.ticket-value-list__preview.is-expanded {
  grid-column: 2;
  grid-row: 1;
}
.ticket-value-list__toggle {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--el-color-primary);
  font: inherit;
  line-height: 24px;
  cursor: pointer;
}
.ticket-value-list__toggle:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.ticket-value-list__toggle:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 3px;
}
.ticket-value-list__item {
  max-width: min(100%, 240px);
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.is-inline .ticket-value-list__item,
.ticket-value-list__names li {
  box-sizing: border-box;
  padding: 3px 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}
.is-inline .ticket-value-list__preview.is-expanded {
  grid-column: 1 / -1;
  grid-row: 3;
}
.ticket-value-list__names {
  grid-column: 1 / -1;
  grid-row: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  max-height: 168px;
  overflow-y: auto;
  overscroll-behavior: contain;
  list-style: none;
}
.ticket-value-list__names li {
  max-width: 100%;
  overflow-wrap: anywhere;
  color: var(--el-text-color-regular);
}
.ticket-value-list__results {
  grid-column: 1 / -1;
  min-width: 0;
  max-height: 280px;
  overflow-y: auto;
  overscroll-behavior: contain;
}
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
th,
td {
  padding: 8px 12px;
  text-align: left;
  overflow-wrap: anywhere;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
th {
  position: sticky;
  top: 0;
  background: var(--el-fill-color-light);
  font-weight: 500;
}
th:first-child,
td:first-child {
  width: 56px;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}
</style>
