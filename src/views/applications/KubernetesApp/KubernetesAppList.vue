<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/applications/k8s-apps/',
        columns: [
          'name', 'cluster', 'comment', 'actions'
        ],
        columnsMeta: {
          comment: {
            width: '340px'
          }
        }
      },
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false,
        createRoute: 'KubernetesAppCreate',
        moreActionsTitle: this.$t('common.Create'),
        moreActionsType: 'primary',
        extraMoreActions: [
          {
            name: 'Kubernetes',
            title: 'Kubernetes',
            type: 'primary',
            can: true,
            callback: this.createKubernetes.bind(this)
          }
        ]
      }
    }
  },
  methods: {
    createKubernetes() {
      this.$router.push({ name: 'KubernetesAppCreate', query: { type: 'Kubernetes' }})
    }
  }
}
</script>

<style>

</style>
