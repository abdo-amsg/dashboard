import re
import json
from typing import Dict, List, Optional, Any, Generator
from dataclasses import dataclass, asdict
from datetime import datetime

import logging
from core.logging import setup_logger
logger = setup_logger(__name__, level=logging.INFO)

@dataclass
class KasperskyAVFinding:
    """Data class for Kaspersky AV findings"""
    # CHAMPS SPÉCIFIQUES À KASPERSKY (comme NessusFinding fait pour Nessus)
    event_time: Optional[str] = None
    ksc_host: Optional[str] = None
    kes_version: Optional[str] = None
    hostname: Optional[str] = None
    file_sha256: Optional[str] = None
    file_full_path: Optional[str] = None
    app_name: Optional[str] = None
    user_display_name: Optional[str] = None
    administrative_domain: Optional[str] = None
    process_pid: Optional[int] = None
    log_type: Optional[str] = None
    detection_technology: Optional[str] = None
    event_description: Optional[str] = None
    host_display_name: Optional[str] = None
    ip_source: Optional[str] = None
    group_name: Optional[str] = None
    engine_id: Optional[str] = None
    detection_method: Optional[str] = None
    ksc_fqdn: Optional[str] = None
    action: Optional[str] = None
    malware_type: Optional[str] = None
    attack_type: Optional[str] = None
    vulnerability_name: Optional[str] = None
    reason: Optional[str] = None
    file_md5: Optional[str] = None
    event_type: Optional[str] = None
    product_event_type: Optional[str] = None
    summary: Optional[str] = None
    category_details: Optional[List[str]] = None
    labels: Optional[Dict[str, str]] = None
    vulnerability_description: Optional[str] = None
    
    # CHAMPS SUPPLÉMENTAIRES (pour compatibilité avec votre logique existante)
    host_fqdn: Optional[str] = None
    threat_name: Optional[str] = None
    rule_name: Optional[str] = None
    action_taken: Optional[str] = None
    description: Optional[str] = None
    http_method: Optional[str] = None
    http_user_agent: Optional[str] = None
    referral_url: Optional[str] = None
    target_url: Optional[str] = None
    application_protocol: Optional[str] = None
    
    def __post_init__(self):
        if self.category_details is None:
            self.category_details = []
        if self.labels is None:
            self.labels = {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary, excluding None values"""
        result = {}
        for key, value in asdict(self).items():
            if value is not None:
                if isinstance(value, list) and len(value) == 0:
                    continue
                if isinstance(value, dict) and len(value) == 0:
                    continue
                result[key] = value
        return result

class KasperskyAVParser:
    """Kaspersky AV log parser with dual format support"""
    
    # Action mapping
    ACTION_MAP = {
        "Allowed": "ALLOW",
        "Detected": "DETECT",
        "blocked": "BLOCK",
        "allowed": "ALLOW"
    }
    
    # HTTP methods for network validation
    HTTP_METHODS = {
        "GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", 
        "PATCH", "CONNECT", "TRACE"
    }
    
    def __init__(self, max_findings: Optional[int] = None):
        """
        Initialize parser.
        
        Args:
            max_findings: Maximum number of findings to return (for large logs)
        """
        self.max_findings = max_findings
        self.findings_count = 0
    
    def check_kaspersky_av_format(self, log_content: str) -> bool:
        """
        Enhanced format detection for both simple and SYSLOG formats
        """
        # Kaspersky markers (universal)
        kaspersky_markers = [
            "KES|", "FROM_KSC_HOST", "INFECTED_HOST", 
            "GNRL_EV_", "File Threat Protection",
            "etdn", "tdn", "event@"
        ]
        
        marker_count = sum(1 for marker in kaspersky_markers if marker in log_content)
        
        # Format-specific checks
        has_timestamp = bool(re.search(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}', log_content))
        has_kav_fields = any(field in log_content for field in ["p1", "p2", "p5", "p7", "et", "hdn", "hip"])
        has_syslog = '[event@' in log_content and ']' in log_content
        has_simple_kv = any(f"{field}=" in log_content for field in ["TIMESTAMP", "threat_action_taken"])
        
        # Must have markers + format evidence
        is_kaspersky = marker_count >= 2 and (has_timestamp or has_kav_fields or has_syslog or has_simple_kv)
        
        logger.info(f"Kaspersky format check: {marker_count} markers, SYSLOG: {has_syslog}, Valid: {is_kaspersky}")
        return is_kaspersky
    
    def validate_log_structure(self, log_content: str) -> bool:
        """
        Validate that the log has the expected Kaspersky AV structure.
        """
        lines = log_content.strip().split('\n')
        
        if not lines:
            logger.warning("Empty log content - not a valid Kaspersky AV log")
            return False
        
        # Check for valid log entries
        valid_lines = 0
        for line in lines[:10]:
            line = line.strip()
            if line and (
                '=' in line or 
                'TIMESTAMP' in line or 
                'et=' in line or
                '[event@' in line or
                'Type:' in line or
                'FROM_KSC_HOST:' in line
            ):
                valid_lines += 1
        
        if valid_lines == 0:
            logger.warning("No valid log entries found - not a valid Kaspersky AV log")
            return False
        
        logger.info(f"Valid Kaspersky AV structure: {valid_lines} valid lines found")
        return True
    
    def parse_report(self, file_content: str, filename: str) -> List[Dict[str, Any]]:
        """
        Parse a Kaspersky AV log file and return findings.
        """
        try:
            # First, check if this is a Kaspersky AV format file
            if not self.check_kaspersky_av_format(file_content):
                raise ValueError(
                    f"File '{filename}' does not appear to be a valid Kaspersky AV log. "
                    "Please ensure you're uploading a Kaspersky AV log file."
                )
            
            # Validate log structure
            if not self.validate_log_structure(file_content):
                raise ValueError(
                    f"File '{filename}' does not have valid Kaspersky AV log structure. "
                    "Please check that this is a properly formatted Kaspersky AV log file."
                )
            
            # Parse findings
            findings = list(self._parse_findings(file_content))
            
            if not findings:
                logger.warning(f"No findings extracted from {filename}")
                return []
            
            logger.info(f"Successfully parsed {len(findings)} findings from {filename}")
            return findings
            
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error parsing {filename}: {str(e)}")
            raise ValueError(f"Error parsing Kaspersky AV file '{filename}': {str(e)}")
    
    def _parse_findings(self, log_content: str) -> Generator[Dict[str, Any], None, None]:
        """Generate findings from the log content"""
        lines = log_content.strip().split('\n')
        
        for line_num, line in enumerate(lines, 1):
            try:
                # Check if we've reached the max findings limit
                if self.max_findings and self.findings_count >= self.max_findings:
                    logger.warning(f"Reached maximum findings limit: {self.max_findings}")
                    return
                
                # Skip empty lines and comments
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                
                # Parse the log line
                finding = self._parse_log_line(line, line_num)
                if finding:
                    self.findings_count += 1
                    yield finding.to_dict()
                    
            except Exception as e:
                logger.warning(f"Error parsing line {line_num}: {str(e)}")
                continue
    
    def _parse_log_line(self, line: str, line_num: int) -> Optional[KasperskyAVFinding]:
        """Parse a single log line into a KasperskyAVFinding"""
        try:
            # Initialize finding
            finding = KasperskyAVFinding()
            
            # Parse key-value pairs and structured data
            parsed_fields = self._extract_fields_from_line(line)
            
            if not parsed_fields:
                return None
            
            # Apply field mapping
            self._apply_field_mapping(finding, parsed_fields)
            
            # Set metadata fields
            finding.event_type = self._determine_event_type(finding)
            
            return finding
            
        except Exception as e:
            logger.warning(f"Error parsing line {line_num}: {str(e)}")
            return None
    
    def _extract_fields_from_line(self, line: str) -> Dict[str, str]:
        """Extract fields from a log line - Auto-detect format and parse accordingly"""
        fields = {}
        
        # AUTO-DETECTION: Quel format ?
        is_syslog = '[event@' in line and ']' in line
        
        if is_syslog:
            # FORMAT SYSLOG CEF - Parser spécialisé
            fields.update(self._parse_syslog_format(line))
        else:
            # FORMAT SIMPLE key=value - Parser existant
            fields.update(self._parse_simple_format(line))
        
        return fields
    
    def _parse_simple_format(self, line: str) -> Dict[str, str]:
        """Parse simple key=value format"""
        fields = {}
        
        # 1. Key=Value parsing
        kv_pattern = r'(\w+)=([^=]*?)(?=\s+[A-Za-z][A-Za-z0-9_]*\s*=|\s*$)'
        kv_matches = re.findall(kv_pattern, line)
        for key, value in kv_matches:
            fields[key] = value.strip().strip('"\'')
        
        # 2. JSON parsing in kv_data fields
        json_pattern = r'kv_data[12]=(\{[^}]*(?:\{[^}]*\}[^}]*)*\})'
        json_matches = re.findall(json_pattern, line)
        for json_str in json_matches:
            try:
                json_data = json.loads(json_str)
                for k, v in json_data.items():
                    fields[f"kv_{k}"] = str(v)
            except json.JSONDecodeError:
                continue
        
        # 3. Timestamp extraction
        timestamp_pattern = r'TIMESTAMP=([^\s]+)'
        timestamp_match = re.search(timestamp_pattern, line)
        if timestamp_match:
            fields['timestamp'] = timestamp_match.group(1)
        
        return fields
    
    def _parse_syslog_format(self, line: str) -> Dict[str, str]:
        """Parse SYSLOG CEF format selon votre spécification"""
        fields = {}
        
        # 1. En-tête SYSLOG - extraire FROM_KSC_HOST, KES_VERSION, TIMESTAMP, INFECTED_HOST
        header_patterns = {
            'FROM_KSC_HOST': r"FROM_KSC_HOST:\s*['\"]?([^'\"]+)['\"]?",
            'KES_VERSION': r"KES_VERSION:\s*['\"]?([^'\"]+)['\"]?",
            'TIMESTAMP': r"TIMESTAMP:\s*['\"]?([^'\"]+)['\"]?",
            'INFECTED_HOST': r"INFECTED_HOST:\s*['\"]?([^'\"]+)['\"]?"
        }
        
        for key, pattern in header_patterns.items():
            match = re.search(pattern, line)
            if match:
                fields[key.lower()] = match.group(1)
                if key == 'TIMESTAMP':
                    fields['timestamp'] = match.group(1)
        
        # 2. STRUCTURED-DATA [event@23668 p1="..." p2="..." ...]
        struct_pattern = r'\[event@\d+\s+([^\]]+)\]'
        struct_match = re.search(struct_pattern, line)
        if struct_match:
            struct_data = struct_match.group(1)
            # Extract key="value" pairs with proper handling of complex JSON
            kv_pattern = r'(\w+)="([^"]*(?:\\.[^"]*)*)"'
            for key, value in re.findall(kv_pattern, struct_data):
                # Handle escaped characters
                value = value.replace('\\"', '"').replace('\\\\', '\\')
                fields[key] = value
                
                # Special handling for p9 JSON
                if key == 'p9' and value.startswith('{'):
                    try:
                        json_data = json.loads(value)
                        for k, v in json_data.items():
                            fields[f"p9_{k}"] = str(v)
                    except json.JSONDecodeError:
                        continue
        
        # 3. Multi-line content après structured data
        if '\\r\\n' in line:
            content_section = line.split(']', 1)[-1]  # Tout après le ]
            for part in content_section.split('\\r\\n'):
                part = part.strip()
                if ':' in part:
                    try:
                        key, value = part.split(':', 1)
                        clean_key = key.strip().replace(' ', '_').replace('(', '').replace(')', '')
                        clean_value = value.strip()
                        fields[clean_key] = clean_value
                        
                        # Mappings spéciaux
                        if clean_key == 'Result_description':
                            fields['Result'] = clean_value
                        elif clean_key == 'User' and '(' in clean_value:
                            # "DOMAIN\\user (Initiator)" -> "DOMAIN\\user"
                            fields['User'] = clean_value.split('(')[0].strip()
                            
                    except ValueError:
                        continue
        
        # 4. ISO timestamp extraction (fallback)
        if 'timestamp' not in fields:
            iso_match = re.search(r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)', line)
            if iso_match:
                fields['timestamp'] = iso_match.group(1)
        
        return fields
    
    def _apply_field_mapping(self, finding: KasperskyAVFinding, fields: Dict[str, str]):
        """Apply field mapping to extract Kaspersky-specific data"""
        
        # EXTRACTION DES CHAMPS KASPERSKY SPÉCIFIQUES
        
        # 1. event_time ← TIMESTAMP
        if 'timestamp' in fields:
            finding.event_time = fields['timestamp']
        elif 'TIMESTAMP' in fields:
            finding.event_time = fields['TIMESTAMP']
        
        # 2. Kaspersky server info
        finding.ksc_host = fields.get('from_ksc_host')
        finding.kes_version = fields.get('kes_version')
        
        # 3. Host information
        finding.hostname = (fields.get('hdn') or 
                           fields.get('host_name') or 
                           fields.get('infected_host') or
                           fields.get('INFECTED_HOST'))
        finding.host_display_name = fields.get('hdn')
        finding.ip_source = fields.get('hip')
        finding.group_name = fields.get('gn')
        
        # 4. File information
        finding.file_sha256 = fields.get('p1')
        finding.file_full_path = (fields.get('p2') or 
                                 fields.get('Object'))
        finding.app_name = (fields.get('p5') or 
                           fields.get('Name'))
        
        # 5. User information
        if 'User' in fields:
            user = fields['User']
            if '\\' in user:
                domain, username = user.split('\\', 1)
                finding.administrative_domain = domain
                finding.user_display_name = username
            else:
                finding.user_display_name = user
        elif 'p7' in fields:
            p7_user = fields['p7']
            if '\\' in p7_user:
                domain, username = p7_user.split('\\', 1)
                finding.administrative_domain = domain
                finding.user_display_name = username
            else:
                finding.user_display_name = p7_user
        
        # 6. Process information
        if 'p8' in fields:
            try:
                finding.process_pid = int(fields['p8'])
            except ValueError:
                pass
        
        # 7. Event metadata
        finding.log_type = fields.get('et')
        finding.detection_technology = fields.get('tdn')
        finding.event_description = fields.get('etdn')
        finding.engine_id = fields.get('engine')
        finding.detection_method = fields.get('method')
        finding.ksc_fqdn = fields.get('kscfqdn')
        finding.product_event_type = fields.get('et')
        
        # 8. Threat information  
        finding.malware_type = fields.get('Type')
        finding.attack_type = (fields.get('Type') or 
                              fields.get('p5') or
                              fields.get('Name'))
        finding.vulnerability_name = (fields.get('Name') or 
                                     fields.get('p5') or
                                     fields.get('Type'))
        
        # 9. Action and results
        if 'Result' in fields:
            result = fields['Result']
            finding.action = result
            if result == 'Detected':
                finding.action = 'DETECT'
            elif result == 'Allowed':
                finding.action = 'ALLOW'
        elif 'threat_action_taken' in fields:
            action = fields['threat_action_taken'].lower()
            if action == 'blocked':
                finding.action = 'BLOCK'
            elif action == 'allowed':
                finding.action = 'ALLOW'
        
        # 10. Hashes
        if 'SHA256' in fields:
            finding.file_sha256 = fields['SHA256'].lower()
        elif 'p1' in fields and len(fields['p1']) == 64:
            finding.file_sha256 = fields['p1'].lower()
        
        if 'MD5' in fields:
            finding.file_md5 = fields['MD5'].lower()
        elif 'p9_md5' in fields:
            finding.file_md5 = fields['p9_md5'].lower()
        
        # 11. Additional details
        finding.summary = (fields.get('summary') or 
                          fields.get('Reason'))
        finding.vulnerability_description = (fields.get('etdn') or 
                                           fields.get('tdn'))
        finding.reason = fields.get('Reason')
        
        # 12. Category and labels
        if fields.get('et'):
            finding.category_details = [fields['et']]
        
        labels = {}
        if fields.get('gn'):
            labels['GN'] = fields['gn']
        if fields.get('kscfqdn'):
            labels['kscfqdn'] = fields['kscfqdn']
        if fields.get('engine'):
            labels['engine'] = fields['engine']
        if fields.get('method'):
            labels['detection_method'] = fields['method']
        finding.labels = labels
        
        # 13. Network information (for simple format)
        if 'method' in fields and fields['method'] in self.HTTP_METHODS:
            finding.http_method = fields['method']
        
        if 'URL' in fields:
            finding.referral_url = fields['URL']
        
        if 'protocol' in fields and 'http' in fields['protocol'].lower():
            finding.application_protocol = 'HTTP'
    
    def _determine_event_type(self, finding: KasperskyAVFinding) -> str:
        """Determine the event type based on UDM rules"""
        
        # Check for SCAN_VULN_NETWORK
        if finding.file_full_path:
            return "SCAN_VULN_NETWORK"
        
        # Check for STATUS_UNCATEGORIZED  
        if finding.hostname or finding.ip_source:
            return "STATUS_UNCATEGORIZED"
        
        # Default to GENERIC_EVENT
        return "GENERIC_EVENT"