<template>
  <IBox v-bind="$attrs">
    <slot name="describe" />
    <slot name="content" />
  </IBox>
</template>

<script>
import { IBox } from '@/components'

export default {
  name: 'RecordCard',
  components: {
    IBox
  }
}
</script>

<style lang="scss" scoped>
  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
</style>
