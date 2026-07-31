# 🛍️ AGYShop - Modern Full-Stack E-Commerce Platform

[![Live Demo](https://img.shields.io/badge/Fly.io-Live_Demo-purple?style=for-the-badge&logo=fly.io)](https://agyshop-worklequocanh.fly.dev)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-Database-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![VietQR](https://img.shields.io/badge/VietQR-Payment_Gateway-0052CC?style=for-the-badge)](https://vietqr.io/)

> 🌐 **Website Live Demo**: [https://agyshop-worklequocanh.fly.dev](https://agyshop-worklequocanh.fly.dev)

AGYShop là nền tảng Thương mại Điện tử (E-Commerce) hiện đại, được xây dựng bằng **Next.js 14 (App Router)**, **TypeScript**, **TailwindCSS** và **MongoDB Atlas**. Dự án được tích hợp đầy đủ tính năng mua sắm cao cấp, giả lập thanh toán **VietQR**, in **Hóa đơn điện tử (Bill Invoice)**, quản lý đơn hàng **Admin Dashboard**, và Việt hóa 100% dữ liệu sản phẩm.

---

## ✨ Tính Năng Nổi Bật (Key Features)

### 🏬 1. Trang Cửa Hàng Tất-Cả-Trong-Một (`/shop`)
- **Bộ lọc thông minh real-time**: Lọc sản phẩm theo **Danh mục**, **Khoảng giá Min-Max** ($ USD), **Nút chọn giá nhanh** (Dưới $25, $25-$100, $100-$500, Trên $500) và **Đánh giá Sao** (Rating).
- **Tìm kiếm nâng cao**: Tìm từ khóa sản phẩm, thương hiệu tự động với gợi ý tìm kiếm trên Header.
- **Thanh Bộ Lọc Đang Áp Dụng (Active Filter Badges)**: Hiển thị các tiêu chí đang chọn kèm nút **X** xóa nhanh 1-click.
- **Chế độ hiển thị**: Chuyển đổi linh hoạt giữa dạng **Lưới (Grid)** và **Danh sách (List)**.
- **Phân trang Server-side**: Tải dữ liệu mượt mà, tối ưu hiệu năng.

### 💳 2. Thanh Toán Tiền Mặt & Giả Lập VietQR (`/checkout` & `/payment-qr/[id]`)
- **Tùy chọn thông tin giao hàng**:
  1. Sử dụng **Thông tin tài khoản hiện tại** (hiển thị trực tiếp Họ tên, Số điện thoại, Địa chỉ). Nếu thiếu thông tin cơ bản, hệ thống hỗ trợ nút chuyển tới trang Hồ sơ để cập nhật.
  2. Nhập **Thông tin thủ công** cho đơn hàng.
- **Phương thức thanh toán**:
  - **Tiền mặt (COD)**: Đặt hàng trực tiếp, tạo đơn với trạng thái *CHỜ THANH TOÁN*.
  - **Chuyển khoản VietQR**: Sinh mã QR Ngân hàng (MBBank) kèm số tiền và nội dung chuyển khoản tự động. Trang giả lập thanh toán cung cấp nút **"Mô phỏng Quét mã & Thanh toán"** để cập nhật trạng thái đơn hàng thành *ĐÃ THANH TOÁN* tức thì.

### 🧾 3. Hóa Đơn Điện Tử Panel / Print Modal (`BillInvoiceModal`)
- Xem & In hóa đơn điện tử tại **Trang Hồ sơ (`/profile`)**, **Trang Thành công (`/order-success/[id]`)** và **Trang Admin (`/admin`)**.
- Tích hợp **Con dấu trạng thái** (*ĐÃ THANH TOÁN* / *CHỜ THANH TOÁN*), Mã tra cứu QR, Bảng kê chi tiết sản phẩm, thuế và tổng tiền.
- Hỗ trợ in trực tiếp hoặc xuất thành tệp **PDF** qua lệnh `window.print()`.

### 📌 4. Header Cố Định (Sticky Navbar) & Giao Diện Chuẩn
- **Navbar Sticky**: Thanh Header luôn cố định ở top màn hình với hiệu ứng kính mờ (`backdrop-blur-md bg-white/95`) giúp dễ dàng thao tác ở mọi vị trí cuộn trang.
- **Tự động dọn dẹp danh mục**: Xóa sạch các danh mục rỗng (0 sản phẩm), chỉ duy trì các danh mục thực tế.
- **Toast Notification**: Thông báo Toast nổi góc trên bên trái (`top-left`), hỗ trợ xem giỏ hàng nhanh và nút **X** đóng trực tiếp.
- **Chuyển đổi Tiền tệ**: Hỗ trợ chuyển đổi hiển thị giá giữa **USD ($)** và **VND (₫)**.

### 🏢 5. Trang Giới Thiệu (`/about`) & Liên Hệ (`/contact`)
- **Giới thiệu (`/about`)**: Tầm nhìn thương hiệu, thống kê uy tín (50,000+ Khách hàng, 99.8% Hài lòng) và 3 giá trị cốt lõi.
- **Liên hệ (`/contact`)**: Form gửi tin nhắn hỗ trợ, khung Câu hỏi thường gặp (FAQ) và **Nhúng bản đồ Google Maps tương tác** chỉ dẫn vị trí chính thức:
  > **Trường Cao đẳng Công nghệ Thông tin TP.HCM (ITC)**  
  > 📍 *Số 12 Trịnh Đình Thảo, Phường Hòa Thạnh, Quận Tân Phú, TP. Hồ Chí Minh*

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Core Framework**: Next.js 14.2 (App Router, Server Actions, Dynamic Routes)
- **Language**: TypeScript 5.0
- **Styling & Icons**: TailwindCSS 3.4, Lucide React Icons
- **Database & ODM**: MongoDB Atlas, Mongoose
- **Authentication**: JWT (JSON Web Tokens), Bcryptjs password hashing, Cookie session
- **Deployment & CI/CD**: Fly.io, Docker Multi-stage, GitHub Actions CI/CD Pipeline
- **State Management / Context**:
  - `AuthContext`: Đăng ký, Đăng nhập, Đăng xuất, Cập nhật thông tin cá nhân
  - `CartContext`: Thêm, Sửa số lượng, Xóa giỏ hàng, Drawer giỏ hàng nhanh
  - `WishlistContext`: Danh sách yêu thích
  - `CurrencyContext`: Chuyển đổi định dạng giá USD/VND
  - `ToastContext`: Thông báo Toast toàn ứng dụng
  - `QuickViewContext`: Xem nhanh thông tin sản phẩm

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Getting Started)

### 1. Yêu cầu tiền đề
- **Node.js**: v18.0.0 trở lên
- **npm** hoặc **yarn**

### 2. Tải mã nguồn & Cài đặt dependencies
```bash
# Clone repository
git clone git@github.com:worklequocanh/AGYShop.git

# Di chuyển vào thư mục dự án
cd AGYShop

# Cài đặt các gói phụ thuộc
npm install
```

### 3. Cấu hình Biến môi trường (`.env.local`)
Tạo tệp `.env.local` ở thư mục gốc của dự án:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=agyshop_super_secret_jwt_key_2026
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Khởi chạy máy chủ phát triển (Dev Server)
```bash
npm run dev
```
Mở trình duyệt và truy cập: **`http://localhost:3000`**

### 5. Nạp dữ liệu mẫu (Seed Database)
- **Cách 1**: Đăng nhập tài khoản **Admin**, di chuyển chuột vào menu **Danh mục** trên Header và bấm nút **"Nạp DB ngay (Admin)"**.
- **Cách 2**: Truy cập trực tiếp đường dẫn: `http://localhost:3000/api/seed`.

---

## 🔑 Tài Khoản Thử Nghiệm (Demo Accounts)

| Vai Trò (Role) | Tên Đăng Nhập (Username) | Mật Khẩu (Password) | Quyền Hạn |
| :--- | :--- | :--- | :--- |
| **Quản Trị Viên** | `admin` | `admin123` | Quản lý toàn bộ Đơn hàng & Quản trị hệ thống |
| **Khách Hàng Mẫu** | `emilys` | `emilyspass` | Đặt hàng, Xem hóa đơn, Cập nhật hồ sơ cá nhân |

---

## 🗺️ Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
AGYShop/
├── .github/workflows/          # Luồng tự động hóa CI/CD GitHub Actions
│   └── deploy.yml
├── public/                     # Tệp tĩnh & hình ảnh upload sản phẩm
├── src/
│   ├── app/                    # Next.js 14 App Router Pages & API Routes
│   │   ├── about/              # Trang Giới thiệu
│   │   ├── admin/              # Trang Dashboard Quản trị Admin
│   │   ├── api/                # REST API Routes (auth, products, orders, seed...)
│   │   ├── cart/               # Trang Giỏ hàng
│   │   ├── checkout/           # Trang Thanh toán
│   │   ├── contact/            # Trang Liên hệ & Google Maps
│   │   ├── order-success/      # Trang Thông báo đặt hàng thành công
│   │   ├── payment-qr/         # Trang Giả lập thanh toán VietQR
│   │   ├── product/[id]/       # Trang Chi tiết sản phẩm
│   │   ├── profile/            # Trang Hồ sơ cá nhân & Lịch sử đơn hàng
│   │   ├── shop/               # Trang Cửa Hàng Tất-Cả-Trong-Một (/shop)
│   │   ├── wishlist/           # Trang Sản phẩm yêu thích
│   │   ├── globals.css         # Styling hệ thống Vanilla CSS & Tailwind
│   │   └── layout.tsx          # Root Layout chuẩn Light Mode
│   ├── components/             # UI Components (Header, Footer, BillInvoiceModal, ProductCard...)
│   ├── context/                # React Context Providers (Auth, Cart, Toast, Currency...)
│   ├── lib/                    # Kết nối Database MongoDB & dữ liệu dịch Việt hóa
│   └── models/                 # Mongoose Schemas (User, Product, Category, Order)
├── Dockerfile                  # Cấu hình container Docker đa tầng cho Fly.io
├── fly.toml                    # Cấu hình Fly.io Deployment
├── README.md
└── package.json
```

---

## 👤 Tác Giả (Author)

- **Đơn vị phát triển**: **Trường Cao đẳng Công nghệ Thông tin TP.HCM (ITC)**
- **Tác giả**: **Lê Quốc Anh (worklequocanh)**
- **Địa chỉ**: *12 Trịnh Đình Thảo, Phường Hòa Thạnh, Quận Tân Phú, TP. Hồ Chí Minh*
