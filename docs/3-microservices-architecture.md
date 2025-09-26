# Microservices Architecture Documentation

## Calculator Backend Service

### 1. Core Structure
Located in: `calculator_backend/`

#### 1.1 Main Application (`main.py`)
```python
app = FastAPI(
    title="Calculator Service",
    description="Microservice for performing complex calculations and metrics processing",
    version="1.0.0"
)
```

#### 1.2 Configuration (`core/config.py`)
```python
class Settings(BaseSettings):
    CALCULATION_TIMEOUT: int = 300
    MAX_WORKERS: int = 4
    CACHE_TTL: int = 3600
```

### 2. Calculation Engine

#### 2.1 Metric Processing
```python
async def process_metrics(data: Dict[str, Any]) -> Dict[str, float]:
    metrics = {
        "availability": calculate_availability(data),
        "reliability": calculate_reliability(data),
        "performance": calculate_performance(data)
    }
    return metrics
```

#### 2.2 Statistical Analysis
```python
def calculate_statistics(values: List[float]) -> Dict[str, float]:
    return {
        "mean": np.mean(values),
        "median": np.median(values),
        "std_dev": np.std(values),
        "variance": np.var(values)
    }
```

## Parser Backend Service

### 1. Core Structure
Located in: `parser_backend/`

#### 1.1 Parser Registry
```python
PARSER_REGISTRY = {
    "cisco_asa": CiscoASAParser,
    "kaspersky_av": KasperskyAVParser,
    "nessus": NessusParser
}
```

### 2. Parser Implementations

#### 2.1 Cisco ASA Parser (`parsers/cisco_asa.py`)
```python
class CiscoASAParser:
    def parse_log_entry(self, line: str) -> Dict[str, Any]:
        # Regex patterns for different log formats
        patterns = {
            "access_list": r"%ASA-\d-\d+: Access Rule .*",
            "vpn": r"%ASA-\d-\d+: Group .* User .* IP .*",
            # ... other patterns
        }
        
        for log_type, pattern in patterns.items():
            if match := re.match(pattern, line):
                return self._parse_match(log_type, match)
```

#### 2.2 Kaspersky AV Parser (`parsers/KasperskyAV.py`)
```python
class KasperskyAVParser:
    def __init__(self):
        self.event_types = {
            "1": "Malware Detection",
            "2": "Scan Complete",
            # ... event type mappings
        }
    
    def parse_event(self, event_data: str) -> Dict[str, Any]:
        # Event parsing logic
```

#### 2.3 Nessus Parser (`parsers/nessus.py`)
```python
class NessusParser:
    def parse_report(self, xml_content: str) -> Dict[str, Any]:
        root = ET.fromstring(xml_content)
        return {
            "scan_info": self._parse_scan_info(root),
            "vulnerabilities": self._parse_vulnerabilities(root),
            "hosts": self._parse_hosts(root)
        }
```

### 3. Parsing Pipeline

#### 3.1 File Processing
```python
async def process_file(
    file: UploadFile,
    parser_type: str
) -> Dict[str, Any]:
    parser = PARSER_REGISTRY[parser_type]()
    
    # Process in chunks to handle large files
    content = await read_file_chunks(file)
    return await parser.parse(content)
```

#### 3.2 Result Normalization (`normalizer.py`)
```python
def normalize_results(
    parsed_data: Dict[str, Any],
    parser_type: str
) -> Dict[str, Any]:
    """Normalize parser-specific results to common format"""
    normalizer = Normalizer()
    return normalizer.normalize(parsed_data, parser_type)
```

### 4. Error Handling

#### 4.1 Parser Exceptions
```python
class ParserException(Exception):
    def __init__(self, parser_type: str, message: str):
        self.parser_type = parser_type
        self.message = message
        super().__init__(f"{parser_type}: {message}")
```

#### 4.2 Error Handling Middleware
```python
@app.exception_handler(ParserException)
async def parser_exception_handler(
    request: Request,
    exc: ParserException
):
    return JSONResponse(
        status_code=400,
        content={
            "error": "Parser Error",
            "parser": exc.parser_type,
            "message": exc.message
        }
    )
```

### 5. Caching System

#### 5.1 Cache Configuration
```python
cache = Cache(
    'memory://',
    ttl=300,  # 5 minutes
    serializer=JsonSerializer()
)
```

#### 5.2 Cache Implementation
```python
@cache.cached(key_builder=lambda *args, **kwargs: f"parse_{kwargs['parser_type']}")
async def cached_parse(
    file_content: str,
    parser_type: str
) -> Dict[str, Any]:
    parser = PARSER_REGISTRY[parser_type]()
    return await parser.parse(file_content)
```

### 6. Performance Optimizations

#### 6.1 Chunked Processing
```python
async def read_file_chunks(file: UploadFile, chunk_size: int = 8192):
    content = []
    while chunk := await file.read(chunk_size):
        content.append(chunk)
    return b"".join(content)
```

#### 6.2 Parallel Processing
```python
async def process_multiple_files(
    files: List[UploadFile],
    parser_type: str
) -> List[Dict[str, Any]]:
    tasks = [process_file(file, parser_type) for file in files]
    return await asyncio.gather(*tasks)
```

### 7. Monitoring and Logging

#### 7.1 Performance Metrics
```python
def log_performance_metrics(
    parser_type: str,
    file_size: int,
    processing_time: float
):
    logger.info(
        f"Parser: {parser_type}, "
        f"Size: {file_size/1024:.2f}KB, "
        f"Time: {processing_time:.2f}s"
    )
```

#### 7.2 Error Tracking
```python
def track_parser_error(
    parser_type: str,
    error: Exception,
    file_info: Dict[str, Any]
):
    logger.error(
        f"Parser failure: {parser_type}",
        extra={
            "error": str(error),
            "file_info": file_info
        }
    )
```