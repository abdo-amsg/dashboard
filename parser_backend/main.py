from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
from parsers import nessus, cisco_asa, KasperskyAV
from normalizer import Normalizer
import json
import logging
import aiofiles

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Security Parser Service", version="1.0.0")

DASHBOARD_SERVICE_URL = "http://localhost:8000"  # service name in Docker Compose

from typing import List, Dict, Any
class ParsedFinding(BaseModel):
    raw_finding: Dict[str, Any]  # Original finding from the parser
    normalized_finding: Dict[str, Any]  # Processed by Normalizer

class ParseResponse(BaseModel):
    findings: List[ParsedFinding]

class ParseRequest(BaseModel):
    file_id: int
    tool_id: int
    user_id: int
    auth_token: str

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "parser_backend"}

@app.post("/parse", response_model=ParseResponse)
async def parse_file(request: ParseRequest):
    """Parse uploaded security report file"""
    try:
        logger.info(f"Starting to parse file_id: {request.file_id} with tool_id: {request.tool_id}")

        file_info, tool_info = await _fetch_file_and_tool_info(request)
        file_content = await _read_file_content(file_info)
        parser = _initialize_parser(tool_info)

        findings = _parse_and_normalize(parser, file_content, file_info["filename"])
        return {"findings": findings}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in parse_file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Service error: {str(e)}")


# --- Helper functions ---

async def _fetch_file_and_tool_info(request: ParseRequest):
    """Retrieve file and tool information from dashboard service"""
    async with httpx.AsyncClient() as client:
        file_resp = await client.get(
            f"{DASHBOARD_SERVICE_URL}/api/dashboard/files/{request.file_id}",
            headers={"Authorization": f"Bearer {request.auth_token}"},
            timeout=30.0
        )
        if file_resp.status_code != 200:
            logger.error(f"Failed to get file info: {file_resp.status_code}")
            raise HTTPException(status_code=404, detail="File not found")
        file_info = file_resp.json()
        logger.info(f"Retrieved file info: {file_info['filename']}")

        tool_resp = await client.get(
            f"{DASHBOARD_SERVICE_URL}/api/dashboard/tools/{request.tool_id}",
            headers={"Authorization": f"Bearer {request.auth_token}"},
            timeout=30.0
        )
        if tool_resp.status_code != 200:
            logger.error(f"Failed to get tool info: {tool_resp.status_code}")
            raise HTTPException(status_code=404, detail="Tool not found")
        tool_info = tool_resp.json()
        logger.info(f"Retrieved tool info: {tool_info['name']} - {tool_info['type']}")

    return file_info, tool_info


async def _read_file_content(file_info: dict):
    """Read the file content from disk"""
    if "file_path" not in file_info:
        logger.error("No file_path found in file_info")
        raise HTTPException(status_code=404, detail="File content not found")

    try:
        async with aiofiles.open(f"../backend/{file_info['file_path']}", "r", encoding='utf-8') as f:
            content = await f.read()
        logger.info(f"Retrieved file content: {len(content)} characters")
        return content
    except Exception as e:
        logger.error(f"Failed to read file: {e}")
        raise HTTPException(status_code=404, detail="File content not found")


def _initialize_parser(tool_info: dict):
    """Select the correct parser based on tool type"""
    tool_type = tool_info["type"].lower()
    tool_name = tool_info["name"].lower()

    if tool_type == "vulnerability scanner" and "nessus" in tool_name:
        return nessus.NessusParser()
    if tool_type == "firewall" and "cisco" in tool_name:
        return cisco_asa.CiscoASAParser()
    if tool_type == "antivirus" and "kaspersky" in tool_name:
        return KasperskyAV.KasperskyAVParser()

    logger.warning(f"Unsupported tool: {tool_info['type']} - {tool_info['name']}")
    raise HTTPException(
        status_code=400,
        detail=f"Tool '{tool_info['name']}' of type '{tool_info['type']}' is not supported"
    )


def _parse_and_normalize(parser, file_content: str, filename: str):
    """Parse file content and normalize findings"""
    try:
        findings = parser.parse_report(file_content, filename)
    except ValueError as e:
        _handle_parser_value_error(e)
    except Exception as e:
        logger.error(f"Unexpected error parsing report: {str(e)}")
        raise HTTPException(status_code=500, detail="Unexpected error parsing report")

    if not isinstance(findings, list):
        logger.error("Parser returned non-list result")
        raise HTTPException(status_code=500, detail="Invalid response from parser")

    if len(findings) == 0:
        logger.info("No findings found in the report")
        return []

    normalizer = Normalizer()
    normalized_findings = []
    errors = 0
    for i, f in enumerate(findings):
        try:
            normalized_findings.append({
                "raw_finding": f,
                "normalized_finding": normalizer.normalize(f)
            })
        except Exception as e:
            errors += 1
            logger.warning(f"Failed to normalize finding {i+1}: {e}")

    if errors > 0:
        logger.warning(f"Failed to normalize {errors} out of {len(findings)} findings")
    return normalized_findings


def _handle_parser_value_error(e: ValueError):
    msg = str(e)
    logger.error(f"Format validation error: {msg}")

    if "does not appear to be a valid Nessus v2 report" in msg:
        detail = "The uploaded file is not a valid Nessus report."
    elif "does not appear to be a valid Kaspersky AV log" in msg:
        detail = "The uploaded file is not a valid Kaspersky AV log."
    elif "does not have valid Nessus report structure" in msg:
        detail = "Invalid Nessus report structure."
    elif "does not have valid Kaspersky AV log structure" in msg:
        detail = "Invalid Kaspersky AV log structure."
    elif "Invalid XML format" in msg:
        detail = "The uploaded file contains invalid XML."
    else:
        detail = msg

    raise HTTPException(status_code=400, detail=detail)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)