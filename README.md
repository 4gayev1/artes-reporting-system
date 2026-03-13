<p align="center">
  <img alt="ARS-Logo" src="https://github.com/user-attachments/assets/d7b07237-8342-46fe-8ae7-66a03b88fb27" width="280">
</p>

<h1 align="center">Artes Reporting System</h1>

[![Docker Artes](https://img.shields.io/badge/Docker-Artes-blue?logo=docker&logoColor=white)](https://hub.docker.com/r/vahidaghayev)
[![GitHub Artes](https://img.shields.io/badge/GitHub-Artes-181717?logo=github&logoColor=white)](https://github.com/4gayev1/Artes-Reporting-System)
[![Node.js](https://img.shields.io/badge/nodejs-backend-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgres-database-blue)](https://www.postgresql.org/)
[![MinIO](https://img.shields.io/badge/minio-object--storage-orange)](https://min.io/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

**Artes Reporting System** is a lightweight report hosting platform for QA and automation teams.
It allows uploading, storing, filtering, and previewing **HTML** and **Allure** reports via **UI** or **REST API**.

---

### Grid/List layout

<img width="1511" height="822" alt="preview 1" src="https://github.com/user-attachments/assets/f75cbdc4-ece0-46f3-a674-8a6b407e421b" />

<img width="1512" height="823" alt="image" src="https://github.com/user-attachments/assets/5e0eda0d-4915-4608-a5d1-9fe1b2b5e8d5" />

### Dark/light mode

<img width="1510" height="820" alt="preview 3" src="https://github.com/user-attachments/assets/682a6536-f2b0-4d1e-a15f-bcbf4b1d9b8e" />

## Upload Report

<img width="1919" height="955" alt="preview 4" src="https://github.com/user-attachments/assets/a2098afb-306b-4f55-8937-1bddb2ecaa18" />

## Report Preview

<img width="1511" height="821" alt="preview 4" src="https://github.com/user-attachments/assets/99b5fd6c-d9e8-44d5-bb20-2762388e1ccf" />

---

## ✨ Features

- 📄 Upload and preview **HTML reports**
- 📦 Upload **Allure reports** as ZIP files
- 🌐 Browser-based report preview
- 🔍 Advanced filtering
- 🗑️ Delete single or multiple reports
- 🐳 Fully Dockerized (Backend, UI, DB, Storage)

---

## 📁 Supported Report Types

### HTML Reports

Upload a single `.html` file and view it directly in the browser.

### Allure Reports

1. Generate Allure report (`allure generate`)
2. Zip the generated `allure-report` folder (or use npx artes -r --zip option to auto zip)
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
  minio_url TEXT NOT NULL,
  report_url TEXT NOT NULL,
  project VARCHAR(100) DEFAULT 'other',
  upload_date TIMESTAMP DEFAULT NOW(),
  os_name VARCHAR(50),
  browser_name VARCHAR(50),
  environment VARCHAR(50),
  executor VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS status (
  id UUID PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
  failed          INTEGER DEFAULT 0,
  broken          INTEGER DEFAULT 0,
  passed          INTEGER DEFAULT 0,
  skipped         INTEGER DEFAULT 0,
  unknown         INTEGER DEFAULT 0,
  pipeline_status INTEGER DEFAULT 0,
  pipeline_url         VARCHAR(255),
  pipeline_name        VARCHAR(100),
  pipeline_build_order INTEGER
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

### API documentation

```http
GET /docs
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

| Field                | Required  | Description                                                                   |
| -------------------- | --------  | ----------------------------------------------------------------------------- |
| name                 | ✅        | Report name                                                                   |
| file                 | ✅        | HTML file or ZIP                                                              |
| type                 | ❌        | Report type (`ui`, `api`, etc.), default: `unknown`                           |
| project              | ❌        | Project name, default: `unknown`                                              |


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

## ⚠️ Storage Management

Artes Reporting System does not automatically clean up old reports. Over time, stored reports will consume disk space, and if left unmanaged, **the system may stop functioning** due to full storage.

To prevent this, you should adopt one of the following strategies:

### Option 1 — Scheduled Cleanup via API or function (Cron Job)

Set up a cron job to periodically delete old reports using the bulk delete endpoint:
```bash
# Example: Delete all reports from a specific project every Sunday at midnight
0 0 * * 0 curl -X DELETE "http://localhost/reports?project=my-project"
```

> ⚠️ Calling `DELETE /reports` **without any filters** will permanently remove **all reports** from both the database and MinIO.

---

### Option 2 — MinIO Bucket Lifecycle Policy

Configure an automatic expiration policy directly on your MinIO bucket so that objects are deleted after a set number of days.

#### Via MinIO Console (UI)

1. Open MinIO Console at `http://localhost:9001`
2. Login with your credentials (`artes` / `artes123` by default)
3. Navigate to **Buckets** → select **artes-reports**
4. Click on the **Lifecycle** tab
5. Click **Add Lifecycle Rule**
6. Set the following:
   - **Expiry** → toggle it on
   - **After** → enter the number of days (e.g. `30`)
7. Click **Save**

> MinIO will now automatically delete objects older than the specified number of days.

#### Via CLI
```bash
mc ilm rule add --expiry-days 30 local/artes-reports
```

This will automatically remove any report files older than 30 days at the storage level.

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
docker buildx build --platform=linux/amd64,linux/arm64 -t yourDockerHubUser/artes-nginx --push .
```

##### Database Image

```bash
docker buildx build --platform=linux/amd64,linux/arm64 -t yourDockerHubUser/artes-db --push .
```

##### Backend Image

```bash
docker buildx build --platform=linux/amd64,linux/arm64 -t yourDockerHubUser/artes-report-service --push .
```

##### Frontend Image

```bash
docker buildx build --platform=linux/amd64,linux/arm64 -t yourDockerHubUser/artes-report-ui --push .
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
