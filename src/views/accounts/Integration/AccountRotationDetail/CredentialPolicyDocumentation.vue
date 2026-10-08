<template>
  <IBox :title="$t('PolicyDocsTitle')" class="policy-documentation">
    <article ref="document" class="policy-documentation-body">
      <header class="policy-documentation-introduction">
        <div class="policy-documentation-meta">
          <el-tag effect="plain">{{ modeLabel }}</el-tag>
          <span>{{ $t('CredentialKey') }}</span>
          <code>{{ object.key }}</code>
        </div>
        <p>{{ $t('PolicyDocsIntroduction') }}</p>
        <el-alert :title="modeSummary" type="info" :closable="false" show-icon />
      </header>
      <nav class="policy-documentation-nav" :aria-label="$t('OnThisPage')">
        <span>{{ $t('OnThisPage') }}</span>
        <button
          v-for="section in documentationSections"
          :key="section.id"
          type="button"
          @click="scrollToSection(section.id)"
        >
          {{ $t(section.title) }}
        </button>
      </nav>
      <section
        v-for="section in documentationSections"
        :key="section.id"
        :data-section="section.id"
        :aria-label="$t(section.title)"
        class="policy-documentation-section"
        tabindex="-1"
      >
        <h2>{{ $t(section.title) }}</h2>
        <MarkdownRenderer
          :source="section.content"
          copyable-code
          class="policy-documentation-content"
        />
      </section>
    </article>
  </IBox>
</template>

<script>
import MarkdownRenderer from '@/components/Widgets/MarkdownRenderer/index.vue'
import IBox from '@/components/Common/IBox/index.vue'

const codeBlock = (language, value) => `\n\n\`\`\`${language}\n${value}\n\`\`\`\n\n`
const jsonBlock = (value) => codeBlock('json', JSON.stringify(value, null, 2))

export default {
  name: 'CredentialPolicyDocumentation',
  components: { IBox, MarkdownRenderer },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  computed: {
    subscription() {
      return this.object.mode === 'subscription'
    },
    modeLabel() {
      return this.$t(
        this.subscription ? 'CredentialUpdateSubscription' : 'AlternatingAccountRotation'
      )
    },
    modeSummary() {
      return this.$t(
        this.subscription ? 'PolicyDocsSubscriptionSummary' : 'PolicyDocsRotationSummaryV2'
      )
    },
    exampleKey() {
      if (!this.subscription) return this.object.key
      const accountId = this.object.subscription_accounts?.[0]?.id || '<account-id>'
      return `${this.object.key}:${accountId}`
    },
    policyEvents() {
      const suffix = this.subscription ? 'Subscription' : 'Rotation'
      const events = [
        [
          'credential.updated',
          `PolicyDocsUpdatedTrigger${suffix}`,
          `PolicyDocsUpdatedAction${suffix}`
        ],
        [
          'credential.revoked',
          this.subscription ? 'PolicyDocsRevokedTriggerSubscription' : 'PolicyDocsRevokedTrigger',
          'PolicyDocsRevokedAction'
        ],
        [
          'configuration.updated',
          'PolicyDocsConfigurationTrigger',
          'PolicyDocsConfigurationAction'
        ],
        [
          'credential.change.started',
          `PolicyDocsChangeStartedTrigger${suffix}`,
          'PolicyDocsChangeStartedAction'
        ],
        [
          'credential.change.completed',
          `PolicyDocsChangeCompletedTrigger${suffix}`,
          `PolicyDocsChangeCompletedAction${suffix}`
        ],
        [
          'credential.change.failed',
          'PolicyDocsChangeFailedTrigger',
          'PolicyDocsChangeFailedAction'
        ]
      ]
      if (!this.subscription) {
        events.push(
          ...[
            'rotation.verification.started',
            'rotation.verification.failed',
            'rotation.verification.cancelled'
          ].map((event) => [
            event,
            'PolicyDocsVerificationTrigger',
            'PolicyDocsVerificationAction'
          ]),
          [
            'rotation.started',
            'PolicyDocsRotationStartedTrigger',
            'PolicyDocsRotationStartedAction'
          ],
          [
            'rotation.waiting_for_application',
            'PolicyDocsRotationWaitingTrigger',
            'PolicyDocsRotationWaitingAction'
          ],
          ...['rotation.source.waiting', 'rotation.source.ready'].map((event) => [
            event,
            'PolicyDocsSourceObservationTrigger',
            'PolicyDocsSourceObservationAction'
          ]),
          [
            'rotation.completed',
            'PolicyDocsRotationCompletedTrigger',
            'PolicyDocsRotationCompletedAction'
          ],
          ['rotation.failed', 'PolicyDocsRotationFailedTrigger', 'PolicyDocsChangeFailedAction']
        )
      }
      return events
    },
    documentationSections() {
      const heading = (key) => `\n\n### ${this.$t(key)}\n\n`
      const paragraph = (key) => `${this.$t(key)}\n\n`
      const eventRows = this.policyEvents.map(
        ([event, trigger, action]) => `| \`${event}\` | ${this.$t(trigger)} | ${this.$t(action)} |`
      )
      const exampleEvent = {
        event_id: '00000000-0000-0000-0000-000000000001',
        event: 'credential.updated',
        occurred_at: '2026-01-01T00:00:00+00:00',
        credential_mode: this.object.mode,
        credential_key: this.exampleKey,
        revision: 1,
        account_id: this.subscription
          ? this.object.subscription_accounts?.[0]?.id || '<account-id>'
          : this.object.active_account?.id || '<active-account-id>',
        operation_id: '00000000-0000-0000-0000-000000000002',
        result: 'success'
      }
      const snapshotItem = {
        key: this.exampleKey,
        credential_mode: this.object.mode,
        revision: 1
      }
      snapshotItem.account_id = exampleEvent.account_id
      if (!this.subscription) {
        const ids = [this.object.account?.id, this.object.alternate_account?.id].filter(Boolean)
        exampleEvent.account_switch = { account_ids: ids }
        snapshotItem.account_switch = exampleEvent.account_switch
      }

      const fields = [
        ['event_id', 'PolicyDocsFieldEventId'],
        ['event / occurred_at', 'PolicyDocsFieldEvent'],
        ['credential_mode', 'PolicyDocsFieldMode'],
        [
          'credential_key',
          this.subscription ? 'PolicyDocsFieldKeySubscription' : 'PolicyDocsFieldKeyRotation'
        ],
        [
          'revision',
          this.subscription
            ? 'PolicyDocsFieldRevisionSubscription'
            : 'PolicyDocsFieldRevisionRotation'
        ],
        ['account_id', 'PolicyDocsFieldAccount'],
        ['operation_id / result', 'PolicyDocsFieldOperation']
      ]
      let sdkExample =
        `from jms_pam.credential.v1 import models\n\n\n` +
        `def on_credential_updated(client, key):\n` +
        `    response = client.GetCredential(models.GetCredentialRequest(Key=key))\n` +
        `    # ${this.$t('PolicyDocsApplyComment')}\n` +
        `    apply_credential(response)\n`
      if (!this.subscription) {
        sdkExample +=
          `    client.ConfirmCredential(models.ConfirmCredentialRequest(\n` +
          `        Key=response.Key, Revision=response.Revision,\n` +
          `        AccountId=response.Account.Id,\n` +
          `    ))\n`
      }
      sdkExample += `\n\non_credential_updated(client, ${JSON.stringify(this.exampleKey)})`

      const lifecycle = [
        ...(this.subscription
          ? []
          : [
              heading('PolicyDocsSourceObservationTitle'),
              paragraph('PolicyDocsSourceObservationFlow')
            ]),
        heading('StartNewPolicyCycle'),
        paragraph(
          this.subscription
            ? 'PolicyDocsManualSubscriptionCycle'
            : 'PolicyDocsManualRotationCycleV2'
        )
      ].join('')
      const protocol = [
        heading('PolicyDocsEvents'),
        `| ${this.$t('PolicyDocsEvent')} | ${this.$t('PolicyDocsTrigger')} | ${this.$t('PolicyDocsResponse')} |\n| --- | --- | --- |\n`,
        eventRows.join('\n'),
        heading('PolicyDocsPayload'),
        paragraph('PolicyDocsPayloadIntroduction'),
        jsonBlock(exampleEvent),
        `| ${this.$t('PolicyDocsField')} | ${this.$t('Description')} |\n| --- | --- |\n`,
        fields
          .map(([field, description]) => `| \`${field}\` | ${this.$t(description)} |`)
          .join('\n'),
        heading('PolicyDocsSnapshot'),
        paragraph('PolicyDocsSnapshotDescription'),
        jsonBlock({ event: 'snapshot', credentials: [snapshotItem] }),
        paragraph('PolicyDocsHeartbeat'),
        heading('PolicyDocsReceipt'),
        paragraph('PolicyDocsReceiptDescription'),
        jsonBlock({ event: 'received', event_id: exampleEvent.event_id })
      ].join('')
      const integration = [
        heading('PolicyDocsSDK'),
        paragraph('PolicyDocsSDKSteps'),
        paragraph(this.subscription ? 'PolicyDocsSDKSubscription' : 'PolicyDocsSDKRotation'),
        paragraph('PolicyDocsSDKExample'),
        codeBlock('python', sdkExample),
        heading('PolicyDocsAgent'),
        paragraph('PolicyDocsAgentDescription'),
        paragraph(this.subscription ? 'PolicyDocsAgentSubscription' : 'PolicyDocsAgentRotation'),
        ...(!this.subscription
          ? [
              codeBlock(
                'http',
                `POST /v1/confirm\nContent-Type: application/json\n\n${JSON.stringify({ key: this.object.key, revision: 1 })}`
              ),
              paragraph('PolicyDocsAgentConfirmExample')
            ]
          : [])
      ].join('')
      return [
        { id: 'lifecycle', title: 'PolicyDocsLifecycle', content: lifecycle },
        { id: 'protocol', title: 'PolicyDocsProtocol', content: protocol },
        { id: 'integration', title: 'PolicyDocsIntegration', content: integration },
        {
          id: 'recovery',
          title: 'PolicyDocsRecoveryGuide',
          content: paragraph('PolicyDocsRecoveryDescription')
        }
      ]
    }
  },
  methods: {
    scrollToSection(id) {
      const section = this.$refs.document?.querySelector(`[data-section="${id}"]`)
      if (!section) return
      section.scrollIntoView({ block: 'start' })
      section.focus({ preventScroll: true })
    }
  }
}
</script>

<style lang="scss" scoped>
.policy-documentation {
  color: var(--el-text-color-primary);
  font-size: 13px;
  line-height: 1.75;
}
.policy-documentation-body {
  max-width: 1000px;
  min-width: 0;
  width: 100%;
  margin: 0 auto;
  color: var(--el-text-color-primary);
}
.policy-documentation-introduction > p {
  margin: 12px 0 16px;
  color: var(--el-text-color-regular);
  font-size: 12px;
}

.policy-documentation-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;

  > span {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  code {
    overflow-wrap: anywhere;
    font-size: 12px;
    color: var(--el-text-color-regular);
  }
}
.policy-documentation-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 16px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 12px;

  > span {
    color: var(--el-text-color-secondary);
  }

  button {
    padding: 4px 0;
    border: 0;
    background: transparent;
    color: var(--el-color-primary);
    font: inherit;
    cursor: pointer;
    text-align: left;

    &:hover {
      text-decoration: underline;
    }

    &:focus-visible {
      outline: 2px solid var(--el-color-primary);
      outline-offset: 3px;
    }
  }
}
.policy-documentation-section {
  min-width: 0;
  scroll-margin-top: 16px;

  > h2 {
    margin: 0 0 16px;
    font-size: 15px;
    line-height: 1.5;
    font-weight: 600;
  }

  + .policy-documentation-section {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

.policy-documentation-content {
  :deep(h3) {
    margin: 20px 0 10px;
    font-size: 13px;
    line-height: 1.5;
    font-weight: 600;
  }

  :deep(> h3:first-child) {
    margin-top: 0;
  }

  :deep(p),
  :deep(ol),
  :deep(ul) {
    margin: 0 0 14px;
  }

  :deep(ol),
  :deep(ul) {
    padding-left: 22px;
  }

  :deep(li) {
    margin: 6px 0;
  }

  :deep(table) {
    display: block;
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }

  :deep(th),
  :deep(td) {
    min-width: 140px;
    padding: 8px 10px;
    border: 1px solid var(--el-border-color-lighter);
    text-align: left;
    vertical-align: top;
    overflow-wrap: anywhere;
  }

  :deep(th) {
    background: var(--el-fill-color-light);
    font-size: 12px;
    font-weight: 600;
  }

  :deep(td:first-child code) {
    white-space: normal;
  }

  :deep(code:not(pre code)) {
    padding: 2px 4px;
    border-radius: 4px;
    background: var(--el-fill-color-light);
    overflow-wrap: anywhere;
    font-size: 12px;
  }

  :deep(.markdown-code-block) {
    border-radius: 4px;
  }

  :deep(pre) {
    padding: 12px;
    background: var(--el-fill-color-light);
    line-height: 1.6;
  }

  :deep(pre code) {
    background: transparent;
    color: var(--el-text-color-primary);
    font-size: 12px;
  }

  :deep(> :last-child) {
    margin-bottom: 0;
  }
}
</style>
