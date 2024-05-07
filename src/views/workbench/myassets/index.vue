<template>
  <Page>
    <GrantedAssets :actions="actions" :table-url="tableUrl" :tree-url="treeUrl" />
  </Page>
</template>

<script>
import GrantedAssets from '@/components/Apps/GrantedAssets/index.vue'
import Page from '@/layout/components/Page/index.vue'

export default {
  components: {
    Page,
    GrantedAssets
  },
  data() {
    return {
      treeUrl: `/api/v1/perms/users/self/nodes/children/tree/`,
      tableUrl: `/api/v1/perms/users/self/assets/`,
      actions: {
        width: '88px',
        align: 'center',
        formatterArgs: {
          hasDelete: false,
          loading: true,
          hasClone: false,
          hasUpdate: false,
          extraActions: [
            {
              name: 'connect',
              icon: 'fa-terminal',
              type: 'primary',
              can: ({ row }) => row.is_active,
              callback: ({ row }) => {
                const oid = this.$store.getters.currentOrg ? this.$store.getters.currentOrg.id : ''
                const url = `/luna/?login_to=${row.id}${oid ? `&oid=${oid}` : ''}`
                window.open(url, '_blank')
              }
            },
            {
              name: 'favor',
              type: 'info',
              icon: ({ row }) => {
                return this.checkFavorite(row.id) ? 'fa-star' : 'fa-star-o'
              },
              callback: ({ row }) => this.toggleFavorite(row.id)
            }
          ]
        }
      },
      allFavorites: []
    }
  },
  mounted() {
    this.refreshAllFavorites()
  },
  methods: {
    refreshAllFavorites() {
      const formatterArgs = this.actions.formatterArgs
      formatterArgs.loading = true
      this.$axios.get('/api/v1/assets/favorite-assets/').then(resp => {
        this.allFavorites = resp
        formatterArgs.loading = false
      })
    },
    favor(assetId) {
      const data = { asset: assetId }
      const url = '/api/v1/assets/favorite-assets/'
      this.$axios.post(url, data).then(() => {
        this.allFavorites.push({ asset: assetId })
      })
    },
    disfavor(assetId) {
      const url = `/api/v1/assets/favorite-assets/?asset=${assetId}`
      this.$axios.delete(url).then(() => {
        this.allFavorites = this.allFavorites.filter(item => item['asset'] !== assetId)
      })
    },
    toggleFavorite(assetId) {
      const favorite = this.checkFavorite(assetId)
      if (favorite) {
        this.disfavor(assetId)
      } else {
        this.favor(assetId)
      }
    },
    checkFavorite(assetId) {
      let ok = false
      this.allFavorites.forEach(element => {
        if (element['asset'] === assetId) {
          ok = true
        }
      })
      return ok
    }
  }
}
</script>

<style>
  .el-card {
    border: 0 !important;
  }
  .row_disabled,.row_disabled:hover,.row_disabled:hover > td{
    cursor: not-allowed;
    background-color:rgba(192,196,204,0.28) !important;
  }

  .link-more {
    margin-left: 10px;
    border-bottom: solid 1px;
    font-size: 12px
  }
</style>
