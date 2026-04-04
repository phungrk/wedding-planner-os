# Wedding Planner OS - Target `src/` Tree

## Purpose

Tài liệu này mô tả **cây thư mục `src/` mục tiêu** cho Wedding Planner OS theo kiến trúc mới, nơi:

- **OpenClaw** đóng vai trò orchestration/runtime layer
- **Wedding Planner OS** đóng vai trò domain backend/platform
- `src/` không còn là nơi ôm trọn Telegram conversation orchestration, mà là nơi giữ domain logic, command/query/workflow logic, projections và integrations

---

## Design principle

> **OpenClaw lo điều phối hội thoại, agent, memory, reminders. `src/` của Wedding Planner OS lo domain state, business rules, command/query workflows và integrations.**

---

## Target tree

```text
src/
├── server/
│   ├── app.ts
│   ├── server.ts
│   └── routes/
│       ├── health.routes.ts
│       ├── admin.routes.ts
│       ├── commands.routes.ts
│       ├── queries.routes.ts
│       └── webhooks.routes.ts
│
├── application/
│   ├── commands/
│   │   ├── workspaces/
│   │   │   ├── create-workspace.command.ts
│   │   │   ├── archive-workspace.command.ts
│   │   │   └── set-primary-contact.command.ts
│   │   │
│   │   ├── participants/
│   │   │   ├── add-participant.command.ts
│   │   │   ├── remove-participant.command.ts
│   │   │   ├── accept-invitation.command.ts
│   │   │   └── change-participant-role.command.ts
│   │   │
│   │   ├── planners/
│   │   │   ├── assign-planner-persona.command.ts
│   │   │   └── switch-planner-mode.command.ts
│   │   │
│   │   ├── profiles/
│   │   │   ├── update-wedding-profile.command.ts
│   │   │   ├── set-budget-target.command.ts
│   │   │   ├── set-guest-target.command.ts
│   │   │   └── set-event-date.command.ts
│   │   │
│   │   ├── tasks/
│   │   │   ├── generate-starter-checklist.command.ts
│   │   │   ├── add-task.command.ts
│   │   │   ├── complete-task.command.ts
│   │   │   ├── block-task.command.ts
│   │   │   └── reprioritize-task.command.ts
│   │   │
│   │   ├── vendors/
│   │   │   ├── add-vendor-candidate.command.ts
│   │   │   ├── shortlist-vendor.command.ts
│   │   │   ├── book-vendor.command.ts
│   │   │   └── reject-vendor.command.ts
│   │   │
│   │   ├── decisions/
│   │   │   ├── record-decision.command.ts
│   │   │   └── revise-decision.command.ts
│   │   │
│   │   ├── reminders/
│   │   │   ├── schedule-reminder.command.ts
│   │   │   ├── cancel-reminder.command.ts
│   │   │   └── complete-reminder.command.ts
│   │   │
│   │   └── conversations/
│   │       ├── bind-conversation.command.ts
│   │       └── log-message.command.ts
│   │
│   ├── queries/
│   │   ├── workspaces/
│   │   │   ├── get-workspace.query.ts
│   │   │   ├── get-workspace-snapshot.query.ts
│   │   │   └── list-user-workspaces.query.ts
│   │   │
│   │   ├── participants/
│   │   │   ├── get-participant-list.query.ts
│   │   │   └── get-access-policy.query.ts
│   │   │
│   │   ├── planners/
│   │   │   ├── list-planner-personas.query.ts
│   │   │   └── get-active-planner.query.ts
│   │   │
│   │   ├── profiles/
│   │   │   ├── get-wedding-profile.query.ts
│   │   │   └── get-profile-completeness.query.ts
│   │   │
│   │   ├── tasks/
│   │   │   ├── get-task-board.query.ts
│   │   │   ├── get-open-tasks.query.ts
│   │   │   └── get-next-important-task.query.ts
│   │   │
│   │   ├── budgets/
│   │   │   ├── get-budget-summary.query.ts
│   │   │   └── get-budget-risk.query.ts
│   │   │
│   │   ├── vendors/
│   │   │   ├── get-vendor-board.query.ts
│   │   │   └── get-vendor-shortlist.query.ts
│   │   │
│   │   ├── reminders/
│   │   │   ├── get-upcoming-reminders.query.ts
│   │   │   └── get-overdue-reminders.query.ts
│   │   │
│   │   ├── summaries/
│   │   │   ├── get-summary.query.ts
│   │   │   ├── get-latest-state.query.ts
│   │   │   └── get-next-best-action.query.ts
│   │   │
│   │   └── conversations/
│   │       ├── get-conversation-refs.query.ts
│   │       └── get-conversation-history.query.ts
│   │
│   ├── workflows/
│   │   ├── onboarding/
│   │   │   ├── start-onboarding.workflow.ts
│   │   │   ├── complete-onboarding.workflow.ts
│   │   │   └── invite-groom.workflow.ts
│   │   │
│   │   ├── planning/
│   │   │   ├── venue-selection.workflow.ts
│   │   │   ├── budget-tightening.workflow.ts
│   │   │   ├── guestlist-alignment.workflow.ts
│   │   │   └── vendor-followup.workflow.ts
│   │   │
│   │   ├── reminders/
│   │   │   ├── reconcile-reminders.workflow.ts
│   │   │   └── overdue-escalation.workflow.ts
│   │   │
│   │   └── summaries/
│   │       └── rebuild-summary.workflow.ts
│   │
│   └── dto/
│       ├── commands/
│       ├── queries/
│       └── responses/
│
├── domain/
│   ├── workspaces/
│   │   ├── workspace.entity.ts
│   │   ├── workspace.types.ts
│   │   ├── workspace.errors.ts
│   │   └── workspace.policy.ts
│   │
│   ├── users/
│   │   ├── user.entity.ts
│   │   ├── identity.entity.ts
│   │   └── user.types.ts
│   │
│   ├── participants/
│   │   ├── participant.entity.ts
│   │   ├── participant.types.ts
│   │   ├── participant.roles.ts
│   │   └── participant.policy.ts
│   │
│   ├── planners/
│   │   ├── planner-persona.entity.ts
│   │   ├── planner-assignment.entity.ts
│   │   ├── planner.types.ts
│   │   └── planner-policy.ts
│   │
│   ├── profiles/
│   │   ├── wedding-profile.entity.ts
│   │   ├── profile.types.ts
│   │   └── profile-rules.ts
│   │
│   ├── tasks/
│   │   ├── task.entity.ts
│   │   ├── checklist-template.entity.ts
│   │   ├── task.types.ts
│   │   └── task-rules.ts
│   │
│   ├── budgets/
│   │   ├── budget-envelope.entity.ts
│   │   ├── budget-category.entity.ts
│   │   ├── budget.types.ts
│   │   └── budget-rules.ts
│   │
│   ├── vendors/
│   │   ├── vendor-candidate.entity.ts
│   │   ├── vendor.types.ts
│   │   └── vendor-rules.ts
│   │
│   ├── decisions/
│   │   ├── decision.entity.ts
│   │   └── decision.types.ts
│   │
│   ├── reminders/
│   │   ├── reminder.entity.ts
│   │   ├── reminder.types.ts
│   │   └── reminder-rules.ts
│   │
│   ├── timelines/
│   │   ├── timeline.entity.ts
│   │   ├── milestone.entity.ts
│   │   └── timeline.types.ts
│   │
│   ├── conversations/
│   │   ├── conversation-ref.entity.ts
│   │   └── conversation.types.ts
│   │
│   └── shared/
│       ├── value-objects/
│       ├── domain-event.ts
│       ├── aggregate-root.ts
│       └── result.ts
│
├── projections/
│   ├── latest-state/
│   │   ├── latest-state.projector.ts
│   │   └── latest-state.types.ts
│   │
│   ├── summaries/
│   │   ├── summary.projector.ts
│   │   ├── summary.builder.ts
│   │   └── summary.types.ts
│   │
│   ├── risks/
│   │   ├── risk-score.projector.ts
│   │   └── risk-flags.projector.ts
│   │
│   └── dashboards/
│       ├── workspace-dashboard.projector.ts
│       └── ops-dashboard.projector.ts
│
├── infrastructure/
│   ├── persistence/
│   │   ├── repositories/
│   │   │   ├── workspace.repository.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── participant.repository.ts
│   │   │   ├── planner.repository.ts
│   │   │   ├── task.repository.ts
│   │   │   ├── vendor.repository.ts
│   │   │   ├── reminder.repository.ts
│   │   │   └── decision.repository.ts
│   │   │
│   │   ├── file-store/
│   │   │   ├── state.io.ts
│   │   │   ├── state.paths.ts
│   │   │   ├── migrations/
│   │   │   └── file-store.types.ts
│   │   │
│   │   └── projections/
│   │       └── projection.store.ts
│   │
│   ├── integrations/
│   │   ├── openclaw/
│   │   │   ├── openclaw-tools.ts
│   │   │   ├── session-binding.ts
│   │   │   ├── memory-sync.ts
│   │   │   ├── cron-sync.ts
│   │   │   └── agent-prompt-policy.ts
│   │   │
│   │   ├── telegram/
│   │   │   ├── telegram.types.ts
│   │   │   ├── telegram.sender.ts
│   │   │   ├── telegram.mapper.ts
│   │   │   └── telegram.webhook-fallback.ts
│   │   │
│   │   ├── calendar/
│   │   │   └── calendar.connector.ts
│   │   │
│   │   ├── storage/
│   │   │   └── blob-storage.ts
│   │   │
│   │   └── github/
│   │       └── github-export.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── app-config.ts
│   │   └── feature-flags.ts
│   │
│   └── logging/
│       ├── logger.ts
│       └── audit-log.ts
│
├── policies/
│   ├── participant-access.policy.ts
│   ├── planner-selection.policy.ts
│   ├── budget-risk.policy.ts
│   ├── reminder-delivery.policy.ts
│   └── conversation-routing.policy.ts
│
├── shared/
│   ├── ids.ts
│   ├── json.ts
│   ├── time.ts
│   ├── errors.ts
│   ├── types.ts
│   ├── guards.ts
│   └── constants.ts
│
└── scripts/
    ├── seed.ts
    ├── rebuild-projections.ts
    ├── migrate-state.ts
    ├── import-telegram-identities.ts
    └── bootstrap-openclaw-integration.ts
```

---

## Role of each top-level folder

## `server/`
Lớp HTTP/API shell.

Không nên giữ business logic nặng ở đây.

Vai trò:
- boot app
- register routes
- expose health/admin/query/command endpoints

---

## `application/`
Lớp use-case orchestration nội bộ của Wedding Planner OS.

### `commands/`
Mọi write-side action đi qua đây.

### `queries/`
Mọi read-side action đi qua đây.

### `workflows/`
Các quy trình nhiều bước.

---

## `domain/`
Business core thật sự.

Chứa:
- entities
- types
- domain rules
- domain policies

Domain logic quan trọng không nên để rơi sang prompt hoặc route layer.

---

## `projections/`
Read models/derived views.

Ví dụ:
- latest-state
- summary
- risk flags
- dashboard snapshots

---

## `infrastructure/`
Lớp hạ tầng kỹ thuật.

### `persistence/`
Repositories, file-store, migrations, projection stores.

### `integrations/openclaw/`
Cầu nối với OpenClaw runtime:
- tool contracts
- session binding
- memory sync
- cron sync
- prompt policy

### `integrations/telegram/`
Telegram không còn là business center.
Chỉ là adapter/fallback transport.

---

## `policies/`
Các policy xuyên domain hoặc cấp hệ thống.

Ví dụ:
- ai được add participant
- ai được switch planner
- reminder gửi cho ai
- route conversation vào workspace nào

---

## `shared/`
Utilities và common primitives.

---

## `scripts/`
Script vận hành/migration/rebuild.

---

## Recommended migration path for `src/`

### Step 1
Tách `PlannerService` hiện tại thành:
- commands
- queries
- workflows

### Step 2
Di chuyển logic state write/read về repository + application layer rõ ràng

### Step 3
Thêm `integrations/openclaw/` để OpenClaw không gọi raw internals nữa

### Step 4
Biến Telegram transport thành adapter thay vì business entrypoint

---

## Lite version (recommended first)

Nếu chưa muốn mở rộng full tree ngay, có thể dùng bản rút gọn:

```text
src/
├── server/
├── application/
│   ├── commands/
│   ├── queries/
│   └── workflows/
├── domain/
├── projections/
├── infrastructure/
│   ├── persistence/
│   └── integrations/
│       ├── openclaw/
│       └── telegram/
├── shared/
└── scripts/
```

Rồi sau này tách dần theo domain.

---

## Final summary

> **Target `src/` tree của Wedding Planner OS cần phản ánh kiến trúc mới: route/app shell mỏng, application layer rõ ràng, domain core tách riêng, projections riêng, infrastructure/integrations riêng, và có một nhánh dedicated cho OpenClaw integration.**

> **OpenClaw điều phối conversation/runtime; `src/` điều phối domain/backend.**
