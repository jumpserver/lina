<template>
  <div class="mapping-input">
    <div class="mapping-table">
      <div v-if="rows.length" class="mapping-header" aria-hidden="true">
        <span>{{ $t('LDAPAttribute') }}</span>
        <span>{{ $t('MatchValue') }}</span>
        <span>{{ $t('RoleScope') }}</span>
        <span>{{ $t('Organization') }}</span>
        <span>{{ $t('Role') }}</span>
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
          <span class="responsive-label">{{ $t('LDAPAttribute') }}</span>
          <el-select
            v-model="row.attribute"
            :aria-label="$t('LDAPAttribute')"
            :disabled="isWildcard(row)"
            :placeholder="$t('LDAPAttribute')"
            allow-create
            clearable
            default-first-option
            filterable
            size="small"
            @change="emitRows"
          >
            <el-option
              v-for="attribute in normalizedAttributeOptions"
              :key="attribute"
              :label="attribute"
              :value="attribute"
            />
          </el-select>
        </div>

        <div class="mapping-cell">
          <span class="responsive-label">{{ $t('MatchValue') }}</span>
          <el-input
            v-model="row.value"
            :aria-label="$t('MatchValue')"
            :maxlength="4096"
            :placeholder="$t('MatchValue')"
            clearable
            size="small"
            @input="emitRows"
          />
        </div>

        <div class="mapping-cell">
          <span class="responsive-label">{{ $t('RoleScope') }}</span>
          <el-select
            v-model="row.scope"
            :aria-label="$t('RoleScope')"
            size="small"
            @change="changeScope(row, $event)"
          >
            <el-option
              v-for="option in scopeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>

        <div class="mapping-cell">
          <span class="responsive-label">{{ $t('Organization') }}</span>
          <Select2
            v-if="row.scope === 'org'"
            :ajax="organizationAjax"
            :aria-label="$t('Organization')"
            :model-value="row.org_id"
            :multiple="false"
            :placeholder="$t('Organization')"
            size="small"
            @input="updateRow(row, 'org_id', $event)"
          />
          <span v-else class="not-applicable">—</span>
        </div>

        <div class="mapping-cell">
          <span class="responsive-label">{{ $t('Role') }}</span>
          <Select2
            :key="`${row._key}-${row.scope}`"
            :ajax="row.scope === 'org' ? orgRoleAjax : systemRoleAjax"
            :aria-label="$t('Role')"
            :model-value="row.role_id"
            :multiple="false"
            :placeholder="$t('Role')"
            size="small"
            @input="updateRow(row, 'role_id', $event)"
          />
        </div>

        <div class="mapping-cell mapping-row-actions">
          <span class="responsive-label">{{ $t('Actions') }}</span>
          <el-button
            :aria-label="`${$t('Delete')} ${$t('RoleMapping')} ${index + 1}`"
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
import {
  MappingError,
  getRoleMappingErrors,
  isFallbackMapping,
  normalizeRoleMappings
} from './mapping'

let mappingRowSequence = 0

export default {
  name: 'UserRoleMappingInput',
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
    },
    attributeOptions: {
      type: Array,
      default: () => ['dn', 'groups', 'memberOf', 'department', 'title', 'employeeType']
    }
  },
  data() {
    return {
      rows: [],
      organizationAjax: {
        url: '/api/v1/settings/authentication/mapping-options/?type=organization',
        transformOption: (item) => ({
          label: item.label,
          value: item.id
        })
      },
      systemRoleAjax: {
        url: '/api/v1/settings/authentication/mapping-options/?type=system_role',
        transformOption: (item) => ({
          label: item.label,
          value: item.id
        })
      },
      orgRoleAjax: {
        url: '/api/v1/settings/authentication/mapping-options/?type=org_role',
        transformOption: (item) => ({
          label: item.label,
          value: item.id
        })
      }
    }
  },
  computed: {
    externalValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    serializedRows() {
      return this.rows.map(({ _key, ...row }) => row)
    },
    rowErrors() {
      return getRoleMappingErrors(this.serializedRows)
    },
    normalizedAttributeOptions() {
      return [...new Set(this.attributeOptions.filter((item) => typeof item === 'string'))]
    },
    scopeOptions() {
      return [
        { label: this.$t('System'), value: 'system' },
        { label: this.$t('Organization'), value: 'org' }
      ]
    }
  },
  watch: {
    externalValue: {
      deep: true,
      handler(value) {
        const external = normalizeRoleMappings(value, { trim: false })
        if (JSON.stringify(external) !== JSON.stringify(this.serializedRows)) {
          this.rows = this.toLocalRows(external)
        }
      }
    }
  },
  created() {
    this.rows = this.toLocalRows(this.externalValue)
  },
  methods: {
    isWildcard: isFallbackMapping,
    toLocalRows(value) {
      return normalizeRoleMappings(value, { trim: false }).map((row) => ({
        ...row,
        _key: `user-role-mapping-${mappingRowSequence++}`
      }))
    },
    emitRows() {
      this.rows = normalizeRoleMappings(this.rows, { trim: false })
      this.$emit('input', this.serializedRows)
    },
    updateRow(row, field, value) {
      row[field] = value
      this.emitRows()
    },
    changeScope(row, scope) {
      row.scope = scope
      row.role_id = ''
      row.org_id = null
      this.emitRows()
    },
    addRow() {
      this.rows.push({
        attribute: '',
        value: '',
        scope: 'system',
        role_id: '',
        org_id: null,
        _key: `user-role-mapping-${mappingRowSequence++}`
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
        [MappingError.attribute]: 'InvalidLDAPAttribute',
        [MappingError.duplicate]: 'DuplicateMapping',
        [MappingError.fallback]: 'WildcardRoleMappingInvalid'
      }
      return this.$t(keys[error] || 'InvalidLDAPRoleMapping')
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
  grid-template-columns:
    minmax(150px, 1.1fr) minmax(180px, 1.4fr) 125px minmax(150px, 1fr)
    minmax(150px, 1fr) 80px;
  column-gap: 10px;
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

.mapping-cell :deep(.el-select) {
  width: 100%;
}

.not-applicable {
  color: var(--el-text-color-placeholder);
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

@container data-form (max-width: 1100px) {
  .mapping-header {
    display: none;
  }

  .mapping-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 12px;
  }

  .mapping-row-actions {
    text-align: left;
  }

  .responsive-label {
    display: block;
  }
}

@container data-form (max-width: 640px) {
  .mapping-row {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
