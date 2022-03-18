<template>
  <Page v-bind="$attrs">
    <div v-if="!loading">
      <el-alert v-if="!hasValidLicense" type="success">
        {{ this.$t('setting.ImportLicenseTip') }}
      </el-alert>
      <el-row :gutter="20">
        <el-col :md="14" :sm="24">
          <DetailCard :title="cardTitle" :items="detailItems" />
        </el-col>
        <el-col :md="10" :sm="24">
          <QuickActions type="primary" :actions="quickActions" />
        </el-col>
      </el-row>
      <Dialog
        :visible.sync="dialogLicenseImport"
        top="20vh"
        :title="this.$t('setting.ImportLicense')"
        @cancel="dialogLicenseImport = false"
        @confirm="importLicense"
      >
        {{ this.$t('setting.LicenseFile') }}
        <br>
        <input type="file" @change="fileChange">
      </Dialog>
    </div>
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import { QuickActions, Dialog } from '@/components'
import DetailCard from '@/components/DetailCard/index'
import { importLicense } from '@/api/settings'
import { mapGetters } from 'vuex'

export default {
  name: 'License',
  components: {
    Page,
    DetailCard,
    QuickActions,
    Dialog
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loading: true,
      dialogLicenseImport: false,
      licenseData: {},
      licenseFile: {},
      quickActions: [
        {
          title: this.$t('setting.ImportLicense'),
          attrs: {
            type: 'primary',
            label: this.$t('setting.import'),
            disabled: false
          },
          callbacks: {
            click: this.importAction
          }
        },
        {
          title: this.$t('setting.technologyConsult'),
          attrs: {
            type: 'primary',
            label: this.$t('setting.consult')
          },
          callbacks: {
            click: this.consultAction
          }
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'publicSettings', 'hasValidLicense'
    ]),
    cardTitle() {
      return ''
    },
    detailItems() {
      if (!this.hasValidLicense) {
        return [
          {
            key: this.$t('setting.License'),
            value: this.$t('setting.communityEdition')
          }
        ]
      }
      return [
        {
          key: this.$t('setting.SubscriptionID'),
          value: this.licenseData.subscription_id
        },
        {
          key: this.$t('setting.Corporation'),
          value: this.licenseData.corporation
        },
        {
          key: this.$t('setting.Expired'),
          value: this.licenseData.date_expired
        },
        {
          key: this.$t('setting.AssetCount'),
          value: this.licenseData.asset_count !== null ? this.licenseData.asset_count + '' : ''
        },
        {
          key: this.$t('setting.Edition'),
          value: this.licenseData.edition
        }
      ]
    }
  },
  mounted() {
    this.quickActions[0].attrs.disabled = !this.publicSettings.XPACK_ENABLED
    if (this.publicSettings.XPACK_ENABLED) {
      this.$axios.get('/api/v1/xpack/license/detail').then(res => {
        this.licenseData = res
      }).finally(() => {
        this.loading = false
      })
    } else {
      this.loading = false
    }
  },
  methods: {
    importAction: function() {
      this.dialogLicenseImport = true
    },
    consultAction: function() {
      const url = 'http://www.jumpserver.org/support/'
      window.open(url, '_blank')
    },
    importLicense() {
      if (this.licenseFile['file'] === undefined) {
        return
      }
      const formData = new FormData()
      formData.append('file', this.licenseFile['file'])
      importLicense(formData).then(res => {
        if (res.status) {
          this.$message.success(res.msg)
          setTimeout(() => location.reload(), 500)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    fileChange(e) {
      this.licenseFile['file'] = e.target.files[0]
    }
  }
}
</script>

<style scoped>

</style>
