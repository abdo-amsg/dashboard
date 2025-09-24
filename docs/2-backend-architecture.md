# Backend Architecture Documentation

## Main Backend Service

### 1. Authentication System
Located in: `backend/app/auth/`

#### Key Components

##### 1.1 Security Module (`security.py`)
```python
# Password hashing and verification
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# JWT token management
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    # ... token creation logic
```

**Features**:
- Secure password hashing using bcrypt
- JWT token generation and validation
- Token expiration management
- Refresh token support

##### 1.2 Authentication Routes (`auth_routes.py`)
```python
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Authentication logic
```

**Endpoints**:
- `/login`: User authentication
- `/refresh`: Token refresh
- `/logout`: Session termination
- `/register`: User registration

##### 1.3 Admin Routes (`admin_routes.py`)
```python
@router.get("/users", response_model=List[UserRead])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_superuser),
):
    # Admin user management logic
```

### 2. Database Models (`models.py`)

#### 2.1 User Model
```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
```

#### 2.2 Role-Based Access Control
```python
class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    permissions = relationship("Permission", secondary=role_permissions)
```

### 3. Database Layer

#### 3.1 SQLAlchemy Configuration
```python
SQLALCHEMY_DATABASE_URL = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

#### 3.2 Migration System (Alembic)
Located in: `backend/alembic/`

Key Operations:
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### 4. Core Configuration

#### 4.1 Environment Settings (`config.py`)
```python
class Settings(BaseSettings):
    PROJECT_NAME: str = "Dashboard"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_HOST: str
    POSTGRES_PORT: str
    POSTGRES_DB: str
    # ... other settings
```

#### 4.2 Logging Configuration (`logging.py`)
```python
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "()": "uvicorn.logging.DefaultFormatter",
            "fmt": "%(levelprefix)s %(asctime)s %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    }
    # ... logging configuration
}
```

### 5. Dashboard Functionality

#### 5.1 Dashboard Routes (`dashboard_routes.py`)
```python
@router.get("/metrics")
async def get_metrics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Metrics retrieval logic
```

Key Endpoints:
- `/metrics`: Get dashboard metrics
- `/upload`: File upload handling
- `/kpis`: KPI data management

#### 5.2 Data Models
```python
class Metric(Base):
    __tablename__ = "metrics"
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    value = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
```

### 6. API Error Handling

#### 6.1 Custom Exceptions
```python
class CustomException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail
```

#### 6.2 Exception Handlers
```python
@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )
```

### 7. Middleware Configuration

#### 7.1 CORS Settings
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 7.2 Security Headers
```python
security_headers = {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Content-Security-Policy": "default-src 'self'",
}
```

### 8. Testing Framework

#### 8.1 Test Configuration
```python
def get_test_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()
```

#### 8.2 Test Cases
```python
def test_create_user(client: TestClient, db: Session):
    response = client.post(
        f"{settings.API_V1_STR}/users/",
        json={
            "email": "test@example.com",
            "password": "test123",
        },
    )
    assert response.status_code == 200
```