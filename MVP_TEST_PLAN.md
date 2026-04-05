# Wedding Planner OS - MVP Test Plan

## Purpose

Tài liệu này giúp test nhanh Wedding Planner OS ở mức MVP hiện tại.

Mục tiêu của test plan này là xác nhận các khả năng cốt lõi đang hoạt động:

- app khởi động được
- health endpoint hoạt động
- webhook mock hoạt động
- user/workspace được tạo
- profile được trích xuất và lưu
- planner switching hoạt động
- starter checklist được tạo
- summary được rebuild
- dữ liệu được ghi xuống file store đúng chỗ

---

## Scope

Test plan này áp dụng cho **MVP hiện tại**, không phải target architecture đầy đủ.

### Có trong phạm vi test
- Fastify app
- webhook route
- Telegram message extraction
- planner flow cơ bản
- file-based persistence
- persona switching (`mina`, `luna`)
- summary generation

### Ngoài phạm vi test
- participant collaboration đầy đủ
- decision log hoàn chỉnh
- reminder orchestration thật
- vendor workflow thật
- OpenClaw orchestration target architecture đầy đủ
- access control phức tạp

---

## Prerequisites

- Node.js / npm sẵn trên máy
- repo đã clone:
  - `/root/workspace/wedding-planner-os`
- terminal có quyền ghi file vào repo

---

## 1. Setup

```bash
cd /root/workspace/wedding-planner-os
npm install
npm run seed
```

### Expected
- cài dependencies thành công
- seed thành công
- tạo personas/templates cơ bản

---

## 2. Start app

```bash
npm run dev
```

### Expected
- app start thành công
- listen ở port mặc định `8787`
- không crash ngay khi boot

---

## 3. Health check

Mở terminal khác và chạy:

```bash
curl http://localhost:8787/health
```

### Expected response

```json
{"ok":true,"dataDir":".../data"}
```

### Pass criteria
- HTTP 200
- trả `ok: true`

---

## 4. Test first inbound message

Chạy webhook mock:

```bash
curl -X POST http://localhost:8787/telegram/webhook \
  -H 'content-type: application/json' \
  -d '{
    "message": {
      "text": "Bọn mình cưới tháng 12 ở Hà Nội, ngân sách 300 triệu, khoảng 250 khách",
      "from": {"id": 12345, "first_name": "Linh", "username": "linhxx"},
      "chat": {"id": 12345}
    }
  }'
```

### Expected behavior
- tạo user mới nếu chưa có
- tạo workspace mới nếu chưa có
- lưu profile:
  - city = Hà Nội
  - eventDate = `<current-year>-12-01`
  - budgetTarget = `300000000`
  - guestTarget = `250`
- tạo starter checklist nếu task list đang trống
- trả reply text về planner hiện tại

### Expected response shape
- `ok: true`
- có `reply`
- có `workspaceId`
- `deliveredToTelegram: true`

---

## 5. Inspect generated files

Chạy:

```bash
find data -maxdepth 4 -type f | sort
```

### Expected files
Ít nhất nên thấy:

```text
data/system/index.json
data/users/<userId>/user.json
data/users/<userId>/identities.json
data/users/<userId>/preferences.json
data/weddings/<workspaceId>/workspace.json
data/weddings/<workspaceId>/planner.json
data/weddings/<workspaceId>/profile.json
data/weddings/<workspaceId>/tasks.json
data/weddings/<workspaceId>/latest-state.json
data/weddings/<workspaceId>/summary.md
data/weddings/<workspaceId>/conversations/telegram-main.jsonl
```

---

## 6. Inspect profile state

Chạy:

```bash
find data/weddings -name profile.json -print -exec cat {} \;
```

### Expected fields
- `city = "Hà Nội"`
- `budgetTarget = 300000000`
- `guestTarget = 250`
- `eventDate = "<current-year>-12-01"`

---

## 7. Inspect checklist state

Chạy:

```bash
find data/weddings -name tasks.json -print -exec cat {} \;
```

### Expected
- có danh sách task
- có 3 task common:
  - chốt ngân sách
  - ước lượng số khách
  - shortlist venue
- có thêm 1 task theo persona mặc định

### Ghi chú
Persona mặc định hiện tại là `mina`, nên expected extra task là thiên về tối ưu chi phí.

---

## 8. Test planner switching - Mina

```bash
curl -X POST http://localhost:8787/telegram/webhook \
  -H 'content-type: application/json' \
  -d '{
    "message": {
      "text": "mina",
      "from": {"id": 12345, "first_name": "Linh", "username": "linhxx"},
      "chat": {"id": 12345}
    }
  }'
```

### Expected
- `planner.json` đổi sang `mina`
- response text xác nhận chuyển planner Mina

---

## 9. Test planner switching - Luna

```bash
curl -X POST http://localhost:8787/telegram/webhook \
  -H 'content-type: application/json' \
  -d '{
    "message": {
      "text": "luna",
      "from": {"id": 12345, "first_name": "Linh", "username": "linhxx"},
      "chat": {"id": 12345}
    }
  }'
```

### Expected
- `planner.json` đổi sang `luna`
- response text xác nhận chuyển planner Luna

---

## 10. Test summary query

```bash
curl -X POST http://localhost:8787/telegram/webhook \
  -H 'content-type: application/json' \
  -d '{
    "message": {
      "text": "tóm tắt",
      "from": {"id": 12345, "first_name": "Linh", "username": "linhxx"},
      "chat": {"id": 12345}
    }
  }'
```

### Expected
- bot trả nội dung summary
- nội dung lấy từ `summary.md`

---

## 11. Test profile update on later message

```bash
curl -X POST http://localhost:8787/telegram/webhook \
  -H 'content-type: application/json' \
  -d '{
    "message": {
      "text": "Bọn mình khoảng 300 khách",
      "from": {"id": 12345, "first_name": "Linh", "username": "linhxx"},
      "chat": {"id": 12345}
    }
  }'
```

### Expected
- `guestTarget` update thành `300`
- summary/latest-state được rebuild
- không tạo user/workspace mới

---

## 12. Inspect latest-state projection

```bash
find data/weddings -name latest-state.json -print -exec cat {} \;
```

### Expected
- có `plannerPersonaId`
- có profile snapshot
- có `openTasksCount`
- có `nextImportantTask`

---

## 13. Inspect summary projection

```bash
find data/weddings -name summary.md -print -exec cat {} \;
```

### Expected
Nội dung nên có:
- planner hiện tại
- ngày cưới
- city
- budget target
- guest target
- current priorities

---

## 14. Inspect conversation log

```bash
find data/weddings -path '*conversations/*.jsonl' -print -exec cat {} \;
```

### Expected
- có inbound entries
- có outbound entries
- messages theo đúng thứ tự test

---

## 15. Negative test - ignored payload

```bash
curl -X POST http://localhost:8787/telegram/webhook \
  -H 'content-type: application/json' \
  -d '{
    "message": {
      "from": {"id": 12345},
      "chat": {"id": 12345}
    }
  }'
```

### Expected
- response kiểu ignored
- không crash app

---

## 16. Optional real Telegram smoke test

Chỉ làm nếu anh muốn test với Telegram thật.

### Preconditions
- có `TELEGRAM_BOT_TOKEN`
- app đang public được ra ngoài internet
- webhook trỏ đúng vào app này

### Smoke test steps
- nhắn thật vào bot
- gửi câu có profile facts
- kiểm tra file state thay đổi
- kiểm tra bot reply text

### Caution
Hiện MVP này vẫn là skeleton, nên ưu tiên test local/mock trước.

---

## Quick pass/fail matrix

| Test case | Expected result |
|---|---|
| App boot | Pass nếu app không crash |
| Health route | Pass nếu trả `ok: true` |
| First webhook | Pass nếu tạo user/workspace/profile/tasks |
| Mina switch | Pass nếu planner đổi sang Mina |
| Luna switch | Pass nếu planner đổi sang Luna |
| Summary query | Pass nếu trả được `summary.md` |
| Profile update | Pass nếu update đúng field mà không tạo workspace mới |
| Conversation log | Pass nếu log inbound/outbound đúng |
| Ignored payload | Pass nếu app không crash và trả ignored |

---

## Known MVP limitations

- chưa có participant model thật
- chưa có decision log thật
- chưa có reminder orchestration thật
- chưa có vendor workflow hoàn chỉnh
- chưa có access control thật
- chưa có OpenClaw orchestration theo target architecture
- persona và checklist vẫn còn một phần hardcoded

---

## Recommended next testing documents

Sau khi pass MVP test plan này, nên viết tiếp:

- `OPENCLAW_INTEGRATION_TEST_PLAN.md`
- `COLLABORATION_TEST_PLAN.md`
- `REMINDER_TEST_PLAN.md`
- `DOMAIN_REGRESSION_TESTS.md`

---

## Final summary

> Nếu app pass phần lớn checklist ở tài liệu này, anh có thể tự tin rằng **Wedding Planner OS MVP hiện tại đã chạy được ở mức skeleton functional**, đủ để tiếp tục refactor sang kiến trúc OpenClaw-centric ở các phase sau.
