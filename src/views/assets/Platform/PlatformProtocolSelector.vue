<template>
  <div class="platform-protocol-selector">
    <ProtocolSelector v-bind="$attrs" :choices="loginChoices" />
    <template v-if="httpEndpoint">
      <el-input :model-value="httpEndpoint.port" readonly :aria-label="httpEndpoint.display_name">
        <template #prepend>{{ httpEndpoint.display_name }}</template>
      </el-input>
      <div class="help-block">{{ $t('ClickHousePlatformHTTPHelp') }}</div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProtocolSelector from '@/components/Form/FormFields/ProtocolSelector'
import { CLICKHOUSE_HTTP_PROTOCOL, withClickHouseEndpoints } from '../assetProtocols'

defineOptions({ inheritAttrs: false })
const props = defineProps({ choices: { type: Array, default: () => [] } })
const endpoints = computed(() => withClickHouseEndpoints(props.choices))
const httpEndpoint = computed(() =>
  endpoints.value.find((p) => p.name === CLICKHOUSE_HTTP_PROTOCOL)
)
// Only real login protocols belong in v-model and in a platform POST/PATCH.
const loginChoices = computed(() =>
  endpoints.value.filter((p) => p.name !== CLICKHOUSE_HTTP_PROTOCOL)
)
</script>

<style scoped>
.platform-protocol-selector {
  width: 100%;
}
</style>
