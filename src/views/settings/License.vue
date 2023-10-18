<template>
  <Page v-bind="$attrs">
    <div v-if="!loading">
      <el-alert v-if="!hasValidLicense" type="success">
        {{ this.$t('setting.ImportLicenseTip') }}
      </el-alert>
      <el-row :gutter="20">
        <el-col :md="14" :sm="24">
          <DetailCard :items="detailItems" :title="cardTitle" />
        </el-col>
        <el-col :md="10" :sm="24">
          <QuickActions :actions="quickActions" type="primary" />
        </el-col>
      </el-row>
      <Dialog
        :title="$tc('setting.ImportLicense')"
        :visible.sync="dialogLicenseImport"
        top="20vh"
        width="600px"
        @cancel="dialogLicenseImport = false"
        @confirm="importLicense"
      >
        <div style="padding-bottom: 10px">
          {{ this.$t('setting.LicenseFile') }}
        </div>
        <input type="file" @change="fileChange">
      </Dialog>
    </div>
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import { Dialog, QuickActions } from '@/components'
import DetailCard from '@/components/Cards/DetailCard/index'
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
      default: () => {
      }
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
        },
        {
          key: this.$t('assets.SerialNumber'),
          value: this.licenseData?.serial_no || ''
        },
        {
          key: this.$t('common.Comment'),
          value: this.licenseData?.remark || ''
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
