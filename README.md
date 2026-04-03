# wedding-planner-os

MVP skeleton cho Wedding Planner OS theo hướng:
- file-based source of truth (JSON + Markdown + JSONL)
- OpenClaw-centric orchestration
- Telegram-first

## Đã có trong skeleton này
- Fastify server
- Telegram webhook endpoint mock: `POST /telegram/webhook`
- file state gateway cho users + weddings
- planner switching (`mina`, `luna`)
- profile extraction cơ bản từ chat:
  - thành phố
  - tháng cưới
  - ngân sách (triệu)
  - số khách
- starter checklist generation
- summary rebuild

## Chạy local

```bash
cp .env.example .env
npm install
npm run seed
npm run dev
```

Health check:

```bash
curl http://localhost:8787/health
```

Test webhook mock:

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

Để xem state đã ghi:

```bash
find data -maxdepth 4 -type f | sort
```

## Cần build tiếp
- Telegram sender thật (gửi outbound qua Bot API)
- webhook secret validation
- reminders
- decision logs
- latest-state optimization tốt hơn
- admin/debug routes
- contract tool layer cho OpenClaw gọi domain commands rõ hơn
