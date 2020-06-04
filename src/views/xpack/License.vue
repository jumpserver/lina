<template>
  <div>
    <GenericDetailPage :object.sync="licenseData" v-bind="config">
      <div>
        <el-alert v-if="!isValidateLicense" type="success">
          {{ this.$t('xpack.ImportLicenseTip') }}
        </el-alert>
        <el-row :gutter="20">
          <el-col :span="14">
            <DetailCard :title="cardTitle" :items="detailItems" />
          </el-col>
          <el-col :span="10">
            <QuickActions type="primary" :actions="quickActions" />
          </el-col>
        </el-row>
      </div>
    </GenericDetailPage>
    <el-dialog :visible.sync="dialogLicenseImport" center>
      <div slot="title">
        <h4>{{ this.$t('xpack.ImportLicense') }}</h4>
      </div>
      {{ this.$t('xpack.LicenseFile') }}
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
import { GenericDetailPage } from '@/layout/components'
import { QuickActions } from '@/components'
import DetailCard from '@/components/DetailCard/index'
import { importLicense } from '@/views/xpack/api'
import { mapGetters } from 'vuex'

export default {
  name: 'License',
  components: {
    GenericDetailPage,
    DetailCard,
    QuickActions
  },
  data() {
    return {
      dialogLicenseImport: false,
      licenseData: {},
      licenseFile: {},
      config: {
        activeMenu: 'detail',
        submenu: [
          {
            title: this.$t('xpack.LicenseDetail'),
            name: 'detail'
          }
        ],
        hasRightSide: false,
        title: this.$t('xpack.LicenseDetail'),
        actions: {
          detailApiUrl: '/api/v1/xpack/license/detail'
        }
      },
      quickActions: [
        {
          title: this.$t('xpack.ImportLicense'),
          attrs: {
            type: 'primary',
            label: this.$t('xpack.import')
          },
          callbacks: {
            click: this.importAction

          }
        },
        {
          title: this.$t('xpack.technologyConsult'),
          attrs: {
            type: 'primary',
            label: this.$t('xpack.consult')
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
      return this.publicSettings.XPACK_LICENSE_IS_VALID
    },
    cardTitle() {
      return ''
    },
    detailItems() {
      if (!this.publicSettings.XPACK_LICENSE_IS_VALID) {
        return [
          {
            key: this.$t('xpack.License'),
            value: this.$t('xpack.NoLicense')
          }
        ]
      }
      return [
        {
          key: this.$t('xpack.SubscriptionID'),
          value: this.licenseData.subscription_id
        },
        {
          key: this.$t('xpack.Corporation'),
          value: this.licenseData.corporation
        },
        {
          key: this.$t('xpack.Expired'),
          value: this.licenseData.expired
        },
        {
          key: this.$t('xpack.AssetCount'),
          value: this.licenseData.asset_count !== null ? this.licenseData.asset_count + '' : ''
        },
        {
          key: this.$t('xpack.Edition'),
          value: this.licenseData.edition
        }
      ]
    }
  },
  methods: {
    importAction: function() {
      this.dialogLicenseImport = true
    },
    consultAction: function() {
      const url = 'http://www.jumpserver.org/support/'
      window.open(url)
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
