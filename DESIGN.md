# LifeOS — Design System & UI Specifications

Quy chuẩn thiết kế toàn diện cho giao diện người dùng **LifeOS**, bám sát hệ thống tokens của **shadcn/ui**, **Tailwind CSS**, hỗ trợ chuẩn 2 chế độ **Light/Dark** và tối ưu trải nghiệm **Mobile-First**.

---

## 1. Hệ Màu Sắc (Color Tokens - HSL)

Hệ thống màu sử dụng CSS variables trong HSL, tự động đảo ngược và điều chỉnh độ tương phản giữa Light Mode và Dark Mode.

### Light Mode
- **Background**: `hsl(0 0% 100%)` (Trắng tinh khiết)
- **Foreground**: `hsl(240 10% 3.9%)` (Đen đậm, chữ sắc nét)
- **Card / Surface**: `hsl(0 0% 100%)` / border `hsl(240 5.9% 90%)`
- **Primary**: `hsl(240 5.9% 10%)` (Đen graphite thanh lịch) / text: `hsl(0 0% 98%)`
- **Secondary / Muted**: `hsl(240 4.8% 95.9%)`
- **Accent (Điểm nhấn)**: `hsl(240 4.8% 95.9%)`
- **Destructive**: `hsl(0 84.2% 60.2%)` (Đỏ cảnh báo/xóa)
- **Finances Green (Income)**: `hsl(142 76% 36%)` (#16a34a)
- **Finances Red (Expense)**: `hsl(0 72% 51%)` (#dc2626)

### Dark Mode
- **Background**: `hsl(240 10% 4%)` (Đen sâu hiện đại #0a0a0c)
- **Foreground**: `hsl(0 0% 98%)` (Trắng ngà dịu mắt)
- **Card / Surface**: `hsl(240 10% 6.5%)` / border `hsl(240 3.7% 15.9%)`
- **Primary**: `hsl(0 0% 98%)` (Trắng ngà nổi bật) / text: `hsl(240 5.9% 10%)`
- **Secondary / Muted**: `hsl(240 3.7% 15.9%)`
- **Accent**: `hsl(240 3.7% 15.9%)`
- **Destructive**: `hsl(0 62.8% 30.6%)`

---

## 2. Quy Chuẩn Thành Phần (Component Styles)

### 2.1 Buttons (`Button`)
Tất cả các nút phải dùng component `<Button variant="..." size="...">` từ `@/components/ui/button`.
- **Bo góc**: `rounded-xl` (12px) mang lại cảm giác mềm mại, hiện đại.
- **Biến thể (Variants)**:
  - `default`: Nền `bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all`. Dùng cho hành động chính (Lưu, Xác nhận, Tiếp tục).
  - `secondary`: Nền `bg-secondary text-secondary-foreground hover:bg-secondary/80`. Dùng cho hành động phụ (Hủy, Đóng).
  - `outline`: Viền `border border-input bg-background hover:bg-accent hover:text-accent-foreground`. Dùng cho các nút lọc hoặc tác vụ ngang cấp.
  - `destructive`: Nền `bg-destructive text-destructive-foreground hover:bg-destructive/90`. Dùng cho xóa, cảnh báo nguy hiểm.
  - `ghost`: Trong suốt `hover:bg-accent hover:text-accent-foreground`. Dùng trong thanh công cụ, icon buttons.
  - `link`: `text-primary underline-offset-4 hover:underline`.
- **Kích thước (Sizes)**:
  - `sm`: Chiều cao `h-9`, padding `px-3`, text `text-xs`.
  - `default`: Chiều cao `h-10`, padding `px-4 py-2`, text `text-sm font-medium`.
  - `lg`: Chiều cao `h-11`, padding `px-8`, text `text-base font-medium`.
  - `icon`: Chiều cao & rộng `h-10 w-10 p-0 rounded-xl`.

### 2.2 Cards & Containers (`Card`)
- **Container Card**: `rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm transition-all hover:shadow-md`.
- **CardHeader**: Padding `p-5 pb-3` có tiêu đề `text-base font-semibold tracking-tight` và mô tả phụ `text-xs text-muted-foreground`.
- **CardContent**: Padding `p-5 pt-0`.
- **CardFooter**: Padding `p-5 pt-0 flex items-center justify-between`.

### 2.3 Form Inputs (`Input`, `Select`, `Textarea`)
- **Input**: Chiều cao `h-10 rounded-xl border border-input bg-background/50 px-3.5 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1`.
- **Form Error**: Text đỏ `text-xs text-destructive mt-1 font-medium` xuất hiện mượt mà.

### 2.4 Badges & Status Tags (`Badge`)
- **Default**: `rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground`.
- **Success/Income**: `rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20`.
- **Expense**: `rounded-full px-2.5 py-0.5 text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20`.
- **Pending/Todo**: `rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20`.

### 2.5 Hộp Thoại & Cảnh Báo (`ConfirmDialog` / `AlertDialog`)
- **Tuyệt đối không dùng `window.alert()` hay `window.confirm()`**.
- Sử dụng modal bọc Radix AlertDialog:
  - Backdrop mờ `bg-black/60 backdrop-blur-sm`.
  - Content bo góc `rounded-2xl p-6 border shadow-xl animate-in zoom-in-95`.
  - Nút Hủy (Secondary) và Xác nhận (Destructive/Primary).

### 2.6 Thông Báo Nổi (`Sonner Toast`)
- Cấu hình vị trí: góc dưới màn hình trên Mobile (`bottom-center`), góc trên phải trên Desktop (`top-right`).
- Theme: Tự động ăn theo chế độ Dark / Light.

---

## 3. Quy Chuẩn Typography & Icon

- **Font chữ chính**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`.
- **Cỡ chữ**:
  - `Page Title`: `text-2xl sm:text-3xl font-bold tracking-tight`
  - `Section Title`: `text-lg font-semibold`
  - `Widget Label`: `text-xs font-medium text-muted-foreground uppercase tracking-wider`
  - `Body`: `text-sm font-normal text-foreground leading-relaxed`
  - `Muted / Subtitle`: `text-xs text-muted-foreground`
- **Icon**: Thư viện `lucide-react`, kích thước đồng bộ:
  - Standard icon: `w-4 h-4` (trong button, badge)
  - Card icon: `w-5 h-5` (trong header widget)
  - Navigation icon: `w-5 h-5`

---

## 4. Bố Cục Điều Hướng (Layout & Navigation)

- **Mobile View (< 768px)**:
  - Cố định thanh **Bottom Navigation Bar** ở đáy màn hình với 5 tab chính (Tổng quan, Chi tiêu, Tiếng Anh, Gym, Task/Thực đơn).
  - Tối ưu chạm (touch target $\ge 44\times 44\text{px}$).
- **Desktop View ($\ge 768px$)**:
  - Thanh Header trên cùng tích hợp: Logo, Breadcrumbs, Chuyển đổi Ngôn ngữ (Vi/En), Chuyển Theme (Dark/Light), User Profile & Đăng xuất.
  - Sidebar hoặc Top Navigation chuyển tab mượt mà.
