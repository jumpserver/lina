<template>
  <div class="application-instances-expand">
    <ApplicationConnections
      :object="row"
      :credential-id="col.formatterArgs.credentialId"
      :show-wizard="false"
      embedded
    />
  </div>
</template>

<script>
import ApplicationConnections from './ApplicationConnections.vue'

export default {
  name: 'ApplicationInstancesExpand',
  components: { ApplicationConnections },
  props: {
    row: { type: Object, required: true },
    col: { type: Object, required: true }
  }
}
</script>

<style lang="scss" scoped>
.application-instances-expand {
  min-width: 0;
  padding: 12px 16px;
  background-color: var(--el-fill-color-light);
}
</style>
