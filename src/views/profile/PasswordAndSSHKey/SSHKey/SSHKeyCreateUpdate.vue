<template>
  <GenericCreateUpdatePage
    v-if="!loading"
    v-bind="$data"
    :after-get-form-value="afterGetFormValue"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage/index.vue'
import { downloadText } from '@/utils/common'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    return {
      meta: { action: 'create' },
      loading: true,
      url: '/api/v1/authentication/ssh-key/',
      fields: [
        'name',
        'generate_key_type',
        'current_public_key',
        'public_key',
        'is_active',
        'comment'
      ],
      fieldsMeta: {
        name: {},
        public_key: {
          label: this.$t('NewPublicKey'),
          el: {
            type: 'textarea',
            placeholder: 'ssh-rsa AAAA...',
            autosize: { minRows: 3 }
          },
          hidden: (formValue) => {
            return formValue.generate_key_type === 'auto' || !this.isCreateAction
          }
        },
        current_public_key: {
          hidden: () => {
            return this.isCreateAction
          },
          disabled: true,
          label: this.$t('OldPublicKey')
        },
        generate_key_type: {
          helpTextAsTip: false,
          hidden: () => {
            return !this.isCreateAction
          }
        }
      },
      onSubmit(validValues) {
        const isCreated = vm.isCreateAction || vm.meta?.action === 'clone'
        if (validValues['generate_key_type'] === 'auto' && isCreated) {
          const name = validValues['name']
          const queryParams = new URLSearchParams(validValues).toString()
          this.$axios.get(`/core/auth/profile/pubkey/generate/?${queryParams}`)
            .then((res) => {
              vm.createSuccessHandle()
              downloadText(res, `${name}.jumpserver.pem`)
            })
        } else {
          const method = isCreated ? 'post' : 'patch'
          delete validValues['generate_key_type']
          this.$axios[method](this.iUrl, validValues)
            .then(() => {
              vm.createSuccessHandle()
            }).catch((error) => this.onPerformError(error, this.method, this))
        }
      }
    }
  },
  computed: {
    isCreateAction() {
      return this.meta?.action === 'create'
    }
  },
  async mounted() {
    this.meta = await this.$store.dispatch('common/getDrawerActionMeta')
    setTimeout(() => {
      this.loading = false
    })
  },
  methods: {
    afterGetFormValue(value) {
      const publicKey = value['public_key_hash_md5'] ? `${value['public_key_comment']} (${value['public_key_hash_md5']})` : ' '
      value['current_public_key'] = publicKey
      return value
    },
    createSuccessHandle() {
      this.$router.push({ name: 'SSHKeyList', query: { order: '-date_created', updated: new Date().getTime() }})
      this.$message.success(this.$tc('CreateSuccessMsg'))
    }
  }
}
</script>

<style>

</style>
