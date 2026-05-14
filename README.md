# 🍽️ Restaurant Management System

A full-stack **Restaurant Management System** built with **Java Spring Boot** (backend) and **React + Vite** (frontend), featuring JWT authentication, role-based access control, and a complete REST API.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2, Spring Security |
| Database ORM | Spring Data JPA, Hibernate |
| Database | MySQL 8.x |
| Authentication | JWT (JSON Web Token) |
| API Docs | Swagger UI / OpenAPI 3.0 |
| Frontend | React 18, Vite, Recharts |
| Build Tool | Maven 3.8+ |

---

## 📁 Project Structure

```
rms_full/
├── src/
│   └── main/
│       ├── java/com/rms/
│       │   ├── config/          # Security, DB, Swagger config
│       │   ├── controller/      # REST Controllers (8)
│       │   ├── dto/             # Request & Response DTOs
│       │   │   ├── request/
│       │   │   └── response/
│       │   ├── entity/          # JPA Entities (8)
│       │   ├── exception/       # Global Exception Handler
│       │   ├── repository/      # Spring Data JPA Repos (7)
│       │   ├── security/        # JWT Filter & Service
│       │   └── service/         # Business Logic + Impls
│       └── resources/
│           └── application.properties   ⚠️ Set DB password here
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/           # Dashboard, Menu, Orders, Tables...
│   │   │   ├── customer/        # Menu (Cart), MyOrders, Reservations
│   │   │   └── auth/            # Login & Register
│   │   ├── components/layout/   # AdminLayout, CustomerLayout
│   │   ├── context/             # AuthContext (JWT state)
│   │   └── services/api.js      # All Axios API calls
│   ├── package.json
│   └── vite.config.js           # Proxy → :8081
└── pom.xml
```

---

## ⚙️ Prerequisites

Make sure the following are installed on your machine:

- **Java 17+** — [Download](https://www.oracle.com/java/technologies/downloads/#java17)
- **Maven 3.8+** — [Download](https://maven.apache.org/download.cgi)
- **MySQL 8.x** — [Download](https://dev.mysql.com/downloads/installer/)
- **Node.js 18+** — [Download](https://nodejs.org/)

Verify installations:

```bash
java -version    # java version "17.x.x"
mvn -version     # Apache Maven 3.x.x
mysql --version  # mysql  Ver 8.x.x
node -v          # v18.x.x or higher
npm -v           # 9.x.x or higher
```

---

## 🚀 Getting Started

### Step 1 — Clone or Extract the Project

```bash
# If using git
git clone https://github.com/your-username/restaurant-management-system.git
cd restaurant-management-system

# If using ZIP
unzip rms-fullstack-complete.zip
cd rms_full
```

### Step 2 — Configure the Database

Open `src/main/resources/application.properties` and update your MySQL credentials:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD_HERE
spring.datasource.url=jdbc:mysql://localhost:3306/rms_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
```

> ✅ The `rms_db` database will be **created automatically** — no need to create it manually.

### Step 3 — Run the Backend

```bash
# From the root project folder (rms_full/)
mvn clean install -DskipTests   # First time only
mvn spring-boot:run
```

Expected output:

```
✅ Admin created  →  admin@rms.com / admin123
✅ Staff created  →  staff@rms.com / staff123

Started RestaurantManagementApplication in 4.2 seconds
```

Backend is now running at **http://localhost:8081**

### Step 4 — Run the Frontend

Open a **new terminal** (keep the backend terminal running):

```bash
cd frontend
npm install        # First time only
npm run dev
```

Expected output:

```
  VITE v5.x.x  ready in 312 ms

  ➜  Local:   http://localhost:3000/
```

Frontend is now running at **http://localhost:3000**

---

## 🔐 Default Accounts

These are automatically created when the backend starts for the first time:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| 🔴 Admin | `admin@rms.com` | `admin123` | Full access — all features |
| 🟡 Staff | `staff@rms.com` | `staff123` | Orders, Tables, Reservations |
| 🟢 Customer | Register yourself | Your choice | Menu, Orders, Reservations |

---

## 📡 API Endpoints Overview

All endpoints are prefixed with `/api/v1`. Secured endpoints require a `Bearer` token in the `Authorization` header.

### Authentication
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |

### Menu
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/menu/categories` | Public |
| POST | `/menu/categories` | Admin |
| GET | `/menu/items` | Public |
| POST | `/menu/items` | Admin |
| PATCH | `/menu/items/{id}/availability` | Admin |

### Orders
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/orders` | Authenticated |
| GET | `/orders` | Admin / Staff |
| GET | `/orders/my` | Customer |
| PATCH | `/orders/{id}/status` | Admin / Staff |

### Tables
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/tables` | Admin / Staff |
| GET | `/tables/available` | Authenticated |
| POST | `/tables` | Admin |
| PATCH | `/tables/{id}/status` | Admin / Staff |

### Payments & Reservations
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/payments` | Authenticated |
| GET | `/payments/order/{orderId}` | Authenticated |
| POST | `/reservations` | Authenticated |
| GET | `/reservations/my` | Customer |
| PATCH | `/reservations/{id}/status` | Admin / Staff |

### Reports (Admin only)
| Method | Endpoint |
|--------|----------|
| GET | `/reports/revenue?start=...&end=...` |
| GET | `/reports/top-items` |
| GET | `/reports/table-occupancy` |

> 📄 Full interactive API docs available at: **http://localhost:8081/swagger-ui.html**

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `users` | All users (Admin, Staff, Customer) with BCrypt passwords |
| `menu_categories` | Menu categories (Biryani, Drinks, etc.) |
| `menu_items` | Individual menu items with price and availability |
| `restaurant_tables` | Physical dining tables with capacity and status |
| `orders` | Customer orders linked to tables and users |
| `order_items` | Line items within each order |
| `payments` | Payment records (Cash / Card / Online) |
| `reservations` | Table reservation bookings |

---

## 🧱 Architecture

```
Controller Layer   →   handles HTTP requests, validates DTOs
      ↓
Service Layer      →   business logic, transactions
      ↓
Repository Layer   →   Spring Data JPA → MySQL queries
      ↓
Entity Layer       →   JPA-mapped database tables
```

**Security flow:**

```
Request → JwtAuthenticationFilter → SecurityFilterChain → Controller
```

- Stateless sessions using JWT Bearer tokens
- BCrypt (cost 12) password hashing
- Method-level security with `@PreAuthorize`

---

## 🖥️ Frontend Pages

| Page | Route | Roles |
|------|-------|-------|
| Login / Register | `/login` | Public |
| Dashboard | `/admin/dashboard` | Admin, Staff |
| Menu Management | `/admin/menu` | Admin |
| Orders | `/admin/orders` | Admin, Staff |
| Tables | `/admin/tables` | Admin, Staff |
| Reservations | `/admin/reservations` | Admin, Staff |
| Users | `/admin/users` | Admin |
| Reports | `/admin/reports` | Admin |
| Menu (Customer) | `/menu` | Customer |
| My Orders | `/my-orders` | Customer |
| My Reservations | `/my-reservations` | Customer |

---

## 🔧 Troubleshooting

**`Access denied for user 'root'@'localhost'`**
→ Wrong MySQL password in `application.properties`. Update it and restart.

**`Communications link failure`**
→ MySQL is not running. Start it: `net start mysql` (Windows) or `brew services start mysql` (Mac).

**`Port 8081 already in use`**
→ Change `server.port=9090` in `application.properties` and update `vite.config.js` proxy target accordingly.

**`npm install` fails**
→ Run `npm cache clean --force` then `npm install --legacy-peer-deps`.

**Blank page after login**
→ Open browser console (F12), check errors. Quick fix: run `localStorage.clear()` in console and refresh.

**CORS error in browser**
→ Make sure `vite.config.js` has the proxy config pointing to `http://localhost:8081`.

---

## 🐳 Docker (Optional)

Build and run both services with Docker Compose:

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: rms_db
    ports:
      - "3306:3306"

  app:
    build: .
    ports:
      - "8081:8081"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/rms_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
      SPRING_DATASOURCE_PASSWORD: root
    depends_on:
      - mysql
```

```bash
mvn clean package -DskipTests
docker-compose up --build
```

---

## 📦 Key Dependencies

**Backend (`pom.xml`)**
- `spring-boot-starter-web` — REST API
- `spring-boot-starter-data-jpa` — ORM
- `spring-boot-starter-security` — Auth
- `spring-boot-starter-validation` — Input validation
- `jjwt-api` `jjwt-impl` `jjwt-jackson` — JWT tokens
- `mysql-connector-j` — MySQL driver
- `lombok` — Boilerplate reduction
- `springdoc-openapi-starter-webmvc-ui` — Swagger UI

**Frontend (`package.json`)**
- `react` `react-dom` — UI framework
- `react-router-dom` — Client-side routing
- `axios` — HTTP client
- `recharts` — Charts & graphs
- `react-hot-toast` — Notifications
- `lucide-react` — Icons
- `vite` — Build tool & dev server

---

## 🔮 Future Enhancements

- [ ] Real-time kitchen display using WebSocket (STOMP)
- [ ] Stripe / PayPal payment gateway integration
- [ ] PDF invoice generation
- [ ] Email confirmation for reservations
- [ ] Multi-branch / franchise support
- [ ] Native mobile app (Flutter)
- [ ] AI-powered demand forecasting

---

## 📄 License

This project is for educational and portfolio purposes.

---

> Built with ☕ Java, 🌱 Spring Boot, ⚛️ React, and 🐬 MySQL
