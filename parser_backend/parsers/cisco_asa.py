import re
from typing import Dict, List, Optional, Any, Generator
from dataclasses import dataclass, asdict
from datetime import datetime
import logging
from core.logging import setup_logger

logger = setup_logger(__name__, level=logging.INFO)

@dataclass
class CiscoASAFinding:
    """Data class for Cisco ASA findings with validation"""
    host_fqdn: Optional[str] = None
    ip_source: Optional[str] = None
    ip_destination: Optional[str] = None
    event_time: Optional[str] = None
    action: Optional[str] = None
    policy: Optional[str] = None
    attack_type: Optional[str] = None
    severity: str = "Info"
    log_type: Optional[str] = None
    app_name: Optional[str] = None
    country_code: Optional[str] = None
    bandwidth: Optional[int] = None
    port_source: Optional[int] = None
    port_destination: Optional[int] = None
    protocol: Optional[str] = None
    interface_source: Optional[str] = None
    interface_destination: Optional[str] = None
    message_id: Optional[str] = None
    message_text: Optional[str] = None
    user: Optional[str] = None
    connection_id: Optional[str] = None
    bytes_sent: Optional[int] = None
    bytes_received: Optional[int] = None
    duration: Optional[int] = None
    reason: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary, excluding None values"""
        result = {}
        for key, value in asdict(self).items():
            if value is not None:
                result[key] = value
        return result

class CiscoASAParser:
    """Enhanced Cisco ASA log parser focusing on firewall actions"""
    
    # Message IDs that contain firewall action information
    ACTION_MESSAGE_IDS = {
        # Connection events
        '106001': 'connection_denied_inbound',      # Inbound TCP connection denied
        '106006': 'connection_denied_outbound',     # Outbound UDP connection denied  
        '106007': 'connection_denied_outbound',     # Outbound connection denied
        '106010': 'connection_denied_access_list',  # Deny inbound protocol src [interface_name:src_ip/src_port] dst [interface_name:dst_ip/dst_port] by access-group "access_list_name"
        '106014': 'connection_denied_access_list',  # Deny inbound icmp src interface_name:src_ip dst interface_name:dst_ip (type dec, code dec) by access-group "access_list_name"
        '106015': 'connection_denied_access_list',  # Deny TCP (no connection) from src_ip/src_port to dst_ip/dst_port flags tcp_flags on interface interface_name
        '106021': 'connection_denied_access_list',  # Deny protocol reverse path check from src_ip to dst_ip on interface interface_name
        '106100': 'connection_denied_access_list',  # access-list acl_ID denied protocol interface_name/src_ip(src_port) -> interface_name/dst_ip(dst_port) hit-cnt number first hit [hh:mm:ss UTC Mon dd yyyy]
        
        # Connection establishment and teardown
        '302013': 'connection_built',               # Built outbound TCP connection
        '302014': 'connection_built',               # Built inbound TCP connection  
        '302015': 'connection_built',               # Built UDP connection
        '302016': 'connection_built',               # Built GRE connection
        '302020': 'connection_built',               # Built outbound ICMP connection
        '302021': 'connection_built',               # Built inbound ICMP connection
        
        '302013': 'connection_teardown',            # Teardown TCP connection
        '302014': 'connection_teardown',            # Teardown UDP connection
        '302015': 'connection_teardown',            # Teardown ICMP connection
        
        # Application inspection denies
        '106023': 'application_denied',             # Deny protocol src [interface_name:src_ip/src_port] dst [interface_name:dst_ip/dst_port] by access-group "access_list_name"
        '110002': 'application_denied',             # Packet length protocol exceeded maximum allowed
        
        # NAT/PAT actions
        '305009': 'nat_built',                      # Built dynamic translation
        '305010': 'nat_built',                      # Built static translation
        '305011': 'nat_teardown',                   # Teardown dynamic translation
        '305012': 'nat_teardown',                   # Teardown static translation
        
        # VPN actions
        '113019': 'vpn_denied',                     # Group = group, Username = user, IP = src_ip, Session disconnected. Session Type: type, Duration: duration, Bytes xmt: bytes_out, Bytes rcv: bytes_in, Reason: reason
        '722022': 'vpn_denied',                     # Group <group_name> User <username> IP <ip_address> IPv4 Address <ipv4_addr> IPv6 address <ipv6_addr> assigned to session
        
        # IPS/Threat Detection
        '733100': 'threat_detected',                # [Scanning] drop rate-1 exceeded. Current burst rate is rate-2 per second, max configured rate is rate-3; Current average rate is rate-4 per second, max configured rate is rate-5, Drop for source_IP
        '106016': 'threat_detected',                # DDoS attack detected
        
        # Authentication failures
        '113005': 'auth_failed',                    # AAA user authentication Rejected
        '113012': 'auth_failed',                    # AAA user authentication Successful
        '109001': 'auth_failed',                    # Auth start
        '109002': 'auth_failed',                    # Auth stop
        '109005': 'auth_failed',                    # Authentication succeeded
        '109006': 'auth_failed',                    # Authentication failed
        '109007': 'auth_failed',                    # Authorization permitted
        '109008': 'auth_failed',                    # Authorization denied
        
        # Interface events
        '103004': 'interface_down',                 # (Primary) Other firewall reports this firewall failed
        '103005': 'interface_up',                   # (Primary) Other firewall reports this firewall up
        '411001': 'interface_down',                 # Line protocol on interface interface_name changed state to down
        '411002': 'interface_up',                   # Line protocol on interface interface_name changed state to up
    }
    
    # Severity levels mapping
    SEVERITY_LEVELS = {
        '0': 'Critical',    # Emergency
        '1': 'High',        # Alert  
        '2': 'High',        # Critical
        '3': 'Medium',      # Error
        '4': 'Medium',      # Warning
        '5': 'Low',         # Notice
        '6': 'Info',        # Informational
        '7': 'Info'         # Debug
    }
    
    # Action mapping based on message content and IDs
    ACTION_MAPPING = {
        'deny': 'BLOCKED',
        'denied': 'BLOCKED', 
        'drop': 'BLOCKED',
        'reject': 'BLOCKED',
        'block': 'BLOCKED',
        'built': 'ALLOWED',
        'permit': 'ALLOWED',
        'allow': 'ALLOWED',
        'teardown': 'CLOSED',
        'disconnect': 'CLOSED',
        'timeout': 'TIMEOUT',
        'failed': 'FAILED',
        'succeeded': 'SUCCESS'
    }
    
    def __init__(self, max_findings: Optional[int] = None):
        """
        Initialize parser.
        
        Args:
            max_findings: Maximum number of findings to return (for large log files)
        """
        self.max_findings = max_findings
        self.findings_count = 0
        
        # Compile regex patterns for better performance
        self.patterns = {
            # Standard syslog format: <timestamp> <hostname> %ASA-<severity>-<message_id>: <message>
            'standard': re.compile(
                r'(?P<timestamp>\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+'
                r'(?P<hostname>\S+)\s+'
                r'%ASA-(?P<severity>\d)-(?P<message_id>\d+):\s*'
                r'(?P<message>.*)'
            ),
            
            # Extended format with milliseconds
            'extended': re.compile(
                r'(?P<timestamp>\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\.\d{3})\s+'
                r'(?P<hostname>\S+)\s+'
                r'%ASA-(?P<severity>\d)-(?P<message_id>\d+):\s*'
                r'(?P<message>.*)'
            ),
            
            # ISO timestamp format
            'iso': re.compile(
                r'(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?)\s+'
                r'(?P<hostname>\S+)\s+'
                r'%ASA-(?P<severity>\d)-(?P<message_id>\d+):\s*'
                r'(?P<message>.*)'
            ),
            
            # IP address extraction
            'ip_address': re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b'),
            
            # Port extraction  
            'port': re.compile(r'/(\d+)'),
            
            # Interface extraction
            'interface': re.compile(r'interface\s+(\S+)', re.IGNORECASE),
            
            # User extraction
            'user': re.compile(r'user\s+(\S+)', re.IGNORECASE),
            
            # Connection ID extraction
            'connection_id': re.compile(r'connection\s+(\d+)', re.IGNORECASE),
            
            # Bytes extraction
            'bytes': re.compile(r'(\d+)\s+bytes?', re.IGNORECASE),
            
            # Duration extraction  
            'duration': re.compile(r'duration\s+(\d+:\d+:\d+|\d+)', re.IGNORECASE),
            
            # Access list extraction
            'access_list': re.compile(r'access-group\s+"([^"]+)"', re.IGNORECASE),
            
            # Protocol extraction
            'protocol': re.compile(r'\b(tcp|udp|icmp|gre|esp|ah)\b', re.IGNORECASE),
        }

    def check_cisco_asa_format(self, log_content: str) -> bool:
        """
        Check if the log content is in Cisco ASA format.
        
        Args:
            log_content: The log content to check
            
        Returns:
            bool: True if the content appears to be Cisco ASA logs
        """
        # Check for Cisco ASA specific markers
        asa_markers = [
            '%ASA-',
            'Cisco',
            'cisco',
            'PIX',  # Older ASA devices
            'FWSM'  # Firewall Services Module
        ]
        
        # Content should contain ASA-specific patterns
        has_asa_pattern = any(marker in log_content for marker in asa_markers)
        
        # Check for common ASA message IDs
        has_message_ids = any(msg_id in log_content for msg_id in self.ACTION_MESSAGE_IDS.keys())
        
        # Look for common ASA log structure
        lines = log_content.split('\n')[:10]  # Check first 10 lines
        has_log_structure = any(
            any(pattern.match(line.strip()) for pattern in self.patterns.values() if hasattr(pattern, 'match'))
            for line in lines if line.strip()
        )
        
        logger.info(f"ASA format check: markers={has_asa_pattern}, message_ids={has_message_ids}, structure={has_log_structure}")
        return has_asa_pattern and (has_message_ids or has_log_structure)

    def parse_report(self, file_content: str, filename: str) -> List[Dict[str, Any]]:
        """
        Parse a Cisco ASA log file and return findings.
        
        Args:
            file_content: The content of the ASA log file
            filename: The name of the file being parsed
            
        Returns:
            List of findings dictionaries
            
        Raises:
            ValueError: If the file is not a valid Cisco ASA log
        """
        try:
            # First, check if this is a Cisco ASA log file
            if not self.check_cisco_asa_format(file_content):
                raise ValueError(
                    f"File '{filename}' does not appear to be a valid Cisco ASA log file. "
                    "Please ensure you're uploading Cisco ASA syslog output."
                )
            
            # Parse findings
            findings = list(self._parse_findings(file_content))
            
            if not findings:
                logger.warning(f"No actionable findings extracted from {filename}")
                return []
            
            logger.info(f"Successfully parsed {len(findings)} findings from {filename}")
            return findings
            
        except ValueError:
            # Re-raise validation errors
            raise
        except Exception as e:
            logger.error(f"Unexpected error parsing {filename}: {str(e)}")
            raise ValueError(f"Error parsing Cisco ASA log file '{filename}': {str(e)}")

    def _parse_findings(self, log_content: str) -> Generator[Dict[str, Any], None, None]:
        """Generate findings from the log content"""
        lines = log_content.strip().split('\n')
        
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if not line:
                continue
                
            # Check if we've reached the max findings limit
            if self.max_findings and self.findings_count >= self.max_findings:
                logger.warning(f"Reached maximum findings limit: {self.max_findings}")
                return
            
            # Try to parse the line with different patterns
            parsed_log = self._parse_log_line(line)
            if not parsed_log:
                continue
                
            # Only process logs with action-relevant message IDs
            # message_id = parsed_log.get('message_id')
            # if message_id not in self.ACTION_MESSAGE_IDS:
            #     continue
                
            finding = self._create_finding_from_log(parsed_log, line_num)
            if finding:
                self.findings_count += 1
                yield finding.to_dict()

    def _parse_log_line(self, line: str) -> Optional[Dict[str, Any]]:
        """Parse a single log line and extract structured information"""
        
        # Try different regex patterns
        for pattern_name, pattern in self.patterns.items():
            if pattern_name in ['ip_address', 'port', 'interface', 'user', 'connection_id', 'bytes', 'duration', 'access_list', 'protocol']:
                continue  # Skip extraction patterns
                
            match = pattern.match(line)
            if match:
                return {
                    'timestamp': match.group('timestamp'),
                    'hostname': match.group('hostname'),
                    'severity': match.group('severity'),
                    'message_id': match.group('message_id'),
                    'message': match.group('message'),
                    'raw_line': line
                }
        
        return None

    def _create_finding_from_log(self, parsed_log: Dict[str, Any], line_num: int) -> Optional[CiscoASAFinding]:
        """Create a finding from a parsed log entry"""
        try:
            message = parsed_log['message']
            message_id = parsed_log['message_id']
            
            # Determine action based on message ID and content
            action = self._determine_action(message_id, message)
            
            # Determine log type based on message ID and content
            log_type = self._determine_log_type(message_id, message)

            # Determine app name based on message ID and content
            app_name = self._determine_app_name(message_id, message)
            
            # Extract IP addresses
            ip_addresses = self.patterns['ip_address'].findall(message)
            src_ip = ip_addresses[0] if len(ip_addresses) > 0 else None
            dst_ip = ip_addresses[1] if len(ip_addresses) > 1 else None
            
            # Extract ports
            ports = self.patterns['port'].findall(message)
            src_port = int(ports[0]) if len(ports) > 0 else None
            dst_port = int(ports[1]) if len(ports) > 1 else None
            
            # Extract protocol
            protocol_match = self.patterns['protocol'].search(message)
            protocol = protocol_match.group(1).upper() if protocol_match else None
            
            # Extract interfaces
            interface_matches = self.patterns['interface'].findall(message)
            src_interface = interface_matches[0] if len(interface_matches) > 0 else None
            dst_interface = interface_matches[1] if len(interface_matches) > 1 else None
            
            # Extract user
            user_match = self.patterns['user'].search(message)
            user = user_match.group(1) if user_match else None
            
            # Extract connection ID
            conn_id_match = self.patterns['connection_id'].search(message)
            connection_id = conn_id_match.group(1) if conn_id_match else None
            
            # Extract bytes
            bytes_matches = self.patterns['bytes'].findall(message)
            bytes_sent = int(bytes_matches[0]) if len(bytes_matches) > 0 else None
            bytes_received = int(bytes_matches[1]) if len(bytes_matches) > 1 else None
            
            # Extract duration
            duration_match = self.patterns['duration'].search(message)
            duration = self._parse_duration(duration_match.group(1)) if duration_match else None
            
            # Extract access list (policy)
            acl_match = self.patterns['access_list'].search(message)
            policy = acl_match.group(1) if acl_match else None
            
            # Determine attack type based on message ID and content
            attack_type = self._determine_attack_type(message_id, message)
            
            # Parse timestamp
            event_time = self._parse_timestamp(parsed_log['timestamp'])
            
            # Map severity
            severity = self.SEVERITY_LEVELS.get(parsed_log['severity'], 'Info')
            
            # Calculate bandwidth if bytes and duration are available
            bandwidth = None
            if bytes_sent and bytes_received and duration:
                total_bytes = bytes_sent + bytes_received
                bandwidth = int((total_bytes * 8) / duration)  # bits per second
            
            # Create finding object
            finding = CiscoASAFinding(
                host_fqdn=parsed_log['hostname'],
                ip_source=src_ip,
                ip_destination=dst_ip,
                event_time=event_time,
                action=action,
                policy=policy,
                attack_type=attack_type,
                severity=severity,
                log_type=log_type,
                app_name=app_name,
                bandwidth=bandwidth,
                port_source=src_port,
                port_destination=dst_port,
                protocol=protocol,
                interface_source=src_interface,
                interface_destination=dst_interface,
                message_id=message_id,
                message_text=message,
                user=user,
                connection_id=connection_id,
                bytes_sent=bytes_sent,
                bytes_received=bytes_received,
                duration=duration,
                reason=self._extract_reason(message)
            )
            
            return finding
            
        except Exception as e:
            logger.error(f"Error creating finding from log line {line_num}: {str(e)}")
            return None

    def _determine_action(self, message_id: str, message: str) -> str:
        """Determine the action taken by the firewall"""
        
        # First check message ID mapping
        action_type = self.ACTION_MESSAGE_IDS.get(message_id)
        if action_type:
            if 'denied' in action_type or 'blocked' in action_type:
                return 'BLOCKED'
            elif 'built' in action_type or 'allowed' in action_type:
                return 'ALLOWED'
            elif 'teardown' in action_type or 'disconnect' in action_type:
                return 'CLOSED'
            elif 'failed' in action_type:
                return 'FAILED'
            elif 'detected' in action_type:
                return 'DETECTED'
        
        # Fall back to content analysis
        message_lower = message.lower()
        for keyword, action in self.ACTION_MAPPING.items():
            if keyword in message_lower:
                return action
        
        return 'UNKNOWN'

    def _determine_log_type(self, message_id: str, message: str) -> str:
        """Determine the log type based on message ID and content"""
        
        # Define message ID ranges and their corresponding log types
        log_type_mapping = {
            # TRAFFIC - Connection and traffic management
            'TRAFFIC': [
                '302013', '302014', '302015', '302016', '302020', '302021',  # Connection built
                '302033', '302034', '302035',  # Connection teardown
                '305009', '305010', '305011', '305012',  # NAT/PAT translations
                '106015',  # TCP no connection
                '110001', '110002', '110003',  # Traffic inspection
                '201008', '201009', '201010', '201011',  # Connection limits
            ],
            
            # THREAT - Security threats and attacks
            'THREAT': [
                '733100', '733101', '733102',  # Scanning attacks
                '106016', '106017', '106018',  # IP spoofing, Land attacks, Port scans
                '400013', '400014', '400015',  # IPS signatures
                '420002', '420003',  # IPS events
                '321001', '321002', '321003',  # UDP flood
                '710003', '710004', '710005',  # Connection limit exceeded
                '106006', '106007',  # Suspected attacks
            ],
            
            # ACCESS - Access control and policy enforcement
            'ACCESS': [
                '106001', '106010', '106014', '106021', '106023',  # Access denies
                '106100',  # Access-list hits
                '304001', '304002',  # URL filtering
                '313001', '313004', '313005',  # NAT rule hits
                '502103',  # User privilege changes
            ],
            
            # AUTHENTICATION - User authentication and authorization
            'AUTHENTICATION': [
                '109001', '109002', '109005', '109006', '109007', '109008',  # Auth events
                '113001', '113002', '113003', '113004', '113005', '113012',  # AAA events
                '502101', '502102', '502103',  # User commands
                '609001', '609002',  # Local user authentication
            ],
            
            # VPN - VPN and remote access
            'VPN': [
                '722022', '722023', '722028', '722029', '722030', '722031',  # SSL VPN
                '113019', '113039',  # VPN session events
                '724001', '724002', '724003', '724004',  # WebVPN
                '734001', '734002',  # DAP policy
                '746001', '746010', '746011',  # IPSec VPN
            ],
            
            # SYSTEM - System events and status
            'SYSTEM': [
                '103001', '103003', '103004', '103005',  # Failover events
                '199001', '199002', '199003', '199005',  # Reload events
                '411001', '411002', '411003', '411004',  # Interface events
                '507001', '507002', '507003',  # Terminating processes
                '201002', '201003',  # System resources
                '105001', '105003', '105004', '105005', '105043',  # System messages
            ],
            
            # CONFIGURATION - Configuration changes
            'CONFIGURATION': [
                '111001', '111002', '111003', '111004', '111005', '111007', '111008', '111009', '111010',  # Config events
                '502101', '502102', '502103',  # User commands
                '605004', '605005',  # Login/logout events
            ],
            
            # APPLICATION - Application inspection and services
            'APPLICATION': [
                '202001', '202010', '202011',  # NAT events
                '303002', '303007', '303009',  # Application inspection
                '507001', '507002',  # Terminating connections
                '106023',  # Application deny
                '608001', '608002', '608003', '608004',  # SNMP events
            ],
            
            # MONITORING - Health and monitoring
            'MONITORING': [
                '104001', '104002', '104003', '104004',  # Overrun events
                '201001', '201002', '201003',  # Memory/Resource events
                '710001', '710002', '710003',  # Connection events
                '320001', '320002', '320003',  # Interface monitoring
            ]
        }
        
        # Check message ID against mappings
        for log_type, message_ids in log_type_mapping.items():
            if message_id in message_ids:
                return log_type
        
        # Content-based classification if message ID doesn't match
        message_lower = message.lower()
        
        # VPN keywords
        if any(keyword in message_lower for keyword in ['vpn', 'ssl', 'ipsec', 'tunnel', 'webvpn', 'anyconnect']):
            return 'VPN'
        
        # Authentication keywords
        if any(keyword in message_lower for keyword in ['authentication', 'login', 'logout', 'aaa', 'user', 'password']):
            return 'AUTHENTICATION'
        
        # Threat keywords
        if any(keyword in message_lower for keyword in ['attack', 'threat', 'scan', 'flood', 'ddos', 'intrusion', 'malicious']):
            return 'THREAT'
        
        # Traffic keywords
        if any(keyword in message_lower for keyword in ['connection', 'built', 'teardown', 'traffic', 'flow', 'session']):
            return 'TRAFFIC'
        
        # System keywords
        if any(keyword in message_lower for keyword in ['interface', 'failover', 'reload', 'system', 'cpu', 'memory']):
            return 'SYSTEM'
        
        # Configuration keywords
        if any(keyword in message_lower for keyword in ['config', 'command', 'configure', 'set', 'no ', 'enable', 'disable']):
            return 'CONFIGURATION'
        
        # Access control keywords
        if any(keyword in message_lower for keyword in ['access-list', 'access-group', 'deny', 'permit', 'acl']):
            return 'ACCESS'
        
        # Application keywords
        if any(keyword in message_lower for keyword in ['http', 'ftp', 'smtp', 'dns', 'inspection', 'application']):
            return 'APPLICATION'
        
        # Default fallback
        return 'GENERAL'

    def _determine_app_name(self, message_id: str, message: str) -> Optional[str]:
        """Determine the application name based on message content and ID"""
        
        message_lower = message.lower()
        
        # Application-specific message IDs and patterns
        app_patterns = {
            # Web applications
            'HTTP': [
                r'http[s]?://',
                r'url\s+/',
                r'web[- ]?server',
                r'apache',
                r'nginx',
                r'iis'
            ],
            
            # Email services
            'SMTP': [
                r'smtp',
                r'mail[- ]?server',
                r'port\s+25\b',
                r'port\s+587\b',
                r'port\s+465\b',
                r'email'
            ],
            
            'POP3': [
                r'pop3?',
                r'port\s+110\b',
                r'port\s+995\b'
            ],
            
            'IMAP': [
                r'imap',
                r'port\s+143\b',
                r'port\s+993\b'
            ],
            
            # File transfer
            'FTP': [
                r'ftp[s]?',
                r'port\s+21\b',
                r'port\s+990\b',
                r'file transfer'
            ],
            
            'SFTP': [
                r'sftp',
                r'ssh.*file'
            ],
            
            # DNS services
            'DNS': [
                r'dns',
                r'port\s+53\b',
                r'domain.*name',
                r'nslookup',
                r'dig\b'
            ],
            
            # Database services
            'MySQL': [
                r'mysql',
                r'port\s+3306\b'
            ],
            
            'PostgreSQL': [
                r'postgres',
                r'port\s+5432\b'
            ],
            
            'MSSQL': [
                r'mssql',
                r'sql.*server',
                r'port\s+1433\b'
            ],
            
            'Oracle': [
                r'oracle',
                r'port\s+1521\b'
            ],
            
            # Network services
            'SSH': [
                r'ssh',
                r'port\s+22\b',
                r'secure shell'
            ],
            
            'Telnet': [
                r'telnet',
                r'port\s+23\b'
            ],
            
            'SNMP': [
                r'snmp',
                r'port\s+161\b',
                r'port\s+162\b'
            ],
            
            'DHCP': [
                r'dhcp',
                r'port\s+67\b',
                r'port\s+68\b'
            ],
            
            'TFTP': [
                r'tftp',
                r'port\s+69\b'
            ],
            
            # VPN and security
            'IPSec': [
                r'ipsec',
                r'esp\b',
                r'ah\b',
                r'port\s+500\b',
                r'port\s+4500\b'
            ],
            
            'SSL-VPN': [
                r'ssl.*vpn',
                r'anyconnect',
                r'webvpn'
            ],
            
            'PPTP': [
                r'pptp',
                r'port\s+1723\b'
            ],
            
            'L2TP': [
                r'l2tp',
                r'port\s+1701\b'
            ],
            
            # Directory services
            'LDAP': [
                r'ldap[s]?',
                r'port\s+389\b',
                r'port\s+636\b',
                r'active.*directory'
            ],
            
            'Kerberos': [
                r'kerberos',
                r'port\s+88\b'
            ],
            
            # Messaging and collaboration
            'SIP': [
                r'sip\b',
                r'port\s+5060\b',
                r'port\s+5061\b',
                r'voip'
            ],
            
            'RDP': [
                r'rdp',
                r'remote.*desktop',
                r'port\s+3389\b'
            ],
            
            'VNC': [
                r'vnc',
                r'port\s+590[0-9]\b'
            ],
            
            # Monitoring and management
            'NTP': [
                r'ntp',
                r'port\s+123\b',
                r'time.*server'
            ],
            
            'Syslog': [
                r'syslog',
                r'port\s+514\b',
                r'log.*server'
            ],
            
            # Application protocols
            'ICMP': [
                r'icmp',
                r'ping',
                r'echo.*request',
                r'echo.*reply'
            ],
            
            'GRE': [
                r'gre\b',
                r'generic.*routing'
            ],
            
            # Custom applications (extract from URL or service name)
            'Custom-App': []
        }
        
        # Message ID based application detection
        message_id_apps = {
            # Web/HTTP related
            '303007': 'HTTP',
            '304001': 'HTTP',  # URL filtering
            '304002': 'HTTP',
            
            # FTP related
            '303002': 'FTP',
            '303003': 'FTP',
            
            # DNS related
            '313001': 'DNS',
            '313004': 'DNS',
            
            # SNMP related
            '608001': 'SNMP',
            '608002': 'SNMP',
            '608003': 'SNMP',
            '608004': 'SNMP',
            
            # VPN related
            '722022': 'SSL-VPN',
            '722023': 'SSL-VPN',
            '722028': 'SSL-VPN',
            '746001': 'IPSec',
            '746010': 'IPSec',
            '746011': 'IPSec',
            
            # Email related
            '305013': 'SMTP',
            
            # ICMP related
            '302020': 'ICMP',
            '302021': 'ICMP',
        }
        
        # First check message ID mapping
        if message_id in message_id_apps:
            return message_id_apps[message_id]
        
        # Then check content patterns
        for app_name, patterns in app_patterns.items():
            if app_name == 'Custom-App':
                continue
                
            for pattern in patterns:
                if re.search(pattern, message_lower):
                    return app_name
        
        # Extract application from URL if present
        url_match = re.search(r'url\s+([^\s]+)', message_lower)
        if url_match:
            url = url_match.group(1)
            # Extract domain or path for app identification
            if 'admin' in url or 'management' in url:
                return 'Admin-Panel'
            elif 'api' in url:
                return 'API'
            elif 'login' in url or 'auth' in url:
                return 'Authentication-Service'
            elif any(ext in url for ext in ['.php', '.asp', '.jsp']):
                return 'Web-Application'
        
        # Extract application from service names
        service_patterns = [
            r'service\s+(\w+)',
            r'application\s+(\w+)',
            r'server\s+(\w+)',
            r'protocol\s+(\w+)'
        ]
        
        for pattern in service_patterns:
            match = re.search(pattern, message_lower)
            if match:
                service_name = match.group(1).upper()
                # Filter out common words that aren't applications
                if service_name not in ['THE', 'AND', 'FOR', 'WITH', 'FROM', 'NAME', 'TYPE']:
                    return service_name
        
        # Extract application from port-based detection (common ports)
        port_app_mapping = {
            '20': 'FTP-Data',    '21': 'FTP',         '22': 'SSH',
            '23': 'Telnet',      '25': 'SMTP',        '53': 'DNS',
            '67': 'DHCP',        '68': 'DHCP',        '69': 'TFTP',
            '80': 'HTTP',        '88': 'Kerberos',    '110': 'POP3',
            '123': 'NTP',        '143': 'IMAP',       '161': 'SNMP',
            '162': 'SNMP',       '389': 'LDAP',       '443': 'HTTPS',
            '465': 'SMTPS',      '514': 'Syslog',     '587': 'SMTP',
            '636': 'LDAPS',      '993': 'IMAPS',      '995': 'POP3S',
            '1433': 'MSSQL',     '1521': 'Oracle',    '1701': 'L2TP',
            '1723': 'PPTP',      '3306': 'MySQL',     '3389': 'RDP',
            '5060': 'SIP',       '5061': 'SIP-TLS',   '5432': 'PostgreSQL'
        }
        
        # Extract port numbers from message
        port_matches = re.findall(r'/(\d+)\b', message)
        for port in port_matches:
            if port in port_app_mapping:
                return port_app_mapping[port]
        
    def _determine_attack_type(self, message_id: str, message: str) -> Optional[str]:
        """Determine the type of attack or activity"""
        
        message_lower = message.lower()
        
        # DDoS detection
        if any(word in message_lower for word in ['ddos', 'dos', 'flood', 'scanning']):
            return 'DDoS'
        
        # Intrusion attempts
        if any(word in message_lower for word in ['intrusion', 'attack', 'exploit']):
            return 'Intrusion Attempt'
        
        # Authentication related
        if any(word in message_lower for word in ['authentication', 'login', 'auth']):
            return 'Authentication'
        
        # VPN related
        if any(word in message_lower for word in ['vpn', 'tunnel', 'ipsec']):
            return 'VPN Activity'
        
        # Access control
        if any(word in message_lower for word in ['access-group', 'access-list', 'acl']):
            return 'Access Control'
        
        # Protocol specific
        if 'icmp' in message_lower:
            return 'ICMP Activity'
        elif any(word in message_lower for word in ['tcp', 'connection']):
            return 'TCP Connection'
        elif 'udp' in message_lower:
            return 'UDP Traffic'
        
        return None

    def _parse_timestamp(self, timestamp_str: str) -> Optional[str]:
        """Parse timestamp string to ISO format"""
        
        # Try different timestamp formats
        formats = [
            "%b %d %H:%M:%S",           # Mar 15 14:30:25
            "%b %d %H:%M:%S.%f",        # Mar 15 14:30:25.123
            "%Y-%m-%dT%H:%M:%S",        # 2025-03-15T14:30:25
            "%Y-%m-%dT%H:%M:%S.%fZ",    # 2025-03-15T14:30:25.123Z
        ]
        
        for fmt in formats:
            try:
                if fmt.startswith("%b"):
                    # Add current year for syslog format
                    current_year = datetime.now().year
                    timestamp_with_year = f"{current_year} {timestamp_str}"
                    dt = datetime.strptime(timestamp_with_year, f"%Y {fmt}")
                else:
                    dt = datetime.strptime(timestamp_str, fmt)
                return dt.isoformat()
            except ValueError:
                continue
        
        logger.warning(f"Could not parse timestamp: {timestamp_str}")
        return None

    def _parse_duration(self, duration_str: str) -> Optional[int]:
        """Parse duration string to seconds"""
        
        if ':' in duration_str:
            # Format: HH:MM:SS
            try:
                parts = duration_str.split(':')
                if len(parts) == 3:
                    hours, minutes, seconds = map(int, parts)
                    return hours * 3600 + minutes * 60 + seconds
            except ValueError:
                pass
        else:
            # Assume seconds
            try:
                return int(duration_str)
            except ValueError:
                pass
        
        return None

    def _extract_reason(self, message: str) -> Optional[str]:
        """Extract reason from message if available"""
        
        # Look for common reason patterns
        reason_patterns = [
            r'reason:\s*([^,\n]+)',
            r'because\s+([^,\n]+)',
            r'due to\s+([^,\n]+)',
        ]
        
        for pattern in reason_patterns:
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return None