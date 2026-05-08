# 0014 - Error Handling Conventions

## Status

Accepted

## Context

The backend should never panic on expected failures and should expose clear JSON
errors to the frontend.

## Decision

Use standard Go errors with `%w`, return JSON `{"error": "..."}`, and keep
`internal/utils.HandleErrorOrLogWithMessages(err, errMsg, successMsg)` for the
standing convention. The Python worker reports warnings in successful responses
and fails with stderr plus JSON on unrecoverable errors.

## Consequences

- Frontend can show readable failure states.
- Worker dependency problems degrade where possible.
- Logs retain wrapped error context.

## Alternatives Considered

- Panics and recovery middleware: rejected for normal API failures.
