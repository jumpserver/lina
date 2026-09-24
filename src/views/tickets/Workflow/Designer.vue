<template>
  <Page :title="$t('WFDesigner')" class="workflow-page">
    <template #headingRightSide>
      <div class="page-actions">
        <span v-if="dirty" class="draft-indicator">{{ $t('WFUnsavedChanges') }}</span>
        <el-tag v-if="!workflow.active_version" type="info" effect="plain">{{
          $t('WFDraft')
        }}</el-tag>
        <el-tag v-else :type="workflow.enabled ? 'success' : 'info'" effect="plain">{{
          $t(workflow.enabled ? 'Enabled' : 'Disabled')
        }}</el-tag>
        <el-button
          v-if="canEdit && workflow.active_version"
          :disabled="saving"
          @click="toggleEnabled"
          >{{ $t(workflow.enabled ? 'Disable' : 'Enable') }}</el-button
        >
        <el-button
          v-if="canEdit"
          type="primary"
          :loading="saving"
          :disabled="loading"
          @click="publish"
        >
          {{ $t(workflow.active_version ? 'WFPublish' : 'WFPublishFirst') }}
        </el-button>
      </div>
    </template>
    <div v-loading="loading" class="workflow-designer">
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />
      <IBox class="metadata-box">
        <div class="section-heading">
          <h3>{{ $t('BasicInfo') }}</h3>
          <el-tooltip :content="$t('WFVersionHint')" placement="left" :show-after="300">
            <el-button link class="version-help" :aria-label="$t('WFVersionHint')"
              ><el-icon><InfoFilled /></el-icon
            ></el-button>
          </el-tooltip>
        </div>
        <el-form label-position="top" :disabled="!canEdit || saving" class="metadata-form">
          <div class="metadata">
            <el-form-item :label="$t('WFName')" required>
              <el-input
                v-model="workflow.name"
                maxlength="128"
                :placeholder="$t('WFNamePlaceholder')"
              />
            </el-form-item>
            <el-form-item :label="$t('WFBusinessType')">
              <el-select v-model="workflow.type" :disabled="!!workflow.active_version">
                <el-option
                  v-for="type in ticketTypes"
                  :key="type.type"
                  :value="type.type"
                  :label="typeLabel(type)"
                />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('Comment')" class="description-field">
              <el-input v-model="workflow.comment" :placeholder="$t('WFDescriptionPlaceholder')" />
            </el-form-item>
          </div>
        </el-form>
      </IBox>
      <IBox class="editor-box">
        <div class="editor-toolbar">
          <div class="section-heading editor-title">
            <el-icon class="section-icon"><Share /></el-icon>
            <h3>{{ $t('WFCanvas') }}</h3>
            <span class="canvas-hint">{{ $t('WFCanvasHint') }}</span>
          </div>
          <div v-if="versions.length" class="version-controls">
            <el-select
              :model-value="selectedVersion"
              :aria-label="$t('WFVersion')"
              @update:model-value="selectVersion"
            >
              <el-option
                v-for="version in versions"
                :key="version.id"
                :value="version.id"
                :label="`${$t('WFVersion')} ${version.number}`"
              />
            </el-select>
            <el-button v-if="moreVersions" link @click="loadVersions(true)">{{
              $t('WFMoreVersions')
            }}</el-button>
          </div>
          <span v-else class="node-count">{{
            $t('WFNodeCount', { count: definition.nodes.length })
          }}</span>
        </div>
        <div class="workspace">
          <div class="canvas-panel">
            <div class="canvas-scroll">
              <div
                class="canvas"
                :style="{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }"
              >
                <svg
                  class="connections"
                  :width="canvasWidth"
                  :height="canvasHeight"
                  aria-hidden="true"
                >
                  <defs>
                    <marker
                      id="wf-arrow"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                    </marker>
                  </defs>
                  <path
                    v-for="(edge, i) in definition.edges"
                    :key="i"
                    :d="edgePath(edge)"
                    fill="none"
                    stroke="currentColor"
                    marker-end="url(#wf-arrow)"
                  />
                  <text
                    v-for="edge in definition.edges.filter((e) => e.condition !== null)"
                    :key="`${edge.source}-${edge.condition}`"
                    :x="branchLabel(edge).x"
                    :y="branchLabel(edge).y"
                    class="branch-label"
                  >
                    {{ $t(edge.condition ? 'WFTrueBranch' : 'WFFalseBranch') }}
                  </text>
                </svg>
                <button
                  v-for="node in layout"
                  :key="node.id"
                  type="button"
                  class="node"
                  :class="[node.type, { selected: selected?.id === node.id }]"
                  :aria-pressed="selected?.id === node.id"
                  :style="{ left: `${node.x}px`, top: `${node.y}px` }"
                  @click="selectNode(node.id)"
                >
                  <span class="node-heading">
                    <span class="node-icon"
                      ><el-icon
                        ><User v-if="node.type === 'approval' || node.type === 'cc'" /><Share
                          v-else-if="node.type === 'condition'" /><VideoPlay
                          v-else-if="node.type === 'start'" /><CircleCheck v-else /></el-icon
                    ></span>
                    <strong>{{ node.name || $t(nodeLabels[node.type]) }}</strong>
                    <el-icon v-if="selected?.id === node.id" class="selected-mark"
                      ><EditPen
                    /></el-icon>
                  </span>
                  <small v-if="node.type === 'approval'"
                    >{{ $t(`WFResolver_${node.config.approvers.type}`) }} ·
                    {{ $t(`WFStrategy_${node.config.strategy}`) }}</small
                  >
                  <small v-else-if="node.type === 'cc'">{{ $t('WFCCNodeHint') }}</small>
                  <small v-else>{{
                    $t(
                      node.type === 'start'
                        ? 'WFStartHint'
                        : node.type === 'end'
                          ? 'WFEndHint'
                          : 'WFBranchHint'
                    )
                  }}</small>
                </button>
              </div>
            </div>
            <div class="canvas-legend">
              <span><i class="legend-dot approval" />{{ $t('WFApproval') }}</span>
              <span><i class="legend-dot cc" />{{ $t('WFCC') }}</span>
              <span><i class="legend-dot condition" />{{ $t('WFCondition') }}</span>
              <span><i class="legend-dot endpoint" />{{ $t('WFStart') }} / {{ $t('WFEnd') }}</span>
            </div>
          </div>
          <aside v-if="selected" class="inspector" :aria-label="$t('WFNodeSettings')">
            <div class="inspector-heading">
              <h3>{{ $t('WFNodeSettings') }}</h3>
              <el-tag effect="plain" :type="selected.type === 'condition' ? 'warning' : 'info'">{{
                $t(nodeLabels[selected.type])
              }}</el-tag>
            </div>
            <el-form label-position="top" :disabled="!canEdit || saving" class="inspector-form">
              <section class="config-section">
                <el-form-item :label="$t('WFNodeName')">
                  <el-input
                    v-model="selected.name"
                    maxlength="128"
                    :placeholder="$t(nodeLabels[selected.type])"
                  />
                </el-form-item>
                <template v-if="selected.type === 'approval'">
                  <el-form-item :label="$t('WFApprovers')">
                    <el-select v-model="selected.config.approvers.type" @change="changeResolver">
                      <el-option
                        v-for="kind in resolvers"
                        :key="kind"
                        :value="kind"
                        :label="$t(`WFResolver_${kind}`)"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item v-if="resourceResolver" :label="$t('WFSelectApprovers')">
                    <Select2
                      :key="`${selected.id}-${selected.config.approvers.type}`"
                      v-model="selected.config.approvers.value"
                      :ajax="approverAjax"
                      multiple
                    />
                  </el-form-item>
                  <el-form-item :label="$t('WFStrategy')">
                    <el-select v-model="selected.config.strategy" @change="changeStrategy">
                      <el-option
                        v-for="strategy in ['any', 'all', 'quorum']"
                        :key="strategy"
                        :value="strategy"
                        :label="$t(`WFStrategy_${strategy}`)"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    v-if="selected.config.strategy === 'quorum'"
                    :label="$t('WFRequired')"
                  >
                    <el-input-number
                      v-model="selected.config.required"
                      :min="1"
                      :max="1000"
                      :precision="0"
                      controls-position="right"
                    />
                  </el-form-item>
                </template>
                <el-form-item v-if="selected.type === 'cc'" :label="$t('CcUsers')" required>
                  <Select2
                    v-model="selected.config.users"
                    multiple
                    :placeholder="$t('WFCCPlaceholder')"
                    :ajax="{
                      url: '/api/v1/users/users/?fields_size=mini&is_valid=true',
                      transformOption: (user) => ({ label: user.name, value: user.id })
                    }"
                  />
                </el-form-item>
                <ConditionEditor
                  v-if="selected.type === 'condition'"
                  v-model="selected.config"
                  :extra-fields="pluginConditionFields"
                  :disabled="!canEdit || saving"
                />
              </section>
              <el-collapse
                v-if="selected.type === 'approval'"
                v-model="advancedOpen"
                class="advanced-settings"
              >
                <el-collapse-item name="approval" :title="$t('WFAdvancedSettings')">
                  <el-form-item :label="$t('WFTimeout')">
                    <el-input-number
                      v-model="selected.config.timeout"
                      :min="0"
                      :max="31536000"
                      :precision="0"
                      controls-position="right"
                    />
                  </el-form-item>
                  <el-form-item :label="$t('WFTimeoutAction')">
                    <el-select v-model="selected.config.timeout_action"
                      ><el-option value="expire" :label="$t('WFExpired')" /><el-option
                        value="reject"
                        :label="$t('Reject')"
                    /></el-select>
                  </el-form-item>
                  <div class="switch-row">
                    <span>{{ $t('WFExcludeApplicant') }}</span
                    ><el-switch
                      v-model="selected.config.exclude_applicant"
                      :aria-label="$t('WFExcludeApplicant')"
                    />
                  </div>
                  <div class="switch-row">
                    <span>{{ $t('WFAllowTransfer') }}</span
                    ><el-switch
                      v-model="selected.config.allow_transfer"
                      :aria-label="$t('WFAllowTransfer')"
                    />
                  </div>
                  <div class="switch-row">
                    <span>{{ $t('WFAllowAdd') }}</span
                    ><el-switch
                      v-model="selected.config.allow_add_approver"
                      :aria-label="$t('WFAllowAdd')"
                    />
                  </div>
                </el-collapse-item>
              </el-collapse>
              <section v-if="outgoing.length" class="config-section connections-section">
                <div
                  v-for="edge in outgoing"
                  :key="`${edge.source}-${edge.condition}`"
                  class="edge-controls"
                >
                  <el-form-item
                    :label="
                      edge.condition === null
                        ? $t('WFNext')
                        : $t(edge.condition ? 'WFTrueBranch' : 'WFFalseBranch')
                    "
                  >
                    <el-select v-model="edge.target"
                      ><el-option
                        v-for="node in nextNodes"
                        :key="node.id"
                        :value="node.id"
                        :label="node.name || $t(nodeLabels[node.type])"
                    /></el-select>
                  </el-form-item>
                  <div v-if="canEdit" class="insert-actions">
                    <el-button :disabled="saving" @click="insert(edge, 'approval')"
                      ><el-icon><Plus /></el-icon>{{ $t('WFApproval') }}</el-button
                    >
                    <el-button :disabled="saving" @click="insert(edge, 'condition')"
                      ><el-icon><Plus /></el-icon>{{ $t('WFCondition') }}</el-button
                    >
                    <el-button :disabled="saving" @click="insert(edge, 'cc')"
                      ><el-icon><Plus /></el-icon>{{ $t('WFCC') }}</el-button
                    >
                  </div>
                </div>
              </section>
              <div
                v-if="canEdit && ['approval', 'condition', 'cc'].includes(selected.type)"
                class="inspector-footer"
              >
                <el-button
                  type="danger"
                  link
                  :disabled="saving"
                  @click="selected.type === 'condition' ? removeBranch() : remove()"
                  ><el-icon><Delete /></el-icon
                  >{{
                    $t(selected.type === 'condition' ? 'WFRemoveCondition' : 'WFRemoveNode')
                  }}</el-button
                >
              </div>
            </el-form>
          </aside>
        </div>
      </IBox>
    </div>
  </Page>
</template>
<script>
import { Page } from '@/layout/components'
import IBox from '@/components/Common/IBox'
import Select2 from '@/components/Form/FormFields/Select2'
import ConditionEditor from './ConditionEditor'
import { newDefinition, layoutGraph, insertNode, removeNode, nodeLabels } from './graph'
import { getTicketTypeLabel } from '../const'
export default {
  components: { Page, IBox, Select2, ConditionEditor },
  data() {
    return {
      loading: false,
      saving: false,
      error: '',
      advancedOpen: [],
      savedDefinition: null,
      savedMetadata: null,
      workflow: { name: '', type: 'apply_asset', comment: '', enabled: false },
      definition: newDefinition(),
      versions: [],
      selectedVersion: null,
      moreVersions: false,
      selectedId: 'approval_1',
      ticketTypes: [],
      nodeLabels,
      resolvers: ['user', 'user_group', 'role', 'applicant_manager', 'asset_owner', 'org_admin']
    }
  },
  computed: {
    pluginConditionFields() {
      return (
        this.ticketTypes.find((plugin) => plugin.type === this.workflow.type)?.fields || []
      ).map((field) => `request.${field.name}`)
    },
    metadata() {
      return {
        name: this.workflow.name,
        type: this.workflow.type,
        comment: this.workflow.comment
      }
    },
    definitionDirty() {
      return (
        this.savedDefinition !== null && JSON.stringify(this.definition) !== this.savedDefinition
      )
    },
    dirty() {
      return (
        this.definitionDirty ||
        (this.savedMetadata !== null && JSON.stringify(this.metadata) !== this.savedMetadata)
      )
    },
    canEdit() {
      return this.$hasPerm(this.workflow.id ? 'tickets.change_workflow' : 'tickets.add_workflow')
    },
    selected() {
      return this.definition.nodes.find((n) => n.id === this.selectedId)
    },
    layout() {
      const nodes = layoutGraph(this.definition)
      const rows = new Map()
      nodes.forEach((node) => rows.set(node.y, (rows.get(node.y) || 0) + 1))
      const width = Math.max(480, ...[...rows.values()].map((count) => count * 250 + 80))
      return nodes.map((node) => ({
        ...node,
        x: node.x - 50 + (width - (rows.get(node.y) * 250 - 50)) / 2
      }))
    },
    canvasWidth() {
      return Math.max(480, ...this.layout.map((n) => n.x + 265))
    },
    canvasHeight() {
      return Math.max(500, ...this.layout.map((n) => n.y + 130))
    },
    outgoing() {
      return this.definition.edges.filter((e) => e.source === this.selectedId)
    },
    nextNodes() {
      return this.definition.nodes.filter((n) => n.id !== this.selectedId && n.type !== 'start')
    },
    resourceResolver() {
      return ['user', 'user_group', 'role'].includes(this.selected?.config?.approvers?.type)
    },
    approverAjax() {
      const urls = {
        user: '/api/v1/users/users/?fields_size=mini&is_valid=true',
        user_group: '/api/v1/users/groups/',
        role: '/api/v1/rbac/roles/'
      }
      return {
        url: urls[this.selected.config.approvers.type],
        transformOption: (item) => ({ label: item.display_name || item.name, value: item.id })
      }
    }
  },
  async mounted() {
    this.captureBaseline()
    this.ticketTypes = await this.$axios.get('/api/v1/tickets/ticket-types/')
    if (!this.$route.params.id) return
    this.loading = true
    try {
      this.workflow = await this.$axios.get(`/api/v1/tickets/workflows/${this.$route.params.id}/`)
      await this.loadVersions()
      if (this.versions.length) await this.selectVersion(this.workflow.active_version)
      else if (this.workflow.migration_notes?.unpublished_cc_user_ids?.length) {
        const node = insertNode(this.definition, this.definition.edges[0], 'cc', this.$t('WFCC'))
        node.config.users = this.workflow.migration_notes.unpublished_cc_user_ids
        this.selectedId = node.id
      }
    } finally {
      this.loading = false
      this.captureBaseline()
    }
  },
  activated() {
    // The app caches route pages. Opening Create again must start a new draft.
    if (this.$route.name === 'WorkflowCreate' && this.workflow.active_version) {
      this.workflow = { name: '', type: 'apply_asset', comment: '', enabled: false }
      this.definition = newDefinition()
      this.versions = []
      this.selectedVersion = null
      this.moreVersions = false
      this.selectedId = 'approval_1'
      this.error = ''
      this.captureBaseline()
    }
  },
  async beforeRouteLeave() {
    if (!this.dirty || this.saving) return true
    try {
      await this.$confirm(this.$t('WFUnsaved'), this.$t('Confirm'))
      return true
    } catch {
      return false
    }
  },
  methods: {
    captureBaseline() {
      this.savedDefinition = JSON.stringify(this.definition)
      this.savedMetadata = JSON.stringify(this.metadata)
    },
    typeLabel(type) {
      return getTicketTypeLabel({ value: type.type, label: type.label }, this.$t)
    },
    selectNode(id) {
      this.selectedId = id
    },
    edgePath(edge) {
      const a = this.layout.find((n) => n.id === edge.source)
      const b = this.layout.find((n) => n.id === edge.target)
      if (!a || !b) return ''
      if (edge.condition === false || b.y - a.y > 140) {
        const side = Math.max(a.x, b.x) + 230
        const sx = a.x + (edge.condition === false ? 200 : 100)
        const sy = a.y + (edge.condition === false ? 38 : 78)
        return `M${sx},${sy} H${side - 10} Q${side},${sy} ${side},${sy + 10} V${b.y - 24} Q${side},${b.y - 12} ${side - 12},${b.y - 12} H${b.x + 112} Q${b.x + 100},${b.y - 12} ${b.x + 100},${b.y}`
      }
      return `M${a.x + 100},${a.y + 78} C${a.x + 100},${a.y + 102} ${b.x + 100},${b.y - 24} ${b.x + 100},${b.y}`
    },
    branchLabel(edge) {
      const node = this.layout.find((n) => n.id === edge.source)
      return { x: node.x + (edge.condition ? 110 : 212), y: node.y + (edge.condition ? 99 : 30) }
    },
    async loadVersions(append = false) {
      const data = await this.$axios.get(
        `/api/v1/tickets/workflows/${this.workflow.id}/versions/`,
        { params: { limit: 50, offset: append ? this.versions.length : 0 } }
      )
      this.versions = [...(append ? this.versions : []), ...(data.results || data)]
      this.moreVersions = !!data.next
    },
    async selectVersion(id) {
      const version = this.versions.find((v) => v.id === id)
      if (!version) return
      if (this.definitionDirty && !this.loading) {
        try {
          await this.$confirm(this.$t('WFUnsaved'), this.$t('Confirm'))
        } catch {
          return
        }
      }
      this.selectedVersion = id
      this.definition = JSON.parse(JSON.stringify(version.definition))
      this.selectedId = this.definition.nodes.find((n) => n.type === 'start')?.id
      this.savedDefinition = JSON.stringify(this.definition)
    },
    changeResolver(kind) {
      this.selected.config.approvers = ['user', 'user_group', 'role'].includes(kind)
        ? { type: kind, value: [] }
        : { type: kind }
    },
    changeStrategy(strategy) {
      if (strategy === 'quorum') this.selected.config.required = 1
      else delete this.selected.config.required
    },
    insert(edge, type) {
      this.selectedId = insertNode(this.definition, edge, type, this.$t(nodeLabels[type])).id
    },
    remove() {
      if (!removeNode(this.definition, this.selectedId)) {
        return this.$message.warning(this.$t('WFRemoveBlocked'))
      }
      this.selectedId = this.definition.nodes.find((n) => n.type === 'start').id
    },
    removeBranch() {
      // Keep the selected true branch and remove the false edge. Unreachable
      // nodes are pruned; shared downstream nodes remain intact.
      const edge = this.outgoing.find((e) => e.condition === true)
      if (!edge) return
      this.definition.edges
        .filter((e) => e.target === this.selectedId)
        .forEach((e) => {
          e.target = edge.target
        })
      this.definition.edges = this.definition.edges.filter((e) => e.source !== this.selectedId)
      this.definition.nodes = this.definition.nodes.filter((n) => n.id !== this.selectedId)
      const reachable = new Set([this.definition.nodes.find((n) => n.type === 'start').id])
      for (let i = 0; i < this.definition.nodes.length; i++) {
        this.definition.edges.forEach((e) => {
          if (reachable.has(e.source)) reachable.add(e.target)
        })
      }
      this.definition.nodes = this.definition.nodes.filter((n) => reachable.has(n.id))
      this.definition.edges = this.definition.edges.filter(
        (e) => reachable.has(e.source) && reachable.has(e.target)
      )
      this.selectedId = edge.target
    },
    async publish() {
      if (this.saving) return
      if (!this.workflow.name.trim()) {
        this.error = this.$t('WFNameRequired')
        return
      }
      this.saving = true
      this.error = ''
      try {
        const metadata = this.metadata
        const expected = this.workflow.active_version_number || 0
        if (!this.workflow.id) {
          this.workflow = await this.$axios.post('/api/v1/tickets/workflows/', metadata)
        } else await this.$axios.patch(`/api/v1/tickets/workflows/${this.workflow.id}/`, metadata)
        const definition = JSON.parse(JSON.stringify(this.definition))
        definition.nodes.forEach((n) => {
          if (!n.name) n.name = this.$t(nodeLabels[n.type])
        })
        const version = await this.$axios.post(
          `/api/v1/tickets/workflows/${this.workflow.id}/publish/`,
          { expected_version: expected, definition }
        )
        this.workflow.active_version = version.id
        this.workflow.active_version_number = version.number
        this.versions.unshift(version)
        this.selectedVersion = version.id
        this.captureBaseline()
        this.$message.success(this.$t('WFPublished'))
        // Navigate only after publication; the detail page mounts and fetches here.
        if (this.$route.name === 'WorkflowCreate') {
          await this.$router.replace({ name: 'WorkflowDetail', params: { id: this.workflow.id } })
        }
      } catch (e) {
        this.error =
          e.response?.status === 409
            ? this.$t('WFConflict')
            : JSON.stringify(e.response?.data || e.message)
      } finally {
        this.saving = false
      }
    },
    async toggleEnabled() {
      const data = await this.$axios.patch(`/api/v1/tickets/workflows/${this.workflow.id}/`, {
        enabled: !this.workflow.enabled
      })
      this.workflow.enabled = data.enabled
    }
  }
}
</script>
<style scoped>
.workflow-designer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
.workflow-page :deep(.page-heading-left) {
  flex: 1;
  max-width: none;
  min-width: 0;
}
.workflow-page :deep(.page-heading-right) {
  flex: 0 0 auto;
  max-width: none;
  width: auto;
}
.workflow-designer :deep(.el-form) {
  margin-bottom: 0;
}
.workflow-designer :deep(.el-form-item__label) {
  height: auto;
  min-height: 0;
}
.page-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.page-actions .el-button + .el-button {
  margin-left: 0;
}
.draft-indicator {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.draft-indicator::before {
  content: '';
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 6px;
  border-radius: 50%;
  background: var(--el-color-warning);
  vertical-align: middle;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
}
h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: var(--el-text-color-primary);
}
.version-help {
  color: var(--el-text-color-placeholder);
  padding: 0;
  min-height: 20px;
}
.metadata {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  column-gap: 24px;
  row-gap: 14px;
}
.metadata .el-form-item {
  margin-bottom: 0;
  min-width: 0;
}
.metadata :deep(.el-form-item__label) {
  margin-bottom: 7px;
  line-height: 18px;
  padding: 0;
}
.description-field {
  grid-column: 1 / -1;
}
.workflow-designer :deep(.el-select) {
  width: 100%;
}
.editor-box :deep(.el-card__body) {
  padding: 0;
}
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  min-height: 60px;
  box-sizing: border-box;
}
.editor-title {
  margin: 0;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.section-icon {
  color: var(--el-color-primary);
  font-size: 16px;
}
.canvas-hint,
.node-count {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.version-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.version-controls .el-select {
  width: 130px;
}
.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  align-items: stretch;
  min-width: 0;
}
.canvas-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background-color: var(--el-fill-color-lighter);
  background-image: radial-gradient(var(--el-border-color) 0.8px, transparent 0.8px);
  background-size: 16px 16px;
}
.canvas-scroll {
  overflow: auto;
  flex: 1;
  min-height: 520px;
  max-height: 760px;
  scrollbar-width: thin;
}
.canvas {
  position: relative;
  margin: 16px auto 0;
}
.connections {
  position: absolute;
  color: var(--el-border-color-darker);
  stroke-width: 1.3;
  overflow: visible;
}
.node {
  --node-color: var(--el-color-primary);
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 9px;
  width: 200px;
  height: 78px;
  text-align: left;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  box-shadow: 0 2px 5px rgb(0 0 0 / 3%);
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.node:hover {
  border-color: var(--node-color);
}
.node:focus-visible {
  outline: 2px solid var(--node-color);
  outline-offset: 4px;
}
.node.condition {
  --node-color: var(--el-color-warning);
}
.node.cc {
  --node-color: var(--el-color-success);
}
.node.start,
.node.end {
  --node-color: var(--el-text-color-secondary);
}
.node.selected {
  border-color: var(--el-color-primary);
  box-shadow:
    0 0 0 2px var(--el-color-primary-light-8),
    0 3px 8px rgb(0 0 0 / 4%);
}
.node-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.node-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 23px;
  height: 23px;
  border-radius: 5px;
  background: color-mix(in srgb, var(--node-color) 10%, transparent);
  color: var(--node-color);
  flex-shrink: 0;
}
.node strong {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
}
.node strong,
.node small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.node small {
  color: var(--el-text-color-secondary);
  font-size: 11px;
  line-height: 16px;
}
.selected-mark {
  font-size: 13px;
  color: var(--el-color-primary);
}
.branch-label {
  fill: var(--el-text-color-secondary);
  font-size: 11px;
  stroke: var(--el-fill-color-lighter);
  stroke-width: 4px;
  paint-order: stroke;
}
.canvas-legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 22px;
  padding: 16px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.canvas-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-text-color-secondary);
}
.legend-dot.approval {
  background: var(--el-color-primary);
}
.legend-dot.condition {
  background: var(--el-color-warning);
}
.legend-dot.cc {
  background: var(--el-color-success);
}
.inspector {
  min-width: 0;
  border-left: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
}
.inspector-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.inspector-heading h3 {
  font-size: 13px;
}
.config-section {
  padding: 18px 20px;
}
.inspector :deep(.el-form-item) {
  margin-bottom: 16px;
}
.inspector :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}
.inspector :deep(.el-form-item__label) {
  margin-bottom: 7px;
  padding: 0;
  line-height: 18px;
  font-size: 12px;
}
.inspector :deep(.el-input-number) {
  width: 100%;
}
.advanced-settings {
  padding: 0 20px;
  border-top: 1px solid var(--el-border-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.advanced-settings :deep(.el-collapse-item__header) {
  font-size: 12px;
  height: 44px;
  border-bottom: 0;
  color: var(--el-text-color-regular);
}
.advanced-settings :deep(.el-collapse-item__wrap) {
  border-bottom: 0;
}
.advanced-settings :deep(.el-collapse-item__content) {
  padding: 8px 0 16px;
}
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  color: var(--el-text-color-regular);
  font-size: 12px;
}
.connections-section {
  border-top: 1px solid var(--el-border-color-lighter);
}
.advanced-settings + .connections-section {
  border-top: 0;
}
.edge-controls + .edge-controls {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px dashed var(--el-border-color);
}
.insert-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.insert-actions .el-button {
  flex: 1;
  margin: 0;
}
.insert-actions .el-icon,
.inspector-footer .el-icon {
  margin-right: 5px;
}
.inspector-footer {
  padding: 0 20px 20px;
}
@media (min-width: 1600px) {
  .workspace {
    grid-template-columns: minmax(0, 1fr) 360px;
  }
}
@media (max-width: 1100px) {
  .canvas-hint {
    display: none;
  }
  .metadata {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .description-field {
    grid-column: auto;
  }
}
@media (max-width: 800px) {
  .workspace {
    grid-template-columns: 1fr;
  }
  .inspector {
    border-left: 0;
    border-top: 1px solid var(--el-border-color-light);
  }
  .canvas-scroll {
    min-height: 400px;
    max-height: 540px;
  }
  .draft-indicator {
    display: none;
  }
  .page-actions {
    gap: 6px;
    padding-right: 8px;
  }
}
@media (max-width: 540px) {
  .metadata {
    grid-template-columns: 1fr;
  }
  .node-count {
    display: none;
  }
}
</style>
