<template>
  <div class="attribute-mapping">
    <div class="mapping-header" aria-hidden="true">
      <span>{{ $t('JumpServerUserField') }}</span>
      <span>{{ $t('LDAPAttribute') }}</span>
    </div>
    <div
      v-for="field in fields"
      :key="field.value"
      :class="['mapping-row', { 'is-invalid': hasAttributeError(mapping[field.value]) }]"
    >
      <label :for="inputId(field.value)" class="mapping-label">
        {{ field.label }}
        <span v-if="field.required" class="required-mark" aria-hidden="true">*</span>
      </label>
      <div class="mapping-control">
        <el-input
          :id="inputId(field.value)"
          :aria-describedby="hasAttributeError(mapping[field.value]) ? errorId(field.value) : null"
          :aria-invalid="hasAttributeError(mapping[field.value])"
          :model-value="mapping[field.value] || ''"
          :placeholder="field.placeholder || $t('LDAPAttributePlaceholder')"
          clearable
          @input="updateMapping(field.value, $event)"
        />
        <div
          v-if="hasAttributeError(mapping[field.value])"
          :id="errorId(field.value)"
          class="mapping-row-error"
          role="alert"
        >
          {{ $t('InvalidLDAPAttribute') }}
        </div>
      </div>
    </div>
    <div
      v-for="item in extraMappings"
      :key="item.field"
      :class="['mapping-row', { 'is-invalid': hasAttributeError(item.rawAttribute) }]"
    >
      <span class="mapping-label">
        {{ item.field }}
        <el-tag effect="plain" size="small" type="warning">
          {{ $t('UnsupportedAttributeMapping') }}
        </el-tag>
      </span>
      <div class="mapping-control">
        <div class="unsupported-mapping">
          <el-input
            :aria-describedby="hasAttributeError(item.rawAttribute) ? errorId(item.field) : null"
            :aria-invalid="hasAttributeError(item.rawAttribute)"
            :model-value="item.attribute"
            disabled
          />
          <el-button
            :aria-label="`${$t('Delete')} ${item.field}`"
            plain
            type="danger"
            @click="removeMapping(item.field)"
          >
            {{ $t('Delete') }}
          </el-button>
        </div>
        <div
          v-if="hasAttributeError(item.rawAttribute)"
          :id="errorId(item.field)"
          class="mapping-row-error"
          role="alert"
        >
          {{ $t('InvalidLDAPAttribute') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isValidLDAPAttribute } from './mapping'

export default {
  name: 'AttributeMappingInput',
  inheritAttrs: false,
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    fields: {
      type: Array,
      default: () => []
    }
  },
  emits: ['input'],
  computed: {
    mapping() {
      return this.value && typeof this.value === 'object' ? this.value : {}
    },
    extraMappings() {
      const knownFields = new Set(this.fields.map((field) => field.value))
      return Object.entries(this.mapping)
        .filter(([field]) => !knownFields.has(field))
        .map(([field, attribute]) => ({
          field,
          attribute: typeof attribute === 'string' ? attribute : JSON.stringify(attribute),
          rawAttribute: attribute
        }))
    }
  },
  methods: {
    inputId(field) {
      return `attribute-mapping-${field}`
    },
    errorId(field) {
      return `${this.inputId(field)}-error`
    },
    hasAttributeError(value) {
      return value !== undefined && !isValidLDAPAttribute(value)
    },
    updateMapping(field, value) {
      const mapping = { ...this.mapping }
      const attribute = value.trim()
      if (attribute) {
        mapping[field] = attribute
      } else {
        delete mapping[field]
      }
      this.$emit('input', mapping)
    },
    removeMapping(field) {
      const mapping = { ...this.mapping }
      delete mapping[field]
      this.$emit('input', mapping)
    }
  }
}
</script>

<style lang="scss" scoped>
.attribute-mapping {
  width: 100%;
  border: 1px solid var(--el-border-color-light);
}

.mapping-header,
.mapping-row {
  display: grid;
  grid-template-columns: minmax(150px, 0.7fr) minmax(240px, 1.3fr);
  column-gap: 16px;
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

.mapping-label {
  margin: 0;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.required-mark {
  color: var(--el-color-danger);
}

.mapping-label .el-tag {
  margin-left: 8px;
}

.unsupported-mapping {
  display: flex;
  gap: 8px;
}

.mapping-control {
  min-width: 0;
}

.mapping-row-error {
  margin-top: 4px;
  color: var(--el-color-danger);
  font-size: 12px;
  line-height: 1.4;
}

@container data-form (max-width: 640px) {
  .mapping-header {
    display: none;
  }

  .mapping-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
