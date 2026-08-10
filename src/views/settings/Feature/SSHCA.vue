<template>
  <div>
    <el-alert :closable="false" :title="$t('OpenBaoSSHCAHelpText')" show-icon type="info" />
    <IBox>
      <GenericCreateUpdateForm v-bind="$data" />
    </IBox>
    <IBox v-if="publicKey" :title="$t('CAPublicKey')">
      <el-input :model-value="publicKey" :rows="4" readonly type="textarea" />
      <div class="public-key-actions">
        <el-button icon="CopyDocument" type="primary" @click="copyPublicKey">
          {{ $t('Copy') }}
        </el-button>
      </div>
    </IBox>
  </div>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import { GenericCreateUpdateForm } from '@/layout/components'
import { copy } from '@/utils/common/index'

export default {
  name: 'SSHCA',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    const vm = this
    return {
      url: '/api/v1/settings/setting/?category=ssh_ca',
      publicKey: '',
      hasReset: false,
      encryptedFields: ['SSH_CA_OPENBAO_TOKEN'],
      moreButtons: [
        {
          title: this.$t('Test'),
          loading: false,
          callback(value, form, btn) {
            vm.testConnection(value, btn)
          }
        },
        {
          title: this.$t('LoadCAPublicKey'),
          loading: false,
          callback(value, form, btn) {
            vm.loadPublicKey(btn)
          }
        }
      ],
      fields: [
        [
          this.$t('OpenBaoSSHCA'),
          [
            'SSH_CA_ENABLED',
            'SSH_CA_OPENBAO_ADDR',
            'SSH_CA_OPENBAO_TOKEN',
            'SSH_CA_OPENBAO_MOUNT_POINT',
            'SSH_CA_OPENBAO_ROLE',
            'SSH_CA_OPENBAO_TTL',
            'SSH_CA_OPENBAO_TIMEOUT',
            'SSH_CA_OPENBAO_VERIFY_TLS',
            'SSH_CA_OPENBAO_SOURCE_ADDRESS'
          ]
        ]
      ],
      fieldsMeta: {
        SSH_CA_OPENBAO_TOKEN: {
          el: {
            autocomplete: 'new-password'
          }
        },
        SSH_CA_OPENBAO_SOURCE_ADDRESS: {
          helpTextAsTip: true
        }
      },
      submitMethod() {
        return 'patch'
      }
    }
  },
  methods: {
    testConnection(value, btn) {
      btn.loading = true
      this.$axios
        .post('/api/v1/settings/ssh-ca/openbao/testing/', value)
        .then((res) => {
          this.publicKey = res.public_key
          this.$message.success(res.msg)
        })
        .finally(() => {
          btn.loading = false
        })
    },
    loadPublicKey(btn) {
      btn.loading = true
      this.$axios
        .get('/api/v1/settings/ssh-ca/openbao/public-key/')
        .then((res) => {
          this.publicKey = res.public_key
        })
        .finally(() => {
          btn.loading = false
        })
    },
    copyPublicKey() {
      copy(this.publicKey)
    }
  }
}
</script>

<style lang="scss" scoped>
.public-key-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
