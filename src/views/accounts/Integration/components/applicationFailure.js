const failureLabels = {
  credential_check_failed: 'CredentialCheckFailed',
  config_update_failed: 'BusinessConfigUpdateFailed',
  service_action_failed: 'ServiceActionFailed',
  application_check_failed: 'ApplicationCheckFailed',
  service_update_failed: 'ServiceUpdateFailed',
  manual_review_test_failed: 'ApplicationSimulatedFailure',
  execution_failed: 'ApplicationCommandExecutionFailed',
  superseded: 'ApplicationCommandSuperseded'
}

export function applicationFailureLabel(code) {
  return failureLabels[code] || 'CredentialApplicationFailed'
}
