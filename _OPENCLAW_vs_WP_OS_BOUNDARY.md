# Wedding Planner OS - OpenClaw vs WP OS Boundary

## Purpose

Tài liệu này làm rõ ranh giới giữa:

- **OpenClaw**
- và **Wedding Planner OS**

trong kiến trúc mục tiêu.

Mục tiêu là tránh hiểu nhầm phổ biến kiểu:

- OpenClaw sẽ làm hết mọi thứ
- Wedding Planner OS chỉ còn là vài file JSON/Markdown

hoặc ngược lại:

- Wedding Planner OS vẫn tự làm bot runtime/orchestration chính

Tài liệu này chốt rõ:

- phần nào thuộc OpenClaw
- phần nào thuộc Wedding Planner OS
- phần nào là shared boundary/contract

---

## One-sentence summary

> **OpenClaw là conversational runtime và orchestration layer. Wedding Planner OS là wedding domain backend và canonical state engine.**

---

## The simplest mental model

### OpenClaw
= **nhận message + nghĩ + điều phối + gọi công cụ + nhắc việc**

### Wedding Planner OS
= **hiểu luật nghiệp vụ + giữ state chuẩn + trả dữ liệu/domain result**

---

## What OpenClaw is responsible for

## 1. Receiving user messages
OpenClaw là nơi nhận inbound message từ user qua các channel như:
- Telegram
- web chat
- internal operator chat
- các channel tương lai

### Meaning
OpenClaw là **front door** của conversation runtime.

---

## 2. Session continuity
OpenClaw giữ:
- session history
- conversation flow
- ngữ cảnh trao đổi gần đây
- session/workspace routing runtime

### Meaning
OpenClaw là nơi user “nói chuyện với hệ”.

---

## 3. AI reasoning
OpenClaw chịu trách nhiệm:
- hiểu intent từ tin nhắn tự nhiên
- suy luận câu trả lời nên là gì
- quyết định khi nào cần gọi command/query/workflow nào
- quyết định khi nào hỏi lại user để làm rõ

### Meaning
OpenClaw là **conversational brain/runtime**.

---

## 4. Tool orchestration
OpenClaw gọi:
- commands
- queries
- workflows
- subagents
- memory tools
- cron tools

### Meaning
OpenClaw là lớp **điều phối runtime** giữa AI reasoning và domain backend.

---

## 5. Memory
OpenClaw giữ:
- conversational memory
- user preference trong hội thoại
- tone preference
- short/medium-term continuity

### Example
- Boss thích Capy trả lời tiếng Việt
- cặp đôi thích xưng hô kiểu nào
- họ thích câu trả lời ngắn hay dài
- họ nghiêng về phong cách lãng mạn nhưng chưa chốt thành canonical setting

---

## 6. Cron/reminder runtime
OpenClaw nên là nơi:
- schedule reminder runtime
- wake session
- trigger follow-up proactive messages
- fan out reminder delivery

### Meaning
OpenClaw là **execution engine** cho reminders, không phải canonical reminder database.

---

## 7. Multi-agent execution
OpenClaw nên điều phối:
- budget analysis subagent
- vendor research subagent
- timeline optimization subagent
- summary/review subagent

---

## What Wedding Planner OS is responsible for

## 1. Canonical wedding domain state
Wedding Planner OS là nơi giữ dữ liệu chuẩn của nghiệp vụ cưới.

Ví dụ:
- users
- identities
- participants
- workspaces
- planner assignment
- profile
- task board
- vendors
- decisions
- reminders
- timeline

### Meaning
Nếu một fact quan trọng tới mức ảnh hưởng workflow/business logic, nó phải sống ở đây.

---

## 2. Domain commands
Wedding Planner OS phải có code để xử lý các thay đổi state như:
- update wedding profile
- assign planner persona
- add participant
- record decision
- schedule reminder record
- add vendor candidate
- complete task

### Meaning
Business-critical state change không nên sống thuần trong prompt.

---

## 3. Domain queries
Wedding Planner OS phải trả được:
- workspace snapshot
- summary
- budget view
- task board
- participant list
- vendor shortlist
- upcoming reminders
- latest state projection

### Meaning
OpenClaw cần dữ liệu sạch để reasoning, thay vì đọc raw files lung tung.

---

## 4. Domain workflows
Wedding Planner OS nên xử lý các workflow domain như:
- onboarding
- participant invitation
- checklist bootstrap
- venue selection flow
- reminder reconciliation
- vendor follow-up state flow

### Meaning
Workflow domain không nên bị encode hết vào prompt runtime.

---

## 5. Business rules and policies
Wedding Planner OS nên enforce:
- participant access rules
- planner switching policy
- budget rules
- reminder state rules
- workflow preconditions
- data validation

### Meaning
Prompt có thể hỗ trợ reasoning, nhưng rule enforcement phải nằm trong backend/domain layer.

---

## 6. Projections / read models
Wedding Planner OS nên dựng:
- summary markdown
- latest-state projection
- risk flags
- dashboard views
- next-best-action backing data

### Meaning
Projection là dạng dữ liệu đã qua tổ chức để OpenClaw và UI đọc nhanh.

---

## 7. Auditability
Wedding Planner OS nên giữ audit-friendly records cho các command state change:
- ai làm
- lúc nào
- từ channel nào
- đổi field nào

---

## What Wedding Planner OS is NOT supposed to own in target architecture

Wedding Planner OS **không nên** là nơi chính để:
- nhận Telegram inbound message trực tiếp như bot runtime chính
- giữ conversational memory ngắn hạn thay OpenClaw
- giữ scheduling runtime thay OpenClaw cron
- làm AI orchestration layer chính

---

## What OpenClaw is NOT supposed to own in target architecture

OpenClaw **không nên** là nơi:
- giữ toàn bộ wedding domain state như source of truth
- quyết định business invariants chỉ bằng prompt
- trực tiếp mutate raw state files không qua command/query contracts
- dùng memory để thay thế canonical domain persistence

---

## Boundary rule: who owns what?

## OpenClaw owns
- inbound/outbound chat runtime
- session continuity
- AI reasoning
- tool selection
- memory
- reminders runtime
- subagents

## Wedding Planner OS owns
- domain model
- domain rules
- canonical persistence
- projections
- workflow state
- participant model
- persona catalog
- audit trail

---

## Shared boundary layer

Giữa hai bên phải có **contract layer** rõ ràng.

## Contract types

### Commands
Các action đổi state.

Ví dụ:
- `updateWeddingProfile`
- `assignPlannerPersona`
- `addParticipant`
- `recordDecision`
- `scheduleReminder`

### Queries
Các action đọc state.

Ví dụ:
- `getWorkspaceSnapshot`
- `getSummary`
- `getTaskBoard`
- `getParticipantList`

### Workflows
Các action nhiều bước.

Ví dụ:
- `runOnboardingFlow`
- `generateStarterChecklist`
- `reconcileReminders`

---

## Example: how a single user message should be handled

### User message
> “Bọn mình cưới tháng 12 ở Hà Nội, ngân sách 300 triệu”

## OpenClaw does
1. nhận tin nhắn
2. xác định session/workspace
3. hiểu intent và extract facts
4. quyết định gọi command `updateWeddingProfile`
5. nhận result
6. viết response conversational cho user

## Wedding Planner OS does
1. validate patch
2. update canonical profile
3. rebuild summary/latest-state
4. trigger checklist workflow nếu cần
5. trả state/result cho OpenClaw

---

## Example: reminder ownership

## Wedding Planner OS owns
- reminder record
- reminder meaning
- target participants
- reminder status

## OpenClaw owns
- cron job runtime
- wake event
- sending reminder message
- retry/announce behavior

### Rule
Reminder canonical state ở WP OS, reminder execution runtime ở OpenClaw.

---

## Example: planner persona ownership

## Wedding Planner OS owns
- planner persona catalog
- persona metadata
- checklist defaults
- persona policies

## OpenClaw owns
- apply persona into prompt/runtime behavior
- use persona metadata during agent response generation

### Rule
WP OS định nghĩa persona. OpenClaw thi hành persona trong conversation runtime.

---

## Example: participant access ownership

## Wedding Planner OS owns
- participant list
- participant roles
- permission model
- access validation

## OpenClaw owns
- sender resolution at runtime
- route message vào workspace phù hợp
- respect backend permission result in conversation flow

### Rule
Permission phải được enforce ở WP OS backend, không chỉ bằng prompt ở OpenClaw.

---

## Why `.ts` files still matter in Wedding Planner OS

Một hiểu nhầm hay gặp là:

> nếu OpenClaw nhận message và điều phối rồi thì Wedding Planner OS chỉ cần data files là đủ

Điều này **không đúng**.

Wedding Planner OS vẫn cần code `.ts` để:
- validate commands
- thực thi business rules
- cập nhật state chuẩn
- build projections
- enforce permissions
- chạy domain workflows
- đồng bộ reminders/projections

### Conclusion
OpenClaw không thay thế hoàn toàn backend code của Wedding Planner OS.
Nó thay thế phần **message orchestration/runtime**, không thay phần **domain backend**.

---

## Healthy architecture formula

### Good
```text
OpenClaw = runtime + orchestration
Wedding Planner OS = backend + domain engine
```

### Bad
```text
OpenClaw = làm hết mọi thứ
Wedding Planner OS = chỉ còn thư mục data
```

### Also bad
```text
Wedding Planner OS = vừa backend vừa runtime nhận message chính
OpenClaw = lớp ngoài mờ nhạt
```

---

## Concrete consequence for implementation

Nếu bám đúng boundary này, repo `wedding-planner-os` nên tiến hóa theo hướng:

- giảm Telegram ingress logic
- tăng command/query/workflow code
- thêm integrations/openclaw bridge
- giữ canonical persistence/projections trong repo này

Đồng thời OpenClaw side nên:
- nhận Telegram messages
- route sessions theo workspace
- gọi WP OS tools
- dùng cron/memory/subagents đúng vai trò

---

## Decision checklist

Khi có một logic mới, dùng checklist này:

### Nếu đó là chuyện về...

#### user nói gì, nên trả lời thế nào, nên hỏi lại gì
=> **OpenClaw**

#### dữ liệu cưới chuẩn nên lưu thế nào, có hợp lệ không, có quyền sửa không
=> **Wedding Planner OS**

#### lúc nào cần nhắc user lại
=> **OpenClaw runtime** + **WP OS reminder state**

#### planner persona ảnh hưởng prompt thế nào
=> **OpenClaw** dùng metadata từ **Wedding Planner OS**

#### participant này có được đổi planner không
=> **Wedding Planner OS**

---

## Final summary

> **OpenClaw là nơi nhận message, giữ session, reasoning, memory, cron và orchestration. Wedding Planner OS là nơi giữ domain model, canonical state, business rules, command/query/workflow logic và projections.**

> **Wedding Planner OS không nên bị thu nhỏ thành chỉ data files; nó vẫn cần code `.ts` như một domain backend thực thụ. Ngược lại, nó cũng không nên tiếp tục là bot ingress/orchestration runtime chính nếu muốn bám đúng target architecture.**
