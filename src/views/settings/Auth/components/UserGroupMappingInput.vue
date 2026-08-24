<template>
  <div class="mapping-input">
    <div class="mapping-table">
      <div v-if="rows.length" class="mapping-header" aria-hidden="true">
        <span>{{ $t('LDAPGroupValue') }}</span>
        <span>{{ $t('UserGroup') }}</span>
        <span>{{ $t('Actions') }}</span>
      </div>

      <div v-if="!rows.length" class="mapping-empty">
        {{ $t('NoMappingRules') }}
      </div>

      <div
        v-for="(row, index) in rows"
        :key="row._key"
        :class="['mapping-row', { 'is-invalid': rowErrors[index]?.length }]"
      >
        <div class="mapping-cell">
          <span class="responsive-label">{{ $t('LDAPGroupValue') }}</span>
          <el-input
            v-model="row.value"
            :aria-label="$t('LDAPGroupValue')"
            :maxlength="4096"
            :placeholder="$t('LDAPGroupValuePlaceholder')"
            clearable
            size="small"
            @input="emitRows"
          />
        </div>

        <div class="mapping-cell">
          <span class="responsive-label">{{ $t('UserGroup') }}</span>
          <Select2
            :ajax="groupAjax"
            :aria-label="$t('UserGroup')"
            :model-value="row.user_group_id"
            :multiple="false"
            :placeholder="$t('UserGroup')"
            size="small"
            @input="updateRow(row, 'user_group_id', $event)"
          />
        </div>

        <div class="mapping-cell mapping-row-actions">
          <span class="responsive-label">{{ $t('Actions') }}</span>
          <el-button
            :aria-label="`${$t('Delete')} ${$t('UserGroupMapping')} ${index + 1}`"
            link
            size="small"
            type="danger"
            @click="removeRow(index)"
          >
            {{ $t('Delete') }}
          </el-button>
        </div>

        <div v-if="rowErrors[index]?.length" class="mapping-row-error" role="alert">
          {{ errorMessage(rowErrors[index][0]) }}
        </div>
      </div>
    </div>

    <div class="mapping-actions">
      <el-button icon="Plus" size="small" type="primary" @click="addRow">
        {{ $t('Add') }}
      </el-button>
    </div>
  </div>
</template>

<script>
import Select2 from '@/components/Form/FormFields/Select2.vue'
import { MappingError, getGroupMappingErrors, normalizeGroupMappings } from './mapping'

let mappingRowSequence = 0

export default {
  name: 'UserGroupMappingInput',
  components: { Select2 },
  inheritAttrs: false,
  emits: ['input'],
  props: {
    value: {
      type: Array,
      default: () => []
    },
    modelValue: {
      type: Array,
      default: undefined
    }
  },
  data() {
    return {
      rows: [],
      groupAjax: {
        url: '/api/v1/settings/authentication/mapping-options/?type=user_group',
        transformOption: (item) => ({
          label: item.label,
          value: item.id
        })
      }
    }
  },
  created() {
    this.rows = this.toLocalRows(this.externalValue)
  },
  computed: {
    externalValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    serializedRows() {
      return this.rows.map(({ _key, ...row }) => row)
    },
    rowErrors() {
      return getGroupMappingErrors(this.serializedRows)
    }
  },
  watch: {
    externalValue: {
      deep: true,
      handler(value) {
        const external = normalizeGroupMappings(value, { trim: false })
        if (JSON.stringify(external) !== JSON.stringify(this.serializedRows)) {
          this.rows = this.toLocalRows(external)
        }
      }
    }
  },
  methods: {
    toLocalRows(value) {
      return normalizeGroupMappings(value, { trim: false }).map((row) => ({
        ...row,
        _key: `user-group-mapping-${mappingRowSequence++}`
      }))
    },
    emitRows() {
      this.rows = normalizeGroupMappings(this.rows, { trim: false })
      this.$emit('input', this.serializedRows)
    },
    updateRow(row, field, value) {
      row[field] = value
      this.emitRows()
    },
    addRow() {
      this.rows.push({
        value: '',
        user_group_id: '',
        _key: `user-group-mapping-${mappingRowSequence++}`
      })
      this.emitRows()
    },
    removeRow(index) {
      this.rows.splice(index, 1)
      this.emitRows()
    },
    errorMessage(error) {
      const keys = {
        [MappingError.required]: 'MappingRowRequired',
        [MappingError.duplicate]: 'DuplicateMapping',
        [MappingError.fallback]: 'WildcardGroupMappingInvalid'
      }
      return this.$t(keys[error] || 'InvalidLDAPGroupMapping')
    }
  }
}
</script>

<style lang="scss" scoped>
.mapping-input,
.mapping-table {
  width: 100%;
}

.mapping-table {
  border: 1px solid var(--el-border-color-light);
}

.mapping-header,
.mapping-row {
  display: grid;
  grid-template-columns: minmax(260px, 1.4fr) minmax(220px, 1fr) 90px;
  column-gap: 12px;
  align-items: center;
  padding: 8px 12px;
}

.mapping-header {
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  font-weight: 600;
}

.mapping-row + .mapping-row {
  border-top: 1px solid var(--el-border-color-lighter);
}

.mapping-row.is-invalid {
  background: var(--el-color-danger-light-9);
}

.mapping-cell {
  min-width: 0;
}

.mapping-row-actions {
  text-align: center;
}

.mapping-empty {
  padding: 22px 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.mapping-row-error {
  grid-column: 1 / -1;
  margin-top: 6px;
  color: var(--el-color-danger);
  font-size: 12px;
  line-height: 1.4;
}

.mapping-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.responsive-label {
  display: none;
  margin-bottom: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: 600;
}

@container data-form (max-width: 640px) {
  .mapping-header {
    display: none;
  }

  .mapping-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }

  .mapping-row-actions {
    text-align: left;
  }

  .responsive-label {
    display: block;
  }
}
</style>
