<p align="center">
  <img alt="artesLogo" src="https://github.com/user-attachments/assets/e0641011-0e96-4330-8ad5-935b395b0838" width="280">
</p>

<h1 align="center">Artes Reporting System</h1>

![Docker](https://img.shields.io/badge/docker-ready-blue)
![Node.js](https://img.shields.io/badge/nodejs-backend-green)
![PostgreSQL](https://img.shields.io/badge/postgres-database-blue)
![MinIO](https://img.shields.io/badge/minio-object--storage-orange)
![License](https://img.shields.io/badge/license-internal-lightgrey)

**Artes Reporting System** is a lightweight report hosting platform for QA and automation teams.
It allows uploading, storing, filtering, and previewing **HTML** and **Allure** reports via **UI** or **REST API**.

---

## Reports List

<img width="1502" height="802" alt="Screenshot 2026-01-09 at 12 48 18" src="https://github.com/user-attachments/assets/d03abd29-4ae2-44b3-9441-0aebabb4547d" />

### List/grid layout

<img width="1503" height="799" alt="Screenshot 2026-01-09 at 12 48 28" src="https://github.com/user-attachments/assets/bb0a5b83-5451-4fd7-9c21-9d3f4d578b6b" />

### Dark/light mode

<img width="1501" height="797" alt="image" src="https://github.com/user-attachments/assets/0a25d49a-2953-4c5a-8e24-5e78bb61517d" />

## Upload Report

<img width="1501" height="806" alt="image" src="https://github.com/user-attachments/assets/9eb603b7-4395-4090-9356-059bebbc4133" />

## Report Preview

<img width="1512" height="826" alt="image" src="https://github.com/user-attachments/assets/4469010c-721f-4a2a-9a23-0118fd71d781" />

---

## ✨ Features

- 📄 Upload and preview **HTML reports**
- 📦 Upload **Allure reports** as ZIP files
- 🌐 Browser-based report preview
- 🔍 Filter reports by project, name, type, and date
- 🗑️ Delete single or multiple reports
- 🐳 Fully Dockerized (Backend, UI, DB, Storage)

---

## 📁 Supported Report Types

### HTML Reports

Upload a single `.html` file and view it directly in the browser.

### Allure Reports

1. Generate Allure report (`allure generate`)
2. Zip the generated `allure-report` folder
3. Upload the ZIP file via **UI** or **API**

---

## 🏗️ System Architecture

```text
UI(nginx)
   |
Backend (Node.js / Express)
   |
PostgreSQL (metadata) + MinIO (files)
```

- **PostgreSQL** stores report metadata
- **MinIO** stores HTML & ZIP files (S3 compatible)

---

## 🗄️ Database Schema

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY,
  type VARCHAR(50) DEFAULT 'other',
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  project VARCHAR(100) DEFAULT 'other',
  upload_date TIMESTAMP DEFAULT NOW()
);
```

### PostgreSQL Login

```bash
psql -h localhost -p 5432 -U artes -d artes_reports
```

---

## 🔌 REST API

### Health Check

```http
GET /
```

---

### Get Logo URL (UI usage)

```http
GET /logo-url
```

---

### Get All Reports

```http
GET /reports
```

#### Optional Filters

| Query Param | Description               |
| ----------- | ------------------------- |
| project     | Filter by project         |
| name        | Filter by name            |
| type        | Report type (`ui`, `api`) |
| date        | Exact date                |
| fromDate    | Start date                |
| toDate      | End date                  |

Example:

```http
GET /reports?project=mobile&type=ui
```

---

### Preview Report

```http
GET /preview/:id
```

Returns a browser-viewable report URL.

---

### Upload Report

```http
POST /report
```

**Content-Type:** `multipart/form-data`

| Field   | Required | Description        |
| ------- | -------- | ------------------ |
| name    | ✅       | Report name        |
| type    | ❌       | Default: `unknown` |
| project | ❌       | Default: `unknown` |
| file    | ✅       | HTML file or ZIP   |

---

### Upload Logo

```http
POST /logo
```

- Send `multipart/form-data`
- Only field required: `file`

---

### Delete Report by ID

```http
DELETE /report/:id
```

Deletes from **PostgreSQL** and **MinIO**.

---

### Delete Reports (Bulk)

```http
DELETE /reports
```

#### Optional Filters

| Query Param | Description               |
| ----------- | ------------------------- |
| project     | Filter by project         |
| name        | Filter by name            |
| type        | Report type (`ui`, `api`) |
| date        | Exact date                |
| fromDate    | Start date                |
| toDate      | End date                  |

Example:

```http
DELETE /reports?project=mobile&type=ui
```

⚠️ **No filters = full cleanup (DB + MinIO)**

---

## 🐳 Installation (Docker)

### Docker Compose

```yaml
services:
  artes-service:
    image: vahidaghayev/artes-report-service:latest
    restart: unless-stopped
    expose:
      - "4010"
    volumes:
      - ./src/temp:/usr/src/app/src/temp
    depends_on:
      - db
      - minio

  artes-ui:
    image: vahidaghayev/artes-report-ui:latest
    restart: unless-stopped
    expose:
      - "80"
    depends_on:
      - artes-service

  nginx:
    image: vahidaghayev/artes-nginx:latest
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - artes-ui
      - artes-service

  db:
    image: vahidaghayev/artes-db:latest
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: artes_reports
      POSTGRES_USER: artes
      POSTGRES_PASSWORD: artes
    volumes:
      - db_data:/var/lib/postgresql/data

  minio:
    image: minio/minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: artes
      MINIO_ROOT_PASSWORD: artes123
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  minio-init:
    image: minio/mc
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      mc alias set local http://minio:9000 artes artes123 &&
      mc mb -p local/artes-reports
      "

volumes:
  db_data:
  minio_data:
```

---

### Run

```bash
docker compose up --build
```

---

## 🌐 Default Ports

| Service       | Ports |
| ------------- | ----- |
| Backend API   | 4010  |
| UI            | 80    |
| MinIO Console | 9001  |
| PostgreSQL    | 5432  |

---

## 🐳 Docker Images

### Nginx

- **Image:** [`vahidaghayev/artes-nginx`](https://hub.docker.com/r/vahidaghayev/artes-nginx)

### Database

- **Image:** [`vahidaghayev/artes-db`](https://hub.docker.com/r/vahidaghayev/artes-db)

### Backend (API)

- **Image:** [`vahidaghayev/artes-report-service`](https://hub.docker.com/r/vahidaghayev/artes-report-service)

### Frontend (UI)

- **Image:** [`vahidaghayev/artes-report-ui`](https://hub.docker.com/r/vahidaghayev/artes-report-ui)

## 🔧 Configuration

Currently, the project **does not have a configuration file**.
If you want to change behavior, logic, UI, or defaults, you need to rebuild the Docker images.

### Steps

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/4gayev1/artes-reporting-system.git
cd artes-reporting-system
```

---

#### 2️⃣ Make Your Changes

- Update backend logic (API, storage, preview, etc.)
- Modify UI (design, fields, behavior)
- Adjust database initialization if needed

---

#### 3️⃣ Build & Push Multi-Architecture Images

> The following commands build images for **linux/amd64** and **linux/arm64** and push them to Docker Hub.

##### Nginx Image

```bash
docker buildx build \
  --platform=linux/amd64,linux/arm64 \
  -t yourDockerHubUser/artes-nginx \
  --push .
```

##### Database Image

```bash
docker buildx build \
  --platform=linux/amd64,linux/arm64 \
  -t yourDockerHubUser/artes-db \
  --push .
```

##### Backend Image

```bash
docker buildx build \
  --platform=linux/amd64,linux/arm64 \
  -t yourDockerHubUser/artes-report-service \
  --push .
```

##### Frontend Image

```bash
docker buildx build \
  --platform=linux/amd64,linux/arm64 \
  -t yourDockerHubUser/artes-report-ui \
  --push .
```

> ⚠️ Make sure `docker buildx` is enabled and you are logged in to Docker Hub.

---

#### 4️⃣ Update Docker Compose

Replace image names in `docker-compose.yml` with your own:

```yaml
backend:
  image: yourDockerHubUser/artes-report-service

frontend:
  image: yourDockerHubUser/artes-report-ui

nginx:
  image: yourDockerHubUser/artes-nginx

db:
  image: yourDockerHubUser/artes-db
```

---

Your customized Artes Reporting System is now running with your own images 🚀

---

## 🛠️ Development

To modify or extend the project:

👉 **GitHub Repository**
[artes-reporting-system](https://github.com/4gayev1/artes-reporting-system)

---
