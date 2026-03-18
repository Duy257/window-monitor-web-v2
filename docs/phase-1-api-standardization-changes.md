# Giải thích thay đổi đã triển khai (Phase 1)

Tài liệu này mô tả toàn bộ thay đổi đã được áp dụng để chuẩn hóa tầng API ở frontend `window-monitor-web-v2`.

## 1) Mục tiêu của Phase 1

- Chuẩn hóa cách xác định base URL cho REST và WebSocket.
- Chuẩn hóa error object để UI xử lý lỗi nhất quán.
- Chuẩn hóa `queryKey` của React Query để tránh lệch key/invalidation.

---

## 2) Các file mới được tạo

### `src/api/errors.ts`

Thêm hàm chuẩn hóa lỗi:

- `toAppError(error)`
- Trả về cấu trúc `AppError` gồm:
  - `status?: number`
  - `code: string`
  - `message: string`
  - `details?: unknown`
  - `raw?: unknown`

Ý nghĩa:

- Dù lỗi đến từ Axios hay lỗi JS thông thường, UI luôn nhận được định dạng lỗi nhất quán.
- Tránh việc mỗi page tự parse `error.response?.data?.message` theo cách khác nhau.

### `src/api/queryKeys.ts`

Tạo key factory tập trung cho React Query:

- `queryKeys.system.*`
- `queryKeys.processes.*`
- `queryKeys.pm2.*`
- `queryKeys.projects.*`
- `queryKeys.alerts.*`
- `queryKeys.jobs.*`
- `queryKeys.files.*`
- `queryKeys.exec.*`

Ý nghĩa:

- Đồng bộ `queryKey` giữa `useQuery` và `invalidateQueries`.
- Giảm lỗi do viết tay key khác nhau giữa các hook.

---

## 3) Các file đã chỉnh sửa

### `src/api/config.ts`

Trước đây dùng trực tiếp `VITE_API_URL` cho nhiều mục đích.

Đã tách rõ:

- `API_HTTP_BASE_URL`: base cho Socket.IO (không kèm `/api`)
- `API_REST_BASE_URL`: base cho REST (luôn có `/api`)

Thêm logic normalize URL:

- Nếu `VITE_API_URL` đã có `/api` thì giữ nguyên cho REST.
- Nếu chưa có `/api` thì tự nối `/api`.

Mục tiêu:

- Tránh mismatch giữa frontend gọi `"/system/..."` và backend mount route tại `/api/*`.
- Giữ tương thích trong cả 2 kiểu cấu hình env (`http://host:port` hoặc `http://host:port/api`).

### `src/api/client.ts`

- `baseURL` chuyển sang dùng `API_REST_BASE_URL`.
- Response interceptor gọi `toAppError()` trước khi reject.
- Vẫn giữ logic 401/403:
  - clear `winmonitor_api_key`
  - phát event `auth:required`

Mục tiêu:

- Toàn bộ lỗi HTTP đi qua cùng 1 chuẩn.
- Bảo toàn luồng hết hạn/quyền truy cập như cũ.

### `src/api/socket.ts`

- Socket client đổi sang `API_HTTP_BASE_URL`.

Mục tiêu:

- Socket kết nối đúng origin server, không bị dính `/api` path.

---

## 4) Chuẩn hóa query keys ở hooks

Đã migrate từ key viết tay sang `queryKeys` trong các file:

- `src/hooks/useSystem.ts`
- `src/hooks/usePm2.ts`
- `src/hooks/useJobs.ts`
- `src/hooks/useExec.ts`
- `src/hooks/useAlerts.ts`
- `src/hooks/useProjects.ts`
- `src/hooks/useProjectDetail.ts`
- `src/hooks/useFiles.ts`

Tác động chính:

- Query/Invalidate đồng bộ key theo một nguồn duy nhất.
- Giảm nguy cơ cache không refresh vì sai key string/shape.

---

## 5) Tương thích ngược và rủi ro

### Tương thích ngược

- Không đổi contract API payload thành công (`data.data` vẫn giữ nguyên).
- Không đổi flow auth hiện tại (API key + event `auth:required`).

### Rủi ro còn tồn tại (để xử lý phase sau)

- Một số page vẫn còn parse lỗi thủ công thay vì dùng `AppError` (ví dụ trang Terminal/Files).
- Có duplication nghiệp vụ giữa nhóm hook project (`useProjects.ts` và `useProjectDetail.ts`) — sẽ tối ưu ở phase tiếp theo.

---

## 6) Kết quả kiểm chứng

Đã chạy build frontend thành công:

- Lệnh: `npm run build`
- Kết quả: exit code `0`
- Không có lỗi TypeScript/build blocker.

---

## 7) Gợi ý sử dụng từ bây giờ

- Khi thêm hook mới: luôn import key từ `src/api/queryKeys.ts`.
- Khi xử lý lỗi ở page/component: ưu tiên dùng cấu trúc `AppError` thay vì parse Axios raw.
- Khi đổi env API: chỉ cần set `VITE_API_URL`, hệ thống tự chuẩn hóa REST/WS.
