<template>
  <div v-if="!loading">
    <el-alert v-if="!isValidateLicense" type="success">
      {{ this.$t('setting.ImportLicenseTip') }}
    </el-alert>
    <el-row :gutter="20">
      <el-col :span="14">
        <DetailCard :title="cardTitle" :items="detailItems" />
      </el-col>
      <el-col :span="10">
        <QuickActions type="primary" :actions="quickActions" />
      </el-col>
    </el-row>
    <el-dialog :visible.sync="dialogLicenseImport" center>
      <div slot="title">
        <h4>{{ this.$t('setting.ImportLicense') }}</h4>
      </div>
      {{ this.$t('setting.LicenseFile') }}
      <br>
      <input type="file" @change="fileChange">
      <div slot="footer">
        <el-button @click="dialogLicenseImport = false">{{ $t('common.Cancel') }}</el-button>
        <el-button type="primary" @click="importLicense">{{ $t('common.Confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { QuickActions } from '@/components'
import DetailCard from '@/components/DetailCard/index'
import { importLicense } from '@/views/xpack/api'
import { mapGetters } from 'vuex'

export default {
  name: 'License',
  components: {
    DetailCard,
    QuickActions
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
            label: this.$t('setting.import')
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
      'publicSettings'
    ]),
    isValidateLicense() {
      if (this.publicSettings.XPACK_ENABLED) {
        return this.publicSettings.XPACK_LICENSE_IS_VALID
      }
      return true
    },
    cardTitle() {
      return ''
    },
    detailItems() {
      if (!this.publicSettings.XPACK_LICENSE_IS_VALID) {
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
          value: this.licenseData.expired
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
    if (this.publicSettings.XPACK_LICENSE_IS_VALID) {
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
