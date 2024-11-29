<template>
  <div>
    <CardTable
      ref="table"
      :columns="3"
      :sub-component="subComponent"
      v-bind="$attrs"
    />
  </div>
</template>

<script type="text/jsx">
import CardTable from '@/components/Table/CardTable'
import CardPanel from './components/CardPanel.vue'

export default {
  name: 'SmallCard',
  components: {
    CardTable
  },
  data() {
    return {
      subComponent: CardPanel
    }
  },
  methods: {
    reloadTable() {
      this.$refs.table.reloadTable()
    }
  }
}
</script>
