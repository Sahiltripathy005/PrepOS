# PlacementOS: API Contract & Specification
**Document Version:** 1.0.0  
**Status:** Approved  
**Author:** Principal API Architect & Staff Backend Engineer  

---

## Table of Contents
1. [API Philosophy & Architectural Rules](#1-api-philosophy--architectural-rules)
2. [Standard HTTP Response & Error Formats](#2-standard-http-response--error-formats)
3. [Authentication & Session API Contract](#3-authentication--session-api-contract)
4. [User Profile & Settings API Contract](#4-user-profile--settings-api-contract)
5. [Dashboard & Widget Management API Contract](#5-dashboard-&-widget-management-api-contract)
6. [Knowledge Base API Contract](#6-knowledge-base-api-contract)
7. [Practice Log API Contract](#7-practice-log-api-contract)
8. [Company Pipeline & Job Applications API Contract](#8-company-pipeline-&-job-applications-api-contract)
9. [Resume & Projects API Contract](#9-resume-&-projects-api-contract)
10. [Calendar API Contract](#10-calendar-api-contract)
11. [Analytics & Evidence API Contract](#11-analytics-&-evidence-api-contract)
12. [Mock Interviews API Contract](#12-mock-interviews-api-contract)
13. [Notifications API Contract](#13-notifications-api-contract)
14. [Global Search API Contract](#14-global-search-api-contract)
15. [Bulk Operations API Contract](#15-bulk-operations-api-contract)
16. [File Upload & Data Import/Export API Contract](#16-file-upload-&-data-import/export-api-contract)
17. [Real-time Event Streaming Architecture Contract](#17-real-time-event-streaming-architecture-contract)
18. [Pagination, Filtering, and Sorting Contracts](#18-pagination-filtering-and-sorting-contracts)
19. [Security & Guardrail Specifications](#19-security-&-guardrail-specifications)
20. [OpenAPI Specification Scaffold](#20-openapi-specification-scaffold)
21. [Summary (One-Page API Architecture Card)](#21-summary-one-page-api-architecture-card)

---

## 1. API Philosophy & Architectural Rules

All database communication, UI data fetches, and command inputs in PlacementOS adhere to a strict REST contract:

* **URI Versioning:** All endpoints are versioned, preventing breaking changes from disrupting legacy frontend installations:
  `/api/v1/[domain]/[resource]`
* **Predictable HTTP Verbs:**
  * `GET`: Fetch resources without altering backend state. Must be idempotent and safe.
  * `POST`: Create new resources or execute state commands (e.g., triggering calculation pipelines).
  * `PUT`: Completely replace an existing resource entity.
  * `PATCH`: Partially update mutable fields on a resource.
  * `DELETE`: Deactivate or purge a resource record.
* **Idempotency Strategy:** Writes that modify critical state (e.g., logging a DSA attempt) support header-based tokens:
  `Idempotency-Key: <uuid-v4>`
  If the API server receives a duplicate key within a 5-minute window, it returns the cached response instead of writing duplicate records.
* **API Caching Rules:** `GET` endpoints that fetch static parameters (like problem lists) return HTTP caching directives:
  `Cache-Control: private, max-age=3600`

---

## 2. Standard HTTP Response & Error Formats

To ensure consistent responses, every API return payload maps to one of four JSON schemas:

### I. Standard Success Response
```json
{
  "success": true,
  "data": {
    "id": "7fa8a25c-897b-402a-963d-4c3898696ab1",
    "title": "Log attempt tracking"
  }
}
```

### II. Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested practice attempt does not exist.",
    "details": null
  }
}
```

### III. Input Validation Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Input validation failed for parameters.",
    "details": [
      {
        "field": "durationSeconds",
        "issue": "Expected positive integer, received negative value"
      }
    ]
  }
}
```

### IV. Standard Paginated Response
```json
{
  "success": true,
  "data": [
    {
      "id": "e4f8d22c-8ab5-467f-94d0-6218e22c92e9",
      "title": "Binary Tree Inorder Traversal"
    }
  ],
  "pagination": {
    "type": "offset",
    "limit": 20,
    "offset": 40,
    "total": 142,
    "hasNext": true
  }
}
```

---

## 3. Authentication & Session API Contract

Handles user session states, logins, registration, and logout operations:

```
[POST /register] ──► Create profile ──► [POST /login] ──► Issue JWT & Refresh Token
                                                               │
[GET /session] ◄── Validates request header ◄── [POST /refresh] ◄┘
```

### Endpoints List

#### 1. Register User Profile
* **Path:** `POST /api/v1/auth/register`
* **Auth Required:** No
* **Request Payload:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "userId": "9da029ca-fa4c-4573-b6d3-2e2098d1a10f",
      "email": "user@example.com",
      "createdAt": "2026-07-13T23:59:00Z"
    }
  }
  ```

#### 2. Authenticate User Login
* **Path:** `POST /api/v1/auth/login`
* **Auth Required:** No
* **Request Payload:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "df87ab62-fa90-4c8d-b0df-d20cfb2e652a",
      "expiresInSeconds": 7200
    }
  }
  ```

#### 3. Refresh Access Token
* **Path:** `POST /api/v1/auth/refresh`
* **Auth Required:** No
* **Request Payload:**
  ```json
  {
    "refreshToken": "df87ab62-fa90-4c8d-b0df-d20cfb2e652a"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresInSeconds": 7200
    }
  }
  ```

#### 4. Terminate User Session
* **Path:** `POST /api/v1/auth/logout`
* **Auth Required:** Yes
* **Success Response (204 No Content):** Empty body.

---

## 4. User Profile & Settings API Contract

Provides read/write access to user details, custom layout parameters, and configurations:

### Endpoints List

#### 1. Fetch User Settings
* **Path:** `GET /api/v1/users/settings`
* **Auth Required:** Yes
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "themeMode": "dark",
      "densityMode": "comfortable",
      "accentColor": "#2563eb",
      "borderRadiusPx": 4
    }
  }
  ```

#### 2. Update User Settings
* **Path:** `PATCH /api/v1/users/settings`
* **Auth Required:** Yes
* **Request Payload:**
  ```json
  {
    "themeMode": "dark",
    "densityMode": "condensed"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "themeMode": "dark",
      "densityMode": "condensed",
      "accentColor": "#2563eb",
      "borderRadiusPx": 4
    }
  }
  ```

---

## 5. Dashboard & Widget Management API Contract

Enables custom dashboard arrangements and widget layouts:

### Endpoints List

#### 1. Fetch Dashboard Layouts
* **Path:** `GET /api/v1/dashboard/widgets`
* **Auth Required:** Yes
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "e30cf21a-4d7a-4c28-9892-db80ef9a656a",
        "widgetType": "REVISION_QUEUE",
        "gridX": 0,
        "gridY": 0,
        "gridW": 6,
        "gridH": 4,
        "isPinned": true,
        "customProperties": {}
      }
    ]
  }
  ```

#### 2. Save Widget Configuration
* **Path:** `PUT /api/v1/dashboard/widgets`
* **Auth Required:** Yes
* **Request Payload:**
  ```json
  {
    "widgets": [
      {
        "widgetType": "REVISION_QUEUE",
        "gridX": 0,
        "gridY": 0,
        "gridW": 4,
        "gridH": 4,
        "isPinned": true
      }
    ]
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "syncedCount": 1
    }
  }
  ```

---

## 6. Knowledge Base API Contract

Manages category folders and markdown study notes:

### Endpoints List

#### 1. Fetch Categories
* **Path:** `GET /api/v1/knowledge/categories`
* **Auth Required:** Yes
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "c10af81b-a49e-4dfa-be03-b0df14c8e109",
        "parentCategoryId": null,
        "name": "Data Structures",
        "sortOrder": 1
      }
    ]
  }
  ```

#### 2. Fetch Knowledge Note
* **Path:** `GET /api/v1/knowledge/notes/:id`
* **Auth Required:** Yes
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "n40ba81b-c40d-45da-96a2-e2098a8c1f9b",
      "categoryId": "c10af81b-a49e-4dfa-be03-b0df14c8e109",
      "title": "Merge Sort Algorithm",
      "contentMarkdown": "# Merge Sort\nMerge sort is an O(N log N) divide-and-conquer algorithm...",
      "createdAt": "2026-07-13T23:59:00Z"
    }
  }
  ```

---

## 7. Practice Log API Contract

Provides tracking for algorithmic problems, attempt logs, and mistake tagging:

### Endpoints List

#### 1. Fetch Problems List
* **Path:** `GET /api/v1/practice/problems`
* **Auth Required:** Yes
* **Query Parameters:**
  * `limit` (Optional, Default: 20)
  * `offset` (Optional, Default: 0)
  * `difficulty` (Optional: `EASY`, `MEDIUM`, `HARD`)
  * `topicTag` (Optional: `TREES`, `GRAPHS`)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "p89ca81b-b40f-48d0-9d0d-6e209e8c2f9b",
        "title": "Reverse Linked List",
        "url": "https://leetcode.com/problems/reverse-linked-list/",
        "difficulty": "EASY",
        "topicTag": "LINKED_LIST"
      }
    ],
    "pagination": {
      "type": "offset",
      "limit": 20,
      "offset": 0,
      "total": 120,
      "hasNext": true
    }
  }
  ```

#### 2. Log Problem Attempt
* **Path:** `POST /api/v1/practice/attempts`
* **Auth Required:** Yes
* **Request Payload:**
  ```json
  {
    "problemId": "p89ca81b-b40f-48d0-9d0d-6e209e8c2f9b",
    "durationSeconds": 1200,
    "status": "PASS",
    "codeSnippet": "/* code */",
    "userNotes": "Managed in single iteration",
    "mistakeTagIds": []
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "attemptId": "a12ca81b-4d0f-4fae-9d2e-e40df823c92a",
      "problemId": "p89ca81b-b40f-48d0-9d0d-6e209e8c2f9b",
      "status": "PASS",
      "createdAt": "2026-07-13T23:59:00Z"
    }
  }
  ```

---

## 8. Company Pipeline & Job Applications API Contract

Manages target employers and job applications tracking:

### Endpoints List

#### 1. Fetch Application Pipeline
* **Path:** `GET /api/v1/companies/applications`
* **Auth Required:** Yes
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "ap34fa2c-567a-4bcf-89aa-cb20ea8c892f",
        "companyName": "GitHub",
        "jobTitle": "Backend Engineer",
        "currentStage": "INTERVIEW",
        "updatedAt": "2026-07-13T23:59:00Z"
      }
    ]
  }
  ```

#### 2. Update Application Stage
* **Path:** `PATCH /api/v1/companies/applications/:id/stage`
* **Auth Required:** Yes
* **Request Payload:**
  ```json
  {
    "stage": "OFFER",
    "stageNotes": "Received verbal offer after panel loop round."
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "ap34fa2c-567a-4bcf-89aa-cb20ea8c892f",
      "currentStage": "OFFER",
      "updatedAt": "2026-07-13T23:59:30Z"
    }
  }
  ```

---

## 9. Resume & Projects API Contract

Tracks technical project lists and resume revisions:

### Endpoints List

#### 1. Fetch Resume Versions
* **Path:** `GET /api/v1/resume/versions`
* **Auth Required:** Yes
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "r89fa2d-78fa-4bcf-a20d-89df123c8e9b",
        "versionLabel": "v1.2-Backend-Focused",
        "fileUrl": "/uploads/resumes/r89fa2d.pdf",
        "createdAt": "2026-07-13T23:59:00Z"
      }
    ]
  }
  ```

#### 2. Log Project Details
* **Path:** `POST /api/v1/projects`
* **Auth Required:** Yes
* **Request Payload:**
  ```json
  {
    "title": "PlacementOS",
    "gitRepoUrl": "https://github.com/user/placement-os",
    "liveUrl": "https://placementos.local",
    "architectureNotes": "Built using ERN modular layout stack."
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "p32ba7b-67ea-4def-90fa-120ea8f921ea",
      "title": "PlacementOS",
      "createdAt": "2026-07-13T23:59:00Z"
    }
  }
  ```

---

## 10. Calendar API Contract

Manages schedules, calendar views, and milestones:

### Endpoints List

#### 1. Fetch Calendar Events
* **Path:** `GET /api/v1/calendar/events`
* **Auth Required:** Yes
* **Query Parameters:**
  * `startDate` (ISO String, Required)
  * `endDate` (ISO String, Required)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "e45a7b2-cdef-401a-829d-092df8921e90",
        "title": "Company X coding round",
        "eventCategory": "INTERVIEW",
        "startTime": "2026-07-15T10:00:00Z",
        "endTime": "2026-07-15T11:00:00Z",
        "linkedResourceId": "ap34fa2c-567a-4bcf-89aa-cb20ea8c892f"
      }
    ]
  }
  ```

---

## 11. Analytics & Evidence API Contract

Accesses performance reports, snapshots, and evidence data exports:

### Endpoints List

#### 1. Fetch Performance Snapshots
* **Path:** `GET /api/v1/analytics/snapshots`
* **Auth Required:** Yes
* **Query Parameters:**
  * `days` (Optional, Default: 30)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "date": "2026-07-13",
        "solvedCount": 4,
        "averageDurationSeconds": 1340,
        "firstPassAccuracy": 0.75,
        "activeMinutes": 90
      }
    ]
  }
  ```

#### 2. Compile Evidence Profile
* **Path:** `GET /api/v1/evidence/compile`
* **Auth Required:** Yes
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "profileHash": "sha256-d8f921ab0ffea81b67...",
      "compiledAt": "2026-07-13T23:59:00Z",
      "summary": {
        "totalPracticeHours": 142.5,
        "totalSolved": 180,
        "firstPassAccuracy": 0.82,
        "mockInterviewsCompleted": 8
      }
    }
  }
  ```

---

## 12. Mock Interviews API Contract

Tracks feedback from mock interviews and STAR response banks:

### Endpoints List

#### 1. Fetch Mock Interviews
* **Path:** `GET /api/v1/interviews/mocks`
* **Auth Required:** Yes
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "m90af12-78d2-4bcf-89ea-ef3456cb78d2",
        "scheduledAt": "2026-07-20T15:00:00Z",
        "feedbackScore": 8,
        "interviewerName": "John Doe",
        "notes": "Good handling of tree questions. Needs to explain logic before coding."
      }
    ]
  }
  ```

#### 2. Save STAR Response
* **Path:** `POST /api/v1/interviews/star`
* **Auth Required:** Yes
* **Request Payload:**
  ```json
  {
    "situation": "Our production DB latency spiked by 200%.",
    "task": "Identify memory leaks and fix database connection limits.",
    "action": "Implemented pg-pool configurations and indexed key tables.",
    "result": "Reduced latency to under 35ms."
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "s89af12-bc0d-45da-96a2-cf2098a8c12a",
      "situation": "Our production DB latency spiked by 200%.",
      "createdAt": "2026-07-13T23:59:00Z"
    }
  }
  ```

---

## 13. Notifications API Contract

Handles alerts for upcoming tasks, events, and scheduling conflicts:

### Endpoints List

#### 1. Fetch Active Notifications
* **Path:** `GET /api/v1/notifications`
* **Auth Required:** Yes
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "n89da2c-56ea-4fae-9d2e-120cf823c90f",
        "message": "Graph algorithms queue decays today (No practice in 14 days).",
        "category": "REVISION_ALERT",
        "createdAt": "2026-07-13T23:59:00Z"
      }
    ]
  }
  ```

#### 2. Mark Notification as Read
* **Path:** `PATCH /api/v1/notifications/:id/read`
* **Auth Required:** Yes
* **Success Response (204 No Content):** Empty body.

---

## 14. Global Search API Contract

Provides fuzzy and category-scoped search queries:

### Endpoints List

#### 1. Execute Global Search
* **Path:** `GET /api/v1/search`
* **Auth Required:** Yes
* **Query Parameters:**
  * `q` (Search query string, Required)
  * `scope` (Optional: `KNOWLEDGE`, `PRACTICE`, `COMPANIES`, `ALL`, Default: `ALL`)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "type": "PRACTICE_PROBLEM",
        "title": "Reverse Linked List",
        "referenceId": "p89ca81b-b40f-48d0-9d0d-6e209e8c2f9b",
        "relevanceScore": 0.98
      },
      {
        "type": "KNOWLEDGE_NOTE",
        "title": "Linked List Patterns",
        "referenceId": "n40ba81b-c40d-45da-96a2-e2098a8c1f9b",
        "relevanceScore": 0.85
      }
    ]
  }
  ```

---

## 15. Bulk Operations API Contract

Enables modifications to multiple records in a single request:

### Endpoints List

#### 1. Bulk Update Job Applications
* **Path:** `POST /api/v1/companies/applications/bulk-update`
* **Auth Required:** Yes
* **Request Payload:**
  ```json
  {
    "applicationIds": [
      "ap34fa2c-567a-4bcf-89aa-cb20ea8c892f",
      "ap90da2e-89da-4bcf-90aa-e40df89c21ef"
    ],
    "action": "ARCHIVE"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "updatedCount": 2
    }
  }
  ```

#### 2. Bulk Delete Practice Attempts
* **Path:** `POST /api/v1/practice/attempts/bulk-delete`
* **Auth Required:** Yes
* **Request Payload:**
  ```json
  {
    "attemptIds": [
      "a12ca81b-4d0f-4fae-9d2e-e40df823c92a",
      "a89da2c-fa0e-4fae-90aa-c20e234c89da"
    ]
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "deletedCount": 2
    }
  }
  ```

---

## 16. File Upload & Data Import/Export API Contract

Manages file uploads and bulk data imports/exports:

### Endpoints List

#### 1. Upload Resume PDF
* **Path:** `POST /api/v1/upload/resume`
* **Auth Required:** Yes
* **Headers:** `Content-Type: multipart/form-data`
* **Request Body:** File attachment key: `file`
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "resumeId": "r89fa2d-78fa-4bcf-a20d-89df123c8e9b",
      "fileName": "resume-july-2026.pdf",
      "fileUrl": "/uploads/resumes/r89fa2d.pdf"
    }
  }
  ```

#### 2. Import Practice Attempts Log
* **Path:** `POST /api/v1/import/practice`
* **Auth Required:** Yes
* **Headers:** `Content-Type: multipart/form-data`
* **Request Body:** File attachment key: `file` (JSON, CSV, or Markdown format)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "importedRecordsCount": 150,
      "skippedCount": 2,
      "errors": []
    }
  }
  ```

#### 3. Export System Data
* **Path:** `GET /api/v1/export`
* **Auth Required:** Yes
* **Query Parameters:**
  * `format` (`json`, `csv`, `pdf`, Required)
* **Headers:** `Content-Type: application/octet-stream`
* **Success Response (200 OK):** Binary download stream.

---

## 17. Real-Time Event Streaming Architecture Contract

PlacementOS uses **Server-Sent Events (SSE)** for real-time updates and notification broadcasts. SSE is preferred over WebSockets because it is lightweight, runs over standard HTTP, supports reconnection out of the box, and is unidirectional, matching the app's update patterns.

```text
[React Client] ────► Connect EventSource ────► [Express SSE Handler]
                                                        │
[Client UI Updates] ◄── Stream JSON Event ◄─────────────┘
```

### Event Stream Connection
* **Path:** `GET /api/v1/events/stream`
* **Headers Required:** 
  * `Accept: text/event-stream`
  * `Cache-Control: no-cache`
  * `Connection: keep-alive`

### Streamed Message Formats

#### I. Revision Queue Decay Notification Event
```text
event: REVISION_DECAY
data: {"problemId": "p89ca81b-b40f-48d0-9d0d-6e209e8c2f9b", "title": "Reverse Linked List", "decayPercent": 100}
```

#### II. Import Progress Update Event
```text
event: IMPORT_PROGRESS
data: {"jobId": "uuid-901", "processed": 45, "total": 100, "status": "processing"}
```

---

## 18. Pagination, Filtering, and Sorting Contracts

To ensure queries are fast and efficient, the API implements two pagination methods:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Pagination Strategy                           │
├─────────────────────────────────────────────────────────────────────────┤
│ Offset Pagination: GET /api/v1/practice/problems                        │
│ - Ideal for static lists, configuration catalogs, and settings pages.   │
│ - Parameters: ?limit=20&offset=40                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ Cursor Pagination: GET /api/v1/practice/attempts                        │
│ - Ideal for high-frequency logs, history feeds, and timeline lists.    │
│ - Parameters: ?limit=20&cursor=a12ca81b-4d0f-4fae                       │
└─────────────────────────────────────────────────────────────────────────┘
```

* **Offset Pagination:** Used for static datasets (e.g., problem lists) where jumping to specific pages is useful.
* **Cursor Pagination:** Used for high-volume logs (e.g., attempt history feeds) to prevent page-drift issues during background inserts and keep query speeds constant (`O(1)`).

### Sorting Parameters
Query arrays use standard field indicators:
`?sort=createdAt:desc,durationSeconds:asc`

### Filtering Query Mapping
Use logical field filters:
`?filter[difficulty]=MEDIUM&filter[status]=PASS`

---

## 19. Security & Guardrail Specifications

* **Auth Verification (JWT):** Incoming requests must include signed authentication headers:
  `Authorization: Bearer <accessToken>`
* **Refresh Token Rotation:** Refresh tokens are valid for single-use exchange. Swapping a refresh token automatically issues a new pair, protecting against session hijacking.
* **API Rate Limiting:**
  * Login/Register endpoints: Max 10 requests per minute per IP address.
  * Standard data query routes: Max 200 requests per minute per IP address.
  * Error code returned on rate limit breaches: `429 Too Many Requests`.
* **CORS Guardrails:** Rejects API calls from origins outside local development ports:
  `Access-Control-Allow-Origin: http://localhost:5173`

---

## 20. OpenAPI Specification Scaffold

The API catalog is organized using the OpenAPI 3.0 standard. Paths and Schemas are mapped within a single config structure:

```yaml
openapi: 3.0.3
info:
  title: PlacementOS Core API
  version: 1.0.0
  description: API contract definitions for PlacementOS developer workspaces.
paths:
  /auth/login:
    post:
      tags:
        - Authentication
      summary: Authenticate session
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Session tokens generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LoginResponse'
        '401':
          description: Credentials invalid
  /practice/attempts:
    post:
      tags:
        - Practice Log
      summary: Log new attempt
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LogAttemptRequest'
      responses:
        '201':
          description: Attempt logged successfully
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    LoginRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
        password:
          type: string
    LoginResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: object
          properties:
            accessToken:
              type: string
            refreshToken:
              type: string
```

---

## 21. Summary (One-Page API Architecture Card)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          PlacementOS API Contract                        │
├──────────────────────────────────────────────────────────────────────────┤
│ Base Path: /api/v1  •  Encoding: JSON (Application/json)                 │
│ Session Check: JWT Bearer Tokens  •  Upload Limit: 10MB PDF/JSON          │
│ Real-Time Updates: Server-Sent Events (SSE) EventSource Streams          │
├──────────────────────────────────────────────────────────────────────────┤
│                             CORE API LAWS                                │
│ 1. All response payloads must match standard success/error formats.      │
│ 2. Return HTTP 429 when rate limits are exceeded.                        │
│ 3. Include Idempotency-Key headers on all transactional POST routes.     │
│ 4. Use Cursor pagination for logs and Offset pagination for static lists. │
│ 5. Every endpoint must validate input payloads against Zod definitions.  │
│ 6. Reject requests from origins outside the local CORS configuration.    │
└──────────────────────────────────────────────────────────────────────────┘
```

---
*End of Phase 3 API Contract & Specification.*
