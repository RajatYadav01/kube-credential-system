# Kube Credential System

## Table of contents

- [Kube Credential System](#kube-credential-system)
  - [Table of contents](#table-of-contents)
  - [About](#about)
  - [Usage](#usage)
  - [Architecture](#architecture)
    - [System Components](#system-components)
    - [Data Flow](#data-flow)
    - [API Endpoints](#api-endpoints)
  - [Development](#development)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)

## About

A microservices-based credential issuance and verification system built with Node.js/TypeScript, React.js/TypeScript, SQLite, Docker and Kubernetes.

## Usage

To use the project you can visit [RajatYadav01.github.io/kube-credential-system](https://rajatyadav01.github.io/kube-credential-system/) which hosts the projects's front end. The back end of project is hosted on [Render](https://render.com).

## Architecture

### System Components

1. **Issuance Service**

   - Issues new credentials
   - Prevents duplicate issuance
   - Returns worker/pod information

2. **Verification Service**

   - Verifies credential validity
   - Returns issuance timestamp and worker info

3. **Frontend**
   - User interface for issuance and verification
   - Provides real-time feedback and error handling

### Data Flow

1. User submits credential data via frontend.
2. Issuance service validates and stores credential.
3. System returns credential ID and worker info.
4. User can verify credential using the subject ID.
5. Verification service checks credential existence and validity.

### API Endpoints

Issuance Service

- Health Check

  `GET /api/issuance/health`

  Response:

  ```json
  {
    "status": "healthy",
    "service": "issuance-service",
    "worker": "kube-credential-system-backend-issuance-1"
  }
  ```

- Issue a New Credential

  `POST /api/issuance/issue`

  Request:

  ```json
  {
    "type": "Identity Credential",
    "issuer": "Kube Credential System",
    "subjectId": "user123",
    "claims": {
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    }
  }
  ```

  Response:

  ```json
  {
    "message": "Credential issued successfully",
    "credentialId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "issuedAt": "2023-10-05T12:00:00.000Z",
    "workerId": "kube-credential-system-backend-issuance-1"
  }
  ```

- Get All Credentials

  `GET /api/issuance/credentials`

  Response:

  ```json
  {
    [
      {
        "credentialId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "subjectId": "user123",
        "type": "Identity Credential",
        "issuer": "Kube Credential System",
        "claims": {
          "name": "John Doe",
          "email": "john@example.com",
          "role": "admin"
        },
        "issuedAt": "2025-10-05 13:30:35",
        "workerId": "kube-credential-system-backend-issuance-1"
      },
      {
        "credentialId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "subjectId": "user123",
        "type": "Identity Credential",
        "issuer": "Kube Credential System",
        "claims": {
          "name": "Jane Doe",
          "email": "jane@example.com",
          "role": "admin"
        },
        "issuedAt": "2025-10-05 15:11:42",
        "workerId": "kube-credential-system-backend-issuance-1"
      }
    ],
  }
  ```

- Get Specific Credential

  `GET /api/issuance/credentials/:id`

  Response:

  ```json
  {
    "credentialId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "subjectId": "user123",
    "type": "Identity Credential",
    "issuer": "Kube Credential System",
    "claims": {
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    },
    "issuedAt": "2025-10-05 13:30:35",
    "workerId": "kube-credential-system-backend-issuance-1"
  }
  ```

Verification Service

- Health Check

  `GET /api/verification/health`

  Response:

  ```json
  {
    "status": "healthy",
    "service": "verification-service",
    "worker": "kube-credential-system-backend-verification-1"
  }
  ```

- Verify Credential by ID

  `POST /api/verification/verify`

  Request:

  ```json
  {
    "subjectId": "user123"
  }
  ```

  Response (Success):

  ```json
  {
    "verified": true,
    "credentialId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "type": "Identity Credential",
    "issuer": "Kube Credential System",
    "subjectId": "user123",
    "claims": {
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    },
    "issuedAt": "2025-10-05 13:30:35",
    "workerId": "kube-credential-system-backend-issuance-1",
    "verifiedBy": "kube-credential-system-backend-verification-1",
    "message": "Credential verified by kube-credential-system-backend-verification-1"
  }
  ```

  Response (Not Found):

  ```json
  {
    "verified": false,
    "message": "Credential not found",
    "verifiedBy": "kube-credential-system-backend-verification-1"
  }
  ```

## Development

### Prerequisites

You need to have the following installed on your system:

- Node.js (preferably, version >= v22.17.x)
- yarn (preferably, version >= v1.22.22)
- Docker (preferably the latest version)
- Kubernetes (Minikube) (preferably the latest version)

### Setup

1. In the project folder, build the Docker image for the issuance service.

   ```bash
   docker build -t kube-credential-system-issuance-service:latest ./backend/issuance-service/
   ```

2. Build the Docker image for the verification service.

   ```bash
   docker build -t kube-credential-system-verification-service:latest ./backend/verification-service/
   ```

3. Build the Docker image for the frontend.

   ```bash
   docker build -t kube-credential-system-frontend:latest ./frontend/
   ```

4. Start the Minikube cluster on the machine.

   ```bash
   minikube start
   ```

5. Apply the YAML configuration for the issuance service to create it as a Kubernetes resource.

   ```bash
   kubectl apply -f k8s/backend-issuance/
   ```

6. Apply the YAML configuration for the verification service to create it as a Kubernetes resource.

   ```bash
   kubectl apply -f k8s/backend-verification/
   ```

7. Apply the YAML configuration for the frontend to create it as a Kubernetes resource.

   ```bash
   kubectl apply -f k8s/frontend/
   ```

8. To automatically open the URL for the frontend in your browser using Minikube.

   ```bash
   minikube service kube-credential-system-frontend
   ```
