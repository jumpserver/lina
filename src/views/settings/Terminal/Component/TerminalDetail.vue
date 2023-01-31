<template>
  <GenericDetailPage :object.sync="terminalData" v-bind="config">
    <div>
      <el-row :gutter="20">
        <el-col :md="14" :sm="24">
          <AutoDetailCard :url="url" :object="terminalData" />
        </el-col>
      </el-row>
    </div>
  </GenericDetailPage>

</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AutoDetailCard from '@/components/DetailCard/auto'

export default {
  name: 'TerminalDetail',
  components: {
    GenericDetailPage,
    AutoDetailCard
  },
  data() {
    return {
      terminalData: {},
      loading: true,
      config: {
        submenu: [
          {
            title: this.$t('sessions.terminalDetail'),
            name: 'detail'
          }
        ],
        hasDelete: false,
        actions: {
          canUpdate: this.$hasPerm('terminal.change_terminal'),
          hasDelete: false,
          canDelete: false,
          detailApiUrl: `/api/v1/terminal/terminals/${this.$route.params.id}/`
        }
      },
      url: `/api/v1/terminal/terminals/${this.$route.params.id}/`
    }
  },
  computed: {
    cardTitle() {
      return this.terminalData.name
    }
  }
}
</script>

<style scoped>

</style>
