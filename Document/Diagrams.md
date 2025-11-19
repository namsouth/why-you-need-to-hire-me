
### DB Schema for ApiServer
```mermaid
erDiagram
    techStack ||--o{ projectTech : "uses"
    project ||--o{ projectTech : "employs"
    user ||--o{ activityLog: "trigger"
    user ||--o| userSession: "has"
    sampleApi ||--o{ apiJSON: "has"

    techStack {
        int id PK
        string name
        string description
        string url
        string parentId FK
    }

    project {
        int id PK
        string name
        string description
    }

    projectTech {
        string projectId PK,FK
        string techId PK,FK
        string description
        string issue
    }
    
    user {
	    int id PK
	    string name
	    string password
	    date createTime
	    date lastLoginTime
	    string role
    }

	userSession {
		int id PK
		int userId FK 
		date createTime
		date expireTime
	}

	activityLog {
		int id PK 
		int userId FK
		string actionName
		string actionDetail
	}

	sampleApi {
		int id PK 
		string name 
		string description 
	}

	apiJSON {
		int id PK
		int apiId FK
		string name 
		string detail
	}
	

	
```

### Sequence diagram for  Single Sign On with JWT 

Here's a **Mermaid sequence diagram** illustrating the **login flow** across your three systems:

- `WebServer` (Vue frontend)
- `authServer` (Spring Boot authentication server — issues JWT + refresh tokens)
- `apiServer` (Spring backend — protected resources, validates JWT)

The flow includes: 
✅ Credentials submission  
✅ IP/domain whitelist checks (early in `authServer`)  
✅ JWT issuance (short-lived access + long-lived refresh)  
✅ Subsequent API call with access token  
✅ RBAC enforcement on `apiServer`

```mermaid 
sequenceDiagram
    participant User as User (Browser)
    participant WebServer as WebServer (Vue)
    participant authServer as authServer (Spring Boot)
    participant apiServer as apiServer (Spring Boot)

    User->>WebServer: 1. Enter credentials & submit login form
    WebServer->>authServer: 2. POST /login<br>{ username, password }
    
    Note over authServer: ⚠️ IPWhitelistFilter<br>DomainWhitelistFilter<br>(early rejection if not allowed)

    alt ✅ Credentials valid & IP/domain OK
        authServer->>authServer: 3. Generate:<br>- access_token (JWT, 15min)<br>- refresh_token (UUID, stored in Redis)
        authServer-->>WebServer: 4. 200 OK<br>{<br>  "access_token": "eyJ...",<br>  "refresh_token": "abc123...",<br>  "expires_in": 900<br>}
        WebServer->>WebServer: 5. Store tokens securely:<br>- access_token → memory/HttpOnly cookie<br>- refresh_token → HttpOnly cookie or secure storage
    else ❌ Invalid IP/domain/creds
        authServer-->>WebServer: 403/401 with error
        WebServer->>User: Show error
    end

    User->>WebServer: 6. Navigate to protected view (e.g. /dashboard)
    WebServer->>apiServer: 7. GET /api/users<br>Authorization: Bearer eyJ...

    Note over apiServer: 🔐 JwtAuthenticationFilter<br>→ Validates signature, expiry, issuer<br>→ Extracts authorities (roles)

    alt ✅ JWT valid & user has required role
        apiServer->>apiServer: 8. @PreAuthorize("hasRole('USER')") → OK
        apiServer-->>WebServer: 9. 200 OK + data
        WebServer->>User: Render dashboard
    else ❌ Invalid/expired JWT or insufficient role
        apiServer-->>WebServer: 401 (invalid token) or 403 (no role)
        WebServer->>WebServer: Clear tokens, redirect to /login
    end

    Note right of WebServer: 🔁 Token refresh (optional flow):<br>When access_token expires,<br>→ POST /refresh with refresh_token<br>→ Get new access_token
```
