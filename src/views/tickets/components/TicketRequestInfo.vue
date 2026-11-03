<template>
  <Details :detail-card-items="visibleItems" :title="$t('ApplyInfo')">
    <template #actions>
      <div v-if="canAdjust && !adjusting" class="request-actions">
        <el-button :disabled="busy || saving" @click="openAdjustment">{{ $t('Edit') }}</el-button>
      </div>
    </template>
    <el-alert
      v-if="adjustment?.pending && !adjusting"
      type="warning"
      :closable="false"
      :title="$t('TicketResourcesPending')"
      class="resource-hint"
    />
    <TicketResourceAdjustment
      v-if="adjusting && myTask"
      :key="`${myTask.id}:${adjustmentRevision}`"
      ref="resourceForm"
      :task-id="myTask.id"
      :org-id="object.org_id"
      :ticket-type="object.type?.value || object.type"
      :fields="adjustment.fields"
      :values="adjustment.values"
      :snapshot="instance.context"
      :disabled="busy || saving"
      @save="saveAdjustment"
      @cancel="adjusting = false"
    />
  </Details>
</template>

<script>
import Details from './Details'
import TicketResourceAdjustment from './TicketResourceAdjustment'

export default {
  components: { Details, TicketResourceAdjustment },
  props: {
    object: { type: Object, required: true },
    items: { type: Array, required: true },
    instance: { type: Object, default: null },
    busy: { type: Boolean, default: false }
  },
  emits: ['editing', 'saving', 'refresh'],
  data: () => ({
    adjusting: false,
    saving: false,
    adjustmentRevision: null,
    adjustmentTaskId: null,
    disposed: false
  }),
  computed: {
    adjustment() {
      return this.instance?.resource_adjustment
    },
    myTask() {
      if (this.instance?.state !== 'running') return null
      return this.instance.nodes
        .find((node) => node.state === 'running' && node.type === 'approval')
        ?.tasks.find(
          (task) => task.assignee === this.$store.state.users.profile.id && task.state === 'pending'
        )
    },
    canAdjust() {
      return this.adjustment?.can_adjust && !!this.myTask
    },
    visibleItems() {
      if (!this.adjusting) return this.items
      const editable = new Set(this.adjustment.fields.map((field) => field.name))
      return this.items.filter((item) => !editable.has(item.name))
    }
  },
  watch: {
    adjusting(value) {
      this.$emit('editing', value)
    },
    saving(value) {
      this.$emit('saving', value)
    },
    instance() {
      if (
        this.adjusting &&
        (!this.canAdjust ||
          this.myTask.id !== this.adjustmentTaskId ||
          this.adjustment.revision !== this.adjustmentRevision)
      ) {
        this.adjusting = false
        this.$message.warning(this.$t('TicketAdjustmentChanged'))
      }
    }
  },
  beforeUnmount() {
    this.disposed = true
  },
  activated() {
    this.disposed = false
  },
  deactivated() {
    this.disposed = true
    this.adjusting = false
    this.saving = false
  },
  methods: {
    openAdjustment() {
      if (!this.canAdjust || this.busy || this.saving) return
      this.adjustmentRevision = this.adjustment.revision
      this.adjustmentTaskId = this.myTask.id
      this.adjusting = true
    },
    async saveAdjustment(data) {
      if (this.busy || this.saving || !this.myTask || !this.adjusting) return
      this.saving = true
      try {
        await this.$axios.post(
          `/api/v1/tickets/approval-tasks/${this.myTask.id}/adjust-resources/`,
          { ...data, expected_revision: this.adjustmentRevision },
          { params: { oid: this.object.org_id } }
        )
        if (this.disposed) return
        this.adjusting = false
        this.$emit('refresh')
        this.$message.success(this.$t('TicketAdjustmentSaved'))
      } catch (error) {
        if (this.disposed) return
        if (error.response?.status === 409) this.$emit('refresh')
        else this.$refs.resourceForm?.setErrors(error.response?.data)
      } finally {
        if (!this.disposed) this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.request-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.resource-hint {
  margin-top: 12px;
}
</style>
