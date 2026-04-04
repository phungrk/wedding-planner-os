# Wedding Planner OS - Migration Plan

## Purpose

Tài liệu này mô tả **lộ trình chuyển đổi** từ skeleton hiện tại sang kiến trúc mục tiêu:

- **OpenClaw-centric orchestration**
- **domain-driven wedding workspace model**
- **multi-user collaboration**
- **planner persona catalog**
- **command/query split**

Mục tiêu là tiến hóa hệ thống theo từng pha, giữ khả năng chạy được sớm nhưng không tự khóa mình vào kiến trúc MVP.

---

## Current state summary

Hiện tại repo đang là một MVP skeleton với đặc điểm:

- Fastify server
- Telegram-first
- webhook endpoint trực tiếp
- `PlannerService` ôm phần lớn logic
- file-based persistence
- persona/checklist còn hardcoded một phần
- chưa có participant model thật
- chưa có command/query layer rõ ràng
- chưa có OpenClaw orchestration thực sự trong runtime design

---

## Target state summary

Trạng thái mục tiêu:

- OpenClaw là entry/orchestration layer cho Telegram interactions
- Wedding Planner OS là domain backend rõ ràng
- state centered around `workspaceId`
- support nhiều participant trong một workspace
- support nhiều planner persona data-driven
- command/query/workflow split rõ ràng
- reminders dùng OpenClaw cron nhưng canonical reminder state vẫn ở domain backend

---

## Migration strategy principles

### Principle 1
**Không rewrite lớn một lần.**
Đi từng phase, mỗi phase đều deploy được.

### Principle 2
**Giữ file-based store thêm một thời gian.**
Không đổi storage quá sớm nếu domain model còn đang dịch chuyển.

### Principle 3
**Tách domain contract trước khi tối ưu runtime.**
Nếu command/query contract chưa rõ mà đã nhảy sang nhiều service thì sẽ rất rối.

### Principle 4
**OpenClaw vào làm orchestration layer sau khi domain boundary đủ rõ.**
Nếu đưa OpenClaw vào quá sớm khi backend domain còn lẫn lộn, agent/tool layer sẽ thành spaghetti.

---

# Phase 0 - Baseline stabilization

## Goal
Làm sạch nền tảng hiện tại trước khi tách kiến trúc.

## Deliverables
- giữ app chạy ổn ở long polling hoặc mode ổn định
- đóng băng behavior hiện tại bằng tài liệu
- thêm docs kiến trúc/domain/migration
- chuẩn hóa folder/data conventions

## Tasks
- [x] Viết `_ARCHITECTURE.md`
- [x] Viết `_DOMAIN_MODEL.md`
- [x] Viết `_MIGRATION_PLAN.md`
- [ ] Review lại state files hiện tại
- [ ] Chuẩn hóa naming cho persona/template/state files
- [ ] Bổ sung `.env.example` rõ hơn cho Telegram/OpenClaw integration

## Exit criteria
- team hiểu current state và target state
- có tài liệu làm mốc để refactor

---

# Phase 1 - Domain boundary extraction

## Goal
Tách domain logic ra khỏi route/controller và chuẩn hóa command/query boundaries.

## Main idea
Biến hệ thống từ:

- Telegram route -> PlannerService -> state gateway

thành:

- route/transport -> application command/query layer -> domain gateway

## Deliverables
- command layer
- query layer
- domain DTOs rõ ràng
- tách intent handling khỏi persistence orchestration

## Recommended modules

```text
src/modules/
  commands/
    assign-planner.command.ts
    update-profile.command.ts
    add-participant.command.ts
    build-starter-checklist.command.ts
  queries/
    get-workspace-snapshot.query.ts
    get-summary.query.ts
    get-participants.query.ts
  workflows/
    onboarding.workflow.ts
```

## Tasks
- [ ] Tạo `Command API` nội bộ
- [ ] Tạo `Query API` nội bộ
- [ ] Refactor `PlannerService` thành orchestrator mỏng hơn
- [ ] Giữ `WorkspaceStateGateway` chỉ làm persistence/projection, giảm business logic
- [ ] Tách response text builder khỏi write-side logic

## Exit criteria
- mọi thay đổi state đi qua command objects rõ ràng
- mọi read quan trọng đi qua query objects rõ ràng
- route layer không chứa business logic

---

# Phase 2 - Data model expansion

## Goal
Nâng domain model lên mức support collaboration thật.

## Why now
Skeleton hiện tại chủ yếu mới support:
- 1 user
- 1 active workspace
- 1 identity source (telegram)
- 1 planner assignment đơn giản

Muốn làm Wedding Planner OS thật phải thêm participant model.

## Deliverables
- `Participant`
- `PlannerPersona` catalog data-driven
- `ConversationRef`
- `DecisionRecord`
- `Reminder`
- `BudgetEnvelope`
- `VendorCandidate`

## Tasks

### 2.1 Participant model
- [ ] thêm `participants.json`
- [ ] hỗ trợ bride/groom/family/viewer roles
- [ ] define permission presets

### 2.2 Persona catalog
- [ ] load personas từ `data/personas/*`
- [ ] bỏ hardcoded persona catalog trong code
- [ ] map persona -> checklist template / rules preset

### 2.3 Budget and vendors
- [ ] thêm `budget.json`
- [ ] thêm `vendors.json` shape rõ ràng hơn
- [ ] chuẩn hóa vendor statuses

### 2.4 Decisions and reminders
- [ ] thêm schema đầy đủ cho `decisions.json`
- [ ] thêm schema đầy đủ cho `reminders.json`
- [ ] phân biệt canonical reminder record và runtime scheduler binding

### 2.5 Conversation references
- [ ] tạo mapping `workspace <-> transport/session`
- [ ] support DM + group/topic mapping

## Exit criteria
- 1 workspace support nhiều participant
- persona không còn hardcoded
- state shape đủ để support collaboration + reminders + vendor planning

---

# Phase 3 - OpenClaw integration as orchestration front door

## Goal
Đưa OpenClaw thành lớp orchestration thật sự cho Telegram planner interactions.

## Main idea
Thay vì để app backend tự xử lý full conversation loop, chuyển sang:

- Telegram -> OpenClaw
- OpenClaw session/agent -> invoke domain commands/queries
- Wedding Planner OS -> canonical state backend

## Deliverables
- OpenClaw tool layer cho Wedding Planner commands/queries
- workspace-aware session routing
- memory integration
- agent persona selection tied to workspace planner persona

## Integration model

```text
Telegram
  -> OpenClaw channel runtime
  -> Planner agent session
  -> Wedding Planner command/query tools
  -> Wedding Planner state store
```

## Tasks
- [ ] xác định contract tool layer
- [ ] expose command/query endpoints hoặc local callable modules
- [ ] tạo session binding strategy theo workspace
- [ ] tạo memory sync rules giữa OpenClaw memory và domain state
- [ ] tạo planner persona -> agent prompt policy binding

## Exit criteria
- Telegram conversation được OpenClaw điều phối
- state write không còn đi trực tiếp từ route vào domain service kiểu cũ
- OpenClaw đọc được workspace snapshot và hành động bằng domain commands

---

# Phase 4 - Collaboration model

## Goal
Hỗ trợ thực sự case:
- cô dâu add chú rể
- thêm người liên quan
- cùng trao đổi trong một wedding workspace

## Deliverables
- participant invitation flow
- role-based access control
- shared workspace conversation strategy
- DM + group chat collaboration model

## Recommended interaction model

### Primary mode
- mỗi participant chat riêng với bot
- cùng bind về một workspace

### Secondary mode
- bot được add vào group Telegram chung
- group/topic map vào workspace

## Tasks
- [ ] command `addParticipant`
- [ ] command `acceptInvitation`
- [ ] query `getParticipantList`
- [ ] policy: ai được mời thêm người
- [ ] policy: ai được đổi planner persona
- [ ] session binding for DM and group contexts

## Exit criteria
- workspace có thể có nhiều user thật
- mỗi người có vai trò và quyền khác nhau
- AI vẫn giữ được context nhất quán của cùng một wedding

---

# Phase 5 - Reminder and workflow automation

## Goal
Tận dụng OpenClaw cron thật sự để biến hệ thống thành OS chứ không chỉ là chatbot.

## Deliverables
- scheduled reminders
- follow-up workflows
- auto-generated nudges
- timeline-driven automation

## Example automations
- nhắc follow-up venue sau 3 ngày chưa phản hồi
- nhắc confirm số khách trước deadline
- nhắc đặt cọc vendor
- nhắc chốt concept trước mốc timeline

## Tasks
- [ ] map domain reminder -> OpenClaw cron jobs
- [ ] build reminder reconciliation flow
- [ ] add workflow transitions based on deadlines
- [ ] add escalation logic for overdue critical tasks

## Exit criteria
- wedding planner chủ động nhắc việc
- reminders bền vững, observable, cancel/update được

---

# Phase 6 - Projection and operator visibility

## Goal
Làm hệ thống dễ vận hành, dễ support, dễ phân tích.

## Deliverables
- admin/debug read models
- workspace health snapshot
- risk scoring
- progress dashboards
- summary export

## Useful projections
- latest-state
- planning readiness score
- budget risk summary
- vendor funnel
- overdue tasks
- pending decisions
- upcoming reminders

## Tasks
- [ ] tạo read model cho dashboard
- [ ] tạo admin/debug routes
- [ ] tạo ops summary per workspace
- [ ] tạo summary export markdown/pdf/json

## Exit criteria
- operator nhìn được state toàn hệ nhanh
- AI responses có backing projections rõ ràng

---

# Phase 7 - Advanced planner intelligence

## Goal
Nâng hệ từ planning assistant lên planning OS có chiều sâu.

## Possible capabilities
- vendor comparison assistant
- budget stress testing
- plan alternatives generation
- persona-aware recommendation engine
- timeline optimizer
- negotiation prep summaries

## OpenClaw role
Dùng subagents cho:
- budget analysis
- vendor research
- concept brainstorming
- timeline optimization

## Exit criteria
- hệ không chỉ ghi nhận dữ liệu mà còn tư vấn chủ động, có reasoning hữu ích

---

## Refactor map: from current files to target structure

### Current structure
- `telegram.routes.ts`
- `planner.service.ts`
- `workspace-state.gateway.ts`
- `personas.service.ts`
- `checklist.service.ts`

### Target direction

```text
src/modules/
  transport/
    telegram/
  application/
    commands/
    queries/
    workflows/
  domain/
    workspaces/
    participants/
    planners/
    budgets/
    vendors/
    reminders/
  projections/
  integrations/openclaw/
```

---

## Data migration considerations

### Current files likely reusable
- `user.json`
- `identities.json`
- `workspace.json`
- `planner.json`
- `profile.json`
- `tasks.json`
- `summary.md`
- `latest-state.json`

### New files likely needed
- `participants.json`
- `budget.json`
- `conversation-refs.json`
- `planner-catalog` loaded from data
- richer `decisions.json`
- richer `reminders.json`

### Migration style recommendation
- additive migrations first
- avoid destructive rewrites
- allow dual-read for a while if needed

---

## Risks and cautions

### Risk 1 - Overloading OpenClaw with domain state
Không nên nhét canonical wedding state hết vào memory/session của OpenClaw.

### Risk 2 - Using Telegram identifiers as domain primary keys
Sẽ hỏng ngay khi support collaboration hoặc multi-channel.

### Risk 3 - Too much AI logic in prompt only
Business logic quan trọng phải được encode thành command/rule/workflow, không chỉ sống trong prompt.

### Risk 4 - Premature database migration
Nếu domain model chưa ổn mà chuyển DB sớm sẽ tốn công migration 2 lần.

### Risk 5 - No clear permission model
Khi có bride/groom/family cùng tham gia, thiếu permission model sẽ rất nguy hiểm.

---

## Suggested milestone roadmap

### Milestone A - Clean domain foundation
- Phase 1 + Phase 2

### Milestone B - OpenClaw-driven planner runtime
- Phase 3

### Milestone C - Real collaboration
- Phase 4

### Milestone D - Reminders and automation
- Phase 5

### Milestone E - Operations and intelligence
- Phase 6 + Phase 7

---

## Definition of success

Hệ thống được coi là đạt target architecture khi:

- Telegram chỉ còn là transport layer
- OpenClaw là orchestration runtime chính
- Wedding Planner OS có command/query/workflow boundaries rõ ràng
- một workspace support nhiều participant
- planner personas là data-driven catalog
- reminders và workflows chạy chủ động
- state canonical tách rõ khỏi AI memory/runtime

---

## Final summary

> **Lộ trình migration của Wedding Planner OS nên đi từ việc làm rõ domain boundaries, mở rộng data model, rồi mới đưa OpenClaw vào làm orchestration front door, sau đó mới thêm collaboration, reminders và intelligence layers.**

> **Đi chậm từng pha nhưng deployable sẽ an toàn hơn rất nhiều so với rewrite lớn một lần.**
