<template>
  <DataTable v-if="!loading" ref="dataTable" v-loading="loading" :config="iConfig" v-bind="$attrs" v-on="$listeners" @filter-change="filterChange" />
</template>

<script type="text/jsx">
import DataTable from '../DataTable'
import { mapGetters } from 'vuex'
export default {
  name: 'AutoDataTable',
  components: {
    DataTable
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    filterTable: {
      type: Function,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: true
    }
  },
  computed: {
    iConfig() {
      return _.get(this.tableConfig, this.$route.name, {})
    },
    ...mapGetters([
      'tableConfig'
    ])
  },
  watch: {
    config: {
      handler(iNew) {
        this.optionUrlMetaAndGenCols()
        this.$log.debug('AutoDataTable Config change found')
      },
      deep: true
    }
  },
  created() {
    this.optionUrlMetaAndGenCols()
  },
  methods: {
    optionUrlMetaAndGenCols() {
      this.$store.dispatch('table/generateTableConfig', {
        config: this.config,
        name: this.$route.name
      }).catch((error) => {
        this.$log.error('Error occur: ', error)
      }).finally(() => {
        this.loading = false
      })
    },
    filterChange(filters) {
      const key = Object.keys(filters)[0]
      const attr = {}
      attr[key] = filters[key][0]
      this.filterTable(attr)
    }
  }
}
</script>

<style scoped>

</style>
