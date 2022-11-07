<template>
  <IBox v-if="!loading">
    <GenericCreateUpdateForm v-bind="$data" />
  </IBox>
</template>

<script>
import IBox from '@/components/IBox'
import { GenericCreateUpdateForm } from '@/layout/components'
import { platformFieldsMeta, setAutomations } from '../const'
import { mapGetters } from 'vuex'

export default {
  components: {
    IBox,
    GenericCreateUpdateForm
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
      initial: {
        automation: {
          ansible_enabled: true
        }
      },
      disabled: true,
      url: `/api/v1/assets/platforms/`,
      hasReset: false,
      hasDetailInMsg: false,
      submitMethod: () => 'patch',
      fields: [['', ['automation']]],
      fieldsMeta: platformFieldsMeta(this),
      onSubmit: this.submit
    }
  },
  computed: {
    ...mapGetters(['isSystemAdmin'])
  },
  mounted() {
    try {
      setAutomations(this)
    } finally {
      this.loading = false
    }
  },
  methods: {
    submit(validValues) {
      if (!this.$hasPerm('assets.change_platform') || !this.isSystemAdmin) {
        return this.$message.error(this.$t('rbac.NoPermission'))
      }
      this.$axios.patch(`${this.url}${this.object.id}/`, validValues).then(() => {
        this.$message.success(this.$t('common.updateSuccessMsg'))
      })
    }
  }
}
</script>

<style scoped>

</style>
