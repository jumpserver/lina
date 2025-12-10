<template>
  <div class="providers-card">
    <div class="providers-header">
      <el-button size="mini" type="primary" icon="el-icon-plus" @click="addProvider">
        {{ $t('Add') }}
      </el-button>
    </div>
    <el-table :data="localProviders" size="mini" border>
      <el-table-column :label="$t('Type')" width="140">
        <template #default="{ row }">
          <el-select v-model="row.type" size="mini" @change="emitChange">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Base URL')" min-width="200">
        <template #default="{ row }">
          <el-input
            v-model="row.base_url"
            size="mini"
            :placeholder="openAIBaseUrl"
            @input="emitChange"
          />
        </template>
      </el-table-column>
      <el-table-column :label="$t('API Key')" min-width="180">
        <template #default="{ row }">
          <el-input
            v-model="row.api_key"
            size="mini"
            show-password
            autocomplete="new-password"
            @input="emitChange"
          />
        </template>
      </el-table-column>
      <el-table-column :label="$t('Proxy')" min-width="160">
        <template #default="{ row }">
          <el-input
            v-model="row.proxy"
            size="mini"
            placeholder="http://ip:port"
            @input="emitChange"
          />
        </template>
      </el-table-column>
      <el-table-column :label="$t('Actions')" width="100" align="center">
        <template #default="{ $index }">
          <el-button
            size="mini"
            type="text"
            class="danger-text"
            icon="el-icon-delete"
            @click="removeProvider($index)"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'ChatProvidersField',
  props: {
    value: {
      type: [Object, Array],
      default: () => ({ providers: [], defaultProvider: '' })
    },
    typeOptions: {
      type: Array,
      default: () => ([
        { label: 'Ollama', value: 'ollama' },
        { label: 'OpenAI', value: 'openai' }
      ])
    }
  },
  data() {
    const { providers, defaultProvider } = this.normalizeValue(this.value)
    return {
      localProviders: providers,
      defaultProvider: this.pickDefault(defaultProvider, providers),
      openAIBaseUrl: 'https://api.openai.com/v1'
    }
  },
  watch: {
    value: {
      handler(v) {
        const { providers, defaultProvider } = this.normalizeValue(v)
        this.localProviders = providers
        this.defaultProvider = this.pickDefault(defaultProvider, providers) || ''
      },
      deep: true
    }
  },
  methods: {
    emptyProvider() {
      return {
        type: 'openai',
        base_url: this.openAIBaseUrl,
        api_key: '',
        proxy: ''
      }
    },
    normalizeValue(v) {
      if (!v) {
        return { providers: [], defaultProvider: '' }
      }
      // allow legacy array value
      if (Array.isArray(v)) {
        return { providers: cloneDeep(v), defaultProvider: '' }
      }
      const providers = Array.isArray(v.providers) ? cloneDeep(v.providers) : []
      return { providers, defaultProvider: v.defaultProvider || '' }
    },
    pickDefault(current, providers) {
      const enabledProviders = providers.filter(item => item?.enabled !== false)
      if (current && providers.some(item => item.name === current)) {
        return current
      }
      return enabledProviders[0]?.name || providers[0]?.name || ''
    },
    emitChange() {
      const providers = cloneDeep(this.localProviders || [])
      const defaultProvider = this.pickDefault(this.defaultProvider, providers)
      this.defaultProvider = defaultProvider
      this.$emit('input', { providers, defaultProvider })
      this.$emit('change', { providers, defaultProvider })
    },
    handleAssistantChange(current) {
      this.emitChange()
    },
    addProvider() {
      this.localProviders.push(this.emptyProvider())
      this.emitChange()
    },
    removeProvider(index) {
      this.localProviders.splice(index, 1)
      this.emitChange()
    },
    setDefault(name) {
      this.defaultProvider = name
      this.emitChange()
    }
  }
}
</script>

<style scoped lang="scss">
.providers-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
}

.providers-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  .title {
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tip {
    color: #909399;
    font-weight: 400;
    font-size: 12px;
  }
}

.danger-text {
  color: #f56c6c;
}
</style>
