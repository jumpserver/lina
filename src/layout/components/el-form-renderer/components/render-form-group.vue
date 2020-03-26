<template>
  <div>
    <template v-for="(item, index) in data.items">
      <slot :name="`id:${item.id}`" />
      <slot :name="`$id:${item.id}`" />
      <render-form-item
        :key="index"
        :prop="`${data.id}.${item.id}`"
        :data="item"
        :value="value"
        :item-value="itemValue[item.id]"
        :disabled="disabled"
        :readonly="readonly"
        :options="options[item.id]"
        @updateValue="updateValue"
      />
    </template>
  </div>
</template>
<script>
/* eslint-disable vue/require-default-prop */
/* eslint-disable vue/require-prop-types */

import RenderFormItem from './render-form-item.vue'

export default {
  components: {
    RenderFormItem
  },
  props: {
    data: Object,
    itemValue: {},
    value: Object,
    disabled: Boolean,
    readonly: Boolean,
    options: Object
  },
  methods: {
    updateValue({ id, value }) {
      this.$emit('updateValue', {
        id: this.data.id,
        value: {
          ...this.itemValue,
          [id]: value
        }
      })
    }
  }
}
</script>
