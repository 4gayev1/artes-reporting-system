<p align="center">
  <img alt="artesLogo" src="https://github.com/user-attachments/assets/e0641011-0e96-4330-8ad5-935b395b0838" width="280">
</p>

<h1 align="center">Artes Reporting Server</h1>

![Docker](https://img.shields.io/badge/docker-ready-blue)
![Node.js](https://img.shields.io/badge/nodejs-backend-green)
![PostgreSQL](https://img.shields.io/badge/postgres-database-blue)
![MinIO](https://img.shields.io/badge/minio-object--storage-orange)
![License](https://img.shields.io/badge/license-internal-lightgrey)

**Artes Reporting Server** is a lightweight report hosting platform for QA and automation teams.
It allows uploading, storing, filtering, and previewing **HTML** and **Allure** reports via **UI** or **REST API**.

---

##  Reports List
<img width="1512" height="824" alt="image" src="https://github.com/user-attachments/assets/42a1e2ab-9ff0-4147-89f5-8d0874259b3b" />

### List/grid layout
<img width="1512" height="823" alt="image" src="https://github.com/user-attachments/assets/0f209d9f-151f-4419-8f9c-be09692ae123" />

### Dark/light mode
<img width="1512" height="821" alt="image" src="https://github.com/user-attachments/assets/d9f5a0a7-9953-4f08-a2df-640a2934424a" />

## Upload Report 
<img width="1512" height="813" alt="image" src="https://github.com/user-attachments/assets/352fd134-07e5-4261-a376-33c7db8e126b" />

## Report Preview
<img width="1512" height="826" alt="image" src="https://github.com/user-attachments/assets/4469010c-721f-4a2a-9a23-0118fd71d781" />

---

## ✨ Features

* 📄 Upload and preview **HTML reports**
* 📦 Upload **Allure reports** as ZIP files
* 🌐 Browser-based report preview
* 🔍 Filter reports by project, name, type, and date
* 🗑️ Delete single or multiple reports
* 🐳 Fully Dockerized (Backend, UI, DB, Storage)

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
   UI 
   |
Backend (Node.js / Express)
   |
PostgreSQL (metadata) + MinIO (files)
```

* **PostgreSQL** stores report metadata
* **MinIO** stores HTML & ZIP files (S3 compatible)

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

| Query Param | Description                    |
| ----------- | ------------------------------ |
| project     | Filter by project              |
| name        | Filter by name                 |
| type        | Report type (`ui`, `api`) |
| date        | Exact date                     |
| fromDate    | Start date                     |
| toDate      | End date                       |

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
| type    | ❌       | Default: `unknown`   |
| project | ❌       | Default: `unknown`   |
| file    | ✅       | HTML file or ZIP   |

---

### Upload Logo

```http
POST /logo
```

* Send `multipart/form-data`
* Only field required: `file`

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

| Query Param | Description                    |
| ----------- | ------------------------------ |
| project     | Filter by project              |
| name        | Filter by name                 |
| type        | Report type (`ui`, `api`) |
| date        | Exact date                     |
| fromDate    | Start date                     |
| toDate      | End date                       |

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
    container_name: artes-service
    restart: unless-stopped
    ports:
      - "4010:4010"
    volumes:
      - ./src/temp:/usr/src/app/src/temp  
    depends_on:
      - db
      - minio

  artes-ui:
    image: vahidaghayev/artes-report-ui:latest
    container_name: artes-ui
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - artes-service

  db:
    image: vahidaghayev/artes-db
    container_name: artes-db
    environment:
      POSTGRES_DB: artes_reports
      POSTGRES_USER: artes
      POSTGRES_PASSWORD: artes
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  minio:
    image: minio/minio
    container_name: artes-minio
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

## 🌐 Default URLs

| Service       | URL                                            |
| ------------- | ---------------------------------------------- |
| Backend API   | [http://localhost:4010](http://localhost:4010) |
| UI            | [http://localhost:80](http://localhost:80)     |
| MinIO Console | [http://localhost:9001](http://localhost:9001) |
| PostgreSQL    | localhost:5432                                 |

---

## 🐳 Docker Images

### DataBase
* **Image:** [`vahidaghayev/artes-db`](https://hub.docker.com/r/vahidaghayev/artes-db)

### Backend (API)
* **Image:** [`vahidaghayev/artes-report-service`](https://hub.docker.com/r/vahidaghayev/artes-report-service)
  
### Frontend (UI)
* **Image:** [`vahidaghayev/artes-report-ui`](https://hub.docker.com/r/vahidaghayev/artes-report-ui)



## 🔧 Configuration

Currently, the project **does not have a configuration file**.
If you want to change behavior, logic, UI, or defaults, you need to rebuild the Docker images.

### Steps

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/4gayev1/artes-reporting-server.git
cd artes-reporting-server
```

---

#### 2️⃣ Make Your Changes

* Update backend logic (API, storage, preview, etc.)
* Modify UI (design, fields, behavior)
* Adjust database initialization if needed

---

#### 3️⃣ Build & Push Multi-Architecture Images

> The following commands build images for **linux/amd64** and **linux/arm64** and push them to Docker Hub.

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

db:
  image: yourDockerHubUser/artes-db
```

---

Your customized Artes Reporting Server is now running with your own images 🚀

---

## 🛠️ Development

To modify or extend the project:

👉 **GitHub Repository**
[artes-reporting-server](https://github.com/4gayev1/artes-reporting-server)

---
