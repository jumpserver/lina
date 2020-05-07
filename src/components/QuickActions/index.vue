<template>
  <IBox fa="fa-edit" :title="title" v-bind="$attrs">
    <div class="quick-actions">
      <slot />
    </div>
  </IBox>
</template>

<script>
import { IBox } from '@/components'

export default {
  name: 'QuickActions',
  components: {
    IBox
  },
  props: {
    title: {
      type: String,
      default() {
        return this.$tc('Quick update')
      }
    }
  }
}
</script>

<style scoped>
  .quick-actions >>> table {
    width: 100%;
  }
  .quick-actions >>> tr > td {
    line-height: 1.43;
    padding: 8px;
    vertical-align: top;
    font-size: 13px;
    width: 50%;
  }

  .quick-actions >>> tr > td > span:last-child {
    float: right;
  }

  .quick-actions >>> button {
    padding: 1px 13px;
  }
</style>
