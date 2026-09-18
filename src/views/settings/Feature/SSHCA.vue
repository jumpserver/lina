<template>
  <div class="ssh-ca-page">
    <div class="ssh-ca-layout">
      <IBox :title="$t('SSHCAConfiguration')" class="configuration-card">
        <template #header>
          <div class="card-heading">
            <div>
              <h3>{{ $t('SSHCAConfiguration') }}</h3>
              <p>{{ $t('SSHCAConfigurationHint') }}</p>
            </div>
          </div>
        </template>
        <GenericCreateUpdateForm class="ssh-ca-form" v-bind="$data" />
      </IBox>

      <aside class="ssh-ca-aside">
        <IBox :title="$t('CAPublicKey')" class="public-key-card">
          <template #header>
            <div class="card-heading public-key-heading">
              <div>
                <h3>{{ $t('CAPublicKey') }}</h3>
                <p>{{ $t('CAPublicKeyHint') }}</p>
              </div>
              <el-button
                v-if="publicKey"
                :loading="publicKeyLoading"
                circle
                plain
                :title="$t('Refresh')"
                @click="loadPublicKey"
              >
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>

          <template v-if="publicKey">
            <pre class="public-key-code"><code>{{ publicKey }}</code></pre>
            <div class="public-key-actions">
              <el-button plain type="primary" @click="copyPublicKey">
                <el-icon><CopyDocument /></el-icon>
                {{ $t('Copy') }}
              </el-button>
              <el-button @click="downloadPublicKey">
                <el-icon><Download /></el-icon>
                {{ $t('DownloadCAPublicKey') }}
              </el-button>
            </div>
          </template>
          <div v-else class="public-key-empty">
            <div class="empty-icon">
              <el-icon><Document /></el-icon>
            </div>
            <p>{{ $t('SSHCAKeyEmpty') }}</p>
            <el-button :loading="publicKeyLoading" plain type="primary" @click="loadPublicKey">
              {{ $t('LoadCAPublicKey') }}
            </el-button>
          </div>
        </IBox>

        <IBox :title="$t('SSHCAQuickGuide')" class="guide-card">
          <template #header>
            <div class="card-heading">
              <div>
                <h3>{{ $t('SSHCAQuickGuide') }}</h3>
              </div>
            </div>
          </template>
          <ol class="guide-steps">
            <li>
              <span>1</span>
              <p>{{ $t('SSHCAQuickGuideConnection') }}</p>
            </li>
            <li>
              <span>2</span>
              <p>{{ $t('SSHCAQuickGuideTrust') }}</p>
            </li>
            <li>
              <span>3</span>
              <p>{{ $t('SSHCAQuickGuideAccount') }}</p>
            </li>
          </ol>
        </IBox>

        <IBox :title="$t('SSHCALinuxSetup')" class="linux-setup-card">
          <template #header>
            <div class="card-heading">
              <div>
                <h3>{{ $t('SSHCALinuxSetup') }}</h3>
                <p>{{ $t('SSHCALinuxSetupHint') }}</p>
              </div>
            </div>
          </template>
          <ol class="linux-setup-steps">
            <li>
              <span class="step-number">1</span>
              <div>
                <p>{{ $t('SSHCALinuxInstallCA') }}</p>
                <code
                  >install -o root -g root -m 0644 jumpserver-openbao-ssh-ca.pub
                  /etc/ssh/jumpserver_user_ca.pub</code
                >
              </div>
            </li>
            <li>
              <span class="step-number">2</span>
              <div>
                <p>{{ $t('SSHCALinuxTrustCA') }}</p>
                <code>TrustedUserCAKeys /etc/ssh/jumpserver_user_ca.pub</code>
              </div>
            </li>
            <li>
              <span class="step-number">3</span>
              <div>
                <p>{{ $t('SSHCALinuxReload') }}</p>
                <code>sshd -t</code>
                <code>systemctl reload sshd</code>
                <small>{{ $t('SSHCALinuxReloadDebian') }}</small>
              </div>
            </li>
            <li>
              <span class="step-number">4</span>
              <div>
                <p>{{ $t('SSHCALinuxAccount') }}</p>
              </div>
            </li>
          </ol>
          <div class="authorized-keys-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ $t('SSHCALinuxAuthorizedKeys') }}</span>
          </div>
        </IBox>
      </aside>
    </div>
  </div>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import { GenericCreateUpdateForm } from '@/layout/components'
import { copy, downloadText } from '@/utils/common/index'
import { encryptPassword } from '@/utils/secure'

function isValidOpenBaoAddress(value) {
  const address = String(value || '').trim()
  if (!address || !/^[\x21-\x7e]+$/.test(address)) {
    return false
  }

  try {
    const url = new URL(address)
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname)
  } catch {
    return false
  }
}

function isValidIPv4Address(value) {
  const parts = value.split('.')
  return (
    parts.length === 4 &&
    parts.every((part) => {
      if (!/^\d{1,3}$/.test(part) || (part.length > 1 && part.startsWith('0'))) {
        return false
      }
      return Number(part) <= 255
    })
  )
}

function isValidIPv6Address(value) {
  try {
    const url = new URL(`http://[${value}]/`)
    return Boolean(url.hostname)
  } catch {
    return false
  }
}

function isValidCIDR(value) {
  const parts = value.split('/')
  if (
    parts.length !== 2 ||
    !/^\d{1,3}$/.test(parts[1]) ||
    (parts[1].length > 1 && parts[1].startsWith('0'))
  ) {
    return false
  }

  const [address, prefixText] = parts
  const prefix = Number(prefixText)
  if (address.includes(':')) {
    return prefix <= 128 && isValidIPv6Address(address)
  }
  return prefix <= 32 && isValidIPv4Address(address)
}

function isValidCIDRList(value) {
  const cidrs = String(value || '')
    .split(',')
    .map((item) => item.trim())

  return cidrs.length > 0 && cidrs.every((cidr) => cidr && isValidCIDR(cidr))
}

export default {
  name: 'SSHCA',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    const vm = this
    const validateOpenBaoAddress = (rule, value, callback) => {
      const address = String(value || '').trim()
      if (!address && !vm.testingConnection) {
        callback()
      } else if (!address) {
        callback(new Error(vm.$t('FieldRequiredError')))
      } else if (!isValidOpenBaoAddress(address)) {
        callback(new Error(vm.$t('FormatError')))
      } else {
        callback()
      }
    }
    const validateAllowedSources = (rule, value, callback) => {
      const sourceAddresses = String(value || '').trim()
      if (!sourceAddresses || isValidCIDRList(sourceAddresses)) {
        callback()
      } else {
        callback(new Error(vm.$t('FormatError')))
      }
    }
    return {
      url: '/api/v1/settings/setting/?category=ssh_ca',
      publicKey: '',
      publicKeyLoading: false,
      testingConnection: false,
      hasReset: false,
      hasDetailInMsg: false,
      labelWidth: '30%',
      submitBtnText: this.$t('Save'),
      encryptedFields: ['SSH_CA_OPENBAO_TOKEN'],
      moreButtons: [
        {
          title: this.$t('Test'),
          type: 'primary',
          plain: true,
          icon: 'Connection',
          loading: false,
          callback(value, form, btn) {
            vm.testConnection(value, form, btn)
          }
        }
      ],
      fields: [
        [
          this.$t('SSHCAConnectionSettings'),
          [
            'SSH_CA_ENABLED',
            'SSH_CA_OPENBAO_ADDR',
            'SSH_CA_OPENBAO_TOKEN',
            'SSH_CA_OPENBAO_TIMEOUT',
            'SSH_CA_OPENBAO_VERIFY_TLS'
          ]
        ],
        [
          this.$t('SSHCASigningPolicy'),
          ['SSH_CA_OPENBAO_MOUNT_POINT', 'SSH_CA_OPENBAO_ROLE', 'SSH_CA_OPENBAO_TTL']
        ],
        [this.$t('SSHCANetworkRestriction'), ['SSH_CA_OPENBAO_SOURCE_ADDRESS']]
      ],
      fieldsMeta: {
        SSH_CA_ENABLED: {
          label: this.$t('SSHCAEnabled')
        },
        SSH_CA_OPENBAO_ADDR: {
          label: this.$t('SSHCAOpenBaoAddress'),
          helpText: this.$t('SSHCAAddressHelp'),
          helpTextAsTip: true,
          rules: [{ validator: validateOpenBaoAddress, trigger: ['blur', 'change'] }],
          el: {
            placeholder: 'https://openbao.example.com:8200'
          }
        },
        SSH_CA_OPENBAO_TOKEN: {
          label: this.$t('SSHCAToken'),
          helpText: this.$t('SSHCATokenHelp'),
          helpTextAsTip: true,
          el: {
            autocomplete: 'new-password'
          }
        },
        SSH_CA_OPENBAO_MOUNT_POINT: {
          label: this.$t('SSHCAMountPoint')
        },
        SSH_CA_OPENBAO_ROLE: {
          label: this.$t('SSHCARole')
        },
        SSH_CA_OPENBAO_TTL: {
          label: this.$t('SSHCAValidity')
        },
        SSH_CA_OPENBAO_TIMEOUT: {
          label: this.$t('SSHCATimeout')
        },
        SSH_CA_OPENBAO_VERIFY_TLS: {
          label: this.$t('SSHCAVerifyTLS')
        },
        SSH_CA_OPENBAO_SOURCE_ADDRESS: {
          label: this.$t('SSHCAAllowedSources'),
          helpText: this.$t('SSHCAAllowedSourcesHelp'),
          helpTextAsTip: false,
          rules: [{ validator: validateAllowedSources, trigger: ['blur', 'change'] }],
          el: {
            placeholder: '10.20.30.0/24, 10.40.50.10/32'
          }
        }
      },
      submitMethod() {
        return 'patch'
      }
    }
  },
  methods: {
    async testConnection(value, form, btn) {
      this.testingConnection = true
      try {
        await form.validate()
      } catch {
        return
      } finally {
        this.testingConnection = false
      }

      const testValue = { ...value }
      if (testValue.SSH_CA_OPENBAO_TOKEN) {
        testValue.SSH_CA_OPENBAO_TOKEN = encryptPassword(testValue.SSH_CA_OPENBAO_TOKEN)
      }
      btn.loading = true
      this.$axios
        .post('/api/v1/settings/ssh-ca/openbao/testing/', testValue)
        .then((res) => {
          this.publicKey = res.public_key
          this.$message.success(res.msg)
        })
        .finally(() => {
          btn.loading = false
        })
    },
    loadPublicKey() {
      this.publicKeyLoading = true
      this.$axios
        .get('/api/v1/settings/ssh-ca/openbao/public-key/')
        .then((res) => {
          this.publicKey = res.public_key
        })
        .finally(() => {
          this.publicKeyLoading = false
        })
    },
    copyPublicKey() {
      copy(this.publicKey)
    },
    downloadPublicKey() {
      const publicKey = this.publicKey.trim()
      if (!publicKey) {
        return
      }
      downloadText(`${publicKey}\n`, 'jumpserver-openbao-ssh-ca.pub')
    }
  }
}
</script>

<style lang="scss" scoped>
.ssh-ca-page {
  --ssh-ca-soft-bg: var(--el-fill-color-lighter, #f6f8fa);
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 4px 0 24px;
  box-sizing: border-box;
}

.card-heading h3 {
  margin: 0;
  color: var(--color-text-primary, #1f2937);
}

.card-heading p {
  margin: 4px 0 0;
  color: var(--color-text-secondary, #6b7280);
}

.ssh-ca-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 400px);
  gap: 16px;
  align-items: stretch;
}

.ssh-ca-aside {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.configuration-card,
.public-key-card,
.guide-card,
.linux-setup-card {
  border-radius: 8px;
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.card-heading h3 {
  font-size: 14px;
  font-weight: 600;
}

.card-heading p {
  font-size: 12px;
  line-height: 1.5;
}

.configuration-card :deep(.el-card__header),
.public-key-card :deep(.el-card__header),
.guide-card :deep(.el-card__header),
.linux-setup-card :deep(.el-card__header) {
  padding: 16px 20px;
}

.configuration-card :deep(.el-card__body) {
  padding: 8px 24px 24px;
}

.ssh-ca-form :deep(.form-group-header) {
  margin-top: 6px;
}

.ssh-ca-form :deep(.form-group-header__title) {
  font-size: 13px;
  color: var(--color-text-primary, #1f2937);
}

.ssh-ca-form :deep(.el-form) {
  max-width: 900px;
}

.ssh-ca-form :deep(.el-form-item__label) {
  padding-right: 18px;
  color: var(--color-text-secondary, #4b5563);
}

.ssh-ca-form :deep(.el-input__wrapper) {
  min-height: 34px;
}

.ssh-ca-form :deep(.form-buttons) {
  padding-top: 4px;
}

.public-key-card :deep(.el-card__body) {
  padding: 16px 20px 20px;
}

.public-key-heading .el-button {
  flex: 0 0 auto;
}

.public-key-code {
  max-height: 180px;
  padding: 12px;
  margin: 0;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  line-height: 1.65;
  color: var(--color-text-primary, #263238);
  overflow-wrap: anywhere;
  white-space: pre-wrap;
  background: var(--ssh-ca-soft-bg);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 6px;
}

.public-key-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.public-key-actions .el-button {
  flex: 1;
  margin-left: 0;
}

.public-key-empty {
  display: flex;
  min-height: 178px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
  background: var(--ssh-ca-soft-bg);
  border: 1px dashed var(--color-border, #d8dee6);
  border-radius: 6px;
}

.empty-icon {
  display: grid;
  width: 42px;
  height: 42px;
  margin-bottom: 10px;
  font-size: 21px;
  color: var(--color-primary, #1ab394);
  place-items: center;
  background: rgb(26 179 148 / 10%);
  border-radius: 50%;
}

.public-key-empty p {
  max-width: 250px;
  margin: 0 0 14px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text-secondary, #6b7280);
}

.guide-card :deep(.el-card__body) {
  padding: 18px 20px;
}

.guide-steps {
  padding: 0;
  margin: 0;
  list-style: none;
}

.guide-steps li {
  position: relative;
  display: grid;
  grid-template-columns: 26px 1fr;
  gap: 10px;
  align-items: start;
}

.guide-steps li:not(:last-child) {
  padding-bottom: 16px;
}

.guide-steps li:not(:last-child)::after {
  position: absolute;
  top: 28px;
  bottom: 2px;
  left: 12px;
  width: 1px;
  content: '';
  background: var(--color-border, #e5e7eb);
}

.guide-steps span {
  position: relative;
  z-index: 1;
  display: grid;
  width: 26px;
  height: 26px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary, #1ab394);
  place-items: center;
  background: rgb(26 179 148 / 10%);
  border-radius: 50%;
}

.guide-steps p {
  margin: 3px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text-secondary, #4b5563);
}

.linux-setup-card :deep(.el-card__body) {
  padding: 18px 20px 20px;
}

.linux-setup-steps {
  padding: 0;
  margin: 0;
  list-style: none;
}

.linux-setup-steps li {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
}

.linux-setup-steps li:not(:last-child) {
  margin-bottom: 16px;
}

.linux-setup-steps .step-number {
  display: grid;
  width: 24px;
  height: 24px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary, #1ab394);
  place-items: center;
  background: rgb(26 179 148 / 10%);
  border-radius: 6px;
}

.linux-setup-steps p {
  margin: 2px 0 7px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text-secondary, #4b5563);
}

.linux-setup-steps code {
  display: block;
  padding: 7px 9px;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  line-height: 1.45;
  color: var(--color-text-primary, #263238);
  white-space: nowrap;
  background: var(--ssh-ca-soft-bg);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 4px;
}

.linux-setup-steps code + code,
.linux-setup-steps code + small {
  margin-top: 6px;
}

.linux-setup-steps small {
  display: block;
  font-size: 11px;
  line-height: 1.5;
  color: var(--color-text-secondary, #6b7280);
}

.authorized-keys-tip {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 10px 12px;
  margin-top: 18px;
  font-size: 11px;
  line-height: 1.6;
  color: var(--color-text-secondary, #4b5563);
  background: rgb(26 179 148 / 8%);
  border-radius: 5px;
}

.authorized-keys-tip .el-icon {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--color-primary, #1ab394);
}

@media (width <= 1080px) {
  .ssh-ca-layout {
    grid-template-columns: 1fr;
  }

  .ssh-ca-aside {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .linux-setup-card {
    grid-column: 1 / -1;
  }
}

@media (width <= 720px) {
  .ssh-ca-aside {
    grid-template-columns: 1fr;
  }

  .linux-setup-card {
    grid-column: auto;
  }

  .configuration-card :deep(.el-card__body) {
    padding: 8px 16px 20px;
  }

  .ssh-ca-form :deep(.el-form-item__label) {
    float: none;
    width: 100% !important;
    padding: 0 0 6px;
    line-height: 1.4;
    text-align: left;
  }

  .ssh-ca-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}
</style>
