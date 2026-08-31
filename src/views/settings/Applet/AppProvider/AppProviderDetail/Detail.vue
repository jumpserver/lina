<template>
  <el-row :gutter="20">
    <el-col :md="10" :sm="24">
      <div class="deployment-action">
        <el-button
          type="primary"
          :disabled="!object.host || !$hasPerm('terminal.add_appproviderdeployment')"
          @click="deploy"
        >
          {{ $t('Deploy') }} Panda
        </el-button>
      </div>
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import { openTaskPage } from '@/utils/jms/index'

export default {
  name: 'Detail',
  components: {
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      url: `/api/v1/terminal/app-providers/${this.object.id}`,
      detailFields: [
        'name',
        'hostname',
        'host',
        'runtime_type',
        'connection_mode',
        'service_url',
        'deploy_options',
        'load',
        'date_created',
        'date_updated',
        'comment'
      ]
    }
  },
  methods: {
    deploy() {
      this.$axios
        .post('/api/v1/terminal/app-provider-deployments/', {
          provider: this.object.id
        })
        .then((res) => openTaskPage(res.task))
    }
  }
}
</script>

<style scoped>
.deployment-action {
  margin-bottom: 16px;
}
</style>
