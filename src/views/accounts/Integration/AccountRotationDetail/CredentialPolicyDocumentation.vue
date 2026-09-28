<template>
  <article class="policy-documentation">
    <header>
      <h2>{{ $t('PolicyDocsTitle') }}</h2>
      <div class="policy-documentation-meta">
        <el-tag effect="plain">{{ modeLabel }}</el-tag>
        <code>{{ object.key }}</code>
      </div>
      <p>{{ $t('PolicyDocsIntroduction') }}</p>
    </header>
    <el-alert :title="modeSummary" type="info" :closable="false" show-icon />
    <MarkdownRenderer :source="documentation" copyable-code class="policy-documentation-content" />
  </article>
</template>

<script>
import MarkdownRenderer from '@/components/Widgets/MarkdownRenderer/index.vue'

const codeBlock = (language, value) => `\n\n\`\`\`${language}\n${value}\n\`\`\`\n\n`
const jsonBlock = (value) => codeBlock('json', JSON.stringify(value, null, 2))

export default {
  name: 'CredentialPolicyDocumentation',
  components: { MarkdownRenderer },
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
        this.subscription ? 'PolicyDocsSubscriptionSummary' : 'PolicyDocsRotationSummary'
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
            'rotation.preparation.started',
            'rotation.accounts.aligned',
            'rotation.standby.waiting',
            'rotation.preparation.ready',
            'rotation.preparation.cancelled'
          ].map((event) => [event, 'PolicyDocsPreparationTrigger', 'PolicyDocsPreparationAction']),
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
    documentation() {
      const heading = (key) => `\n\n## ${this.$t(key)}\n\n`
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
          : null,
        operation_id: '00000000-0000-0000-0000-000000000002',
        result: 'success'
      }
      const snapshotItem = {
        key: this.exampleKey,
        credential_mode: this.object.mode,
        revision: 1
      }
      if (this.subscription) snapshotItem.account_id = exampleEvent.account_id

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

      return [
        ...(this.subscription
          ? []
          : [heading('PolicyDocsPreparationTitle'), paragraph('PolicyDocsPreparationFlow')]),
        heading('StartNewPolicyCycle'),
        paragraph(
          this.subscription ? 'PolicyDocsManualSubscriptionCycle' : 'PolicyDocsManualRotationCycle'
        ),
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
        heading('PolicyDocsSDK'),
        paragraph('PolicyDocsSDKSteps'),
        paragraph(this.subscription ? 'PolicyDocsSDKSubscription' : 'PolicyDocsSDKRotation'),
        paragraph('PolicyDocsSDKExample'),
        codeBlock('python', sdkExample),
        heading('PolicyDocsReceipt'),
        paragraph('PolicyDocsReceiptDescription'),
        jsonBlock({ event: 'received', event_id: exampleEvent.event_id }),
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
          : []),
        heading('PolicyDocsRecovery'),
        paragraph('PolicyDocsRecoveryDescription')
      ].join('')
    }
  }
}
</script>

<style lang="scss" scoped>
.policy-documentation {
  max-width: 1000px;
  margin: 0 auto;
  padding: 8px 0 20px;
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 1.75;

  header h2 {
    margin: 0 0 12px;
    font-size: 20px;
  }

  header p {
    margin: 16px 0;
  }
}

.policy-documentation-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;

  code {
    overflow-wrap: anywhere;
  }
}

.policy-documentation-content {
  :deep(h2) {
    margin: 32px 0 14px;
    font-size: 18px;
    line-height: 1.4;
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
    overflow-x: auto;
    border-collapse: collapse;
  }

  :deep(th),
  :deep(td) {
    padding: 10px 12px;
    border: 1px solid var(--el-border-color-lighter);
    text-align: left;
    vertical-align: top;
  }

  :deep(th) {
    background: var(--el-fill-color-light);
  }

  :deep(td:first-child code) {
    white-space: nowrap;
  }

  :deep(code:not(pre code)) {
    padding: 2px 4px;
    border-radius: 4px;
    background: var(--el-fill-color-light);
    overflow-wrap: anywhere;
  }

  :deep(pre) {
    padding: 16px;
    line-height: 1.6;
  }
}
</style>
