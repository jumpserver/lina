<template>
  <ListTable ref="ListTable" v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import ListTable from '@/components/ListTable/index'

export default {
  name: 'GenericListTable',
  components: {
    ListTable
  },
  computed: {
  },
  created() {
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
