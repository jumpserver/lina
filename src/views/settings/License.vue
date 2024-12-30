<template>
  <Page v-bind="$attrs">
    <div v-if="!loading">
      <el-alert v-if="publicSettings.XPACK_ENABLED" type="success">
        {{ this.$t('ImportLicenseTip') }}
      </el-alert>
      <TwoCol>
        <template>
          <DetailCard :items="detailItems" :title="cardTitle" />
        </template>
        <template #right>
          <QuickActions :actions="quickActions" type="primary" />
        </template>
      </TwoCol>
      <Dialog
        :title="$tc('ImportLicense')"
        :visible.sync="dialogLicenseImport"
        top="20vh"
        width="600px"
        @cancel="dialogLicenseImport = false"
        @confirm="importLicense"
      >
        <div style="padding-bottom: 10px">
          {{ this.$t('LicenseFile') }}
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
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'License',
  components: {
    TwoCol,
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
          title: this.$t('ImportLicense'),
          attrs: {
            type: 'primary',
            label: this.$t('Import'),
            disabled: false
          },
          callbacks: {
            click: this.importAction
          }
        },
        {
          title: this.$t('TechnologyConsult'),
          attrs: {
            type: 'primary',
            label: this.$t('Consult')
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
            key: this.$t('Version'),
            value: this.$t('CommunityEdition')
          },
          {
            key: this.$t('Expired'),
            value: this.$t('Never')
          },
          {
            key: this.$t('License'),
            value: 'GPLv3'
          },
          {
            key: 'Github',
            formatter: () => {
              return (<a href='https://github.com/jumpserver/jumpserver' target='_blank'> JumpServer </a>)
            }
          }
        ]
      }
      return [
        {
          key: this.$t('SubscriptionID'),
          value: this.licenseData.subscription_id
        },
        {
          key: this.$t('Corporation'),
          value: this.licenseData.corporation
        },
        {
          key: this.$t('Expired'),
          value: this.licenseData.date_expired
        },
        {
          key: this.$t('AssetsOfNumber'),
          value: this.licenseData.asset_count !== null ? this.licenseData.asset_count + '' : ''
        },
        {
          key: this.$t('Edition'),
          value: this.licenseData.edition
        },
        {
          key: this.$t('SerialNumber'),
          value: this.licenseData?.serial_no || ''
        },
        {
          key: this.$t('Comment'),
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
