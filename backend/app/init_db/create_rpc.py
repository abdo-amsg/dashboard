import psycopg2
from psycopg2 import sql
from ..core.config import settings

def create_rpc_functions():
    # Define your function DDLs for each KPI
    create_functions = [
        """
        CREATE OR REPLACE FUNCTION public.get_top_n_attack_types(n integer)
        RETURNS TABLE(attack_type text, count integer)
        LANGUAGE plpgsql
        AS $$
        BEGIN
            RETURN QUERY SELECT l.attack_type::TEXT, COUNT(*)::INTEGER FROM logs l WHERE l.attack_type IS NOT NULL GROUP BY l.attack_type ORDER BY COUNT(*) DESC LIMIT n;
        END;
        $$;
        """,
        """
        CREATE OR REPLACE FUNCTION public.get_average_cvss_score()
        RETURNS numeric
        LANGUAGE plpgsql
        AS $$
        BEGIN
            RETURN (SELECT AVG(cvss_base_score) FROM logs WHERE cvss_base_score IS NOT NULL AND cvss_base_score > 0);
        END;
        $$;
        """,
        """
        CREATE OR REPLACE FUNCTION public.get_top_n_vulnerabilities(n integer)
        RETURNS TABLE(vulnerability_name text, count integer)
        LANGUAGE plpgsql
        AS $$
        BEGIN
            RETURN QUERY SELECT l.vulnerability_name::TEXT, COUNT(*)::INTEGER FROM logs l WHERE l.vulnerability_name IS NOT NULL GROUP BY l.vulnerability_name ORDER BY COUNT(*) DESC LIMIT n;
        END;
        $$;
        """,
        """
        CREATE OR REPLACE FUNCTION public.get_top_n_malware_type(n integer)
        RETURNS TABLE(vulnerability_name text, count integer)
        LANGUAGE plpgsql
        AS $$
        BEGIN
            RETURN QUERY SELECT l.malware_type::TEXT, COUNT(*)::INTEGER FROM logs l WHERE l.malware_type IS NOT NULL GROUP BY l.malware_type ORDER BY COUNT(*) DESC LIMIT n;
        END;
        $$;
        """,
        """
        CREATE OR REPLACE FUNCTION public.get_successful_quarantine()
        RETURNS integer
        LANGUAGE plpgsql
        AS $$
        DECLARE
            result integer;
        BEGIN
            SELECT COUNT(*) INTO result FROM logs WHERE quarantine_status = 'successful';
            RETURN result;
        END;
        $$;
        """,
        """
        CREATE OR REPLACE FUNCTION public.get_total_incidents()
        RETURNS integer
        LANGUAGE plpgsql
        AS $$
        BEGIN
            RETURN (SELECT COUNT(*) FROM logs where severity = 'HIGH' OR severity = 'CRITICAL' or log_type = 'THREAT' or action = 'BLOCKED');
        END;
        $$;
        """,
        """
        CREATE OR REPLACE FUNCTION public.get_average_cvss_score_trends()
        RETURNS TABLE(date date, average_score numeric)
        LANGUAGE plpgsql
        AS $$
        BEGIN
            RETURN QUERY SELECT date_trunc('month', event_time)::DATE AS date, AVG(cvss_base_score)::numeric AS average_score
            FROM logs
            WHERE cvss_base_score IS NOT NULL AND cvss_base_score > 0
            GROUP BY date_trunc('month', event_time)
            ORDER BY date;
        END;
        $$;
        """,
        """
        CREATE OR REPLACE FUNCTION public.get_incident_trends()
        RETURNS TABLE(date date, incident_count integer)
        LANGUAGE plpgsql
        AS $$
        BEGIN
            RETURN QUERY SELECT date_trunc('month', event_time)::DATE AS date, COUNT(*)::integer AS incident_count
            FROM logs
            WHERE severity IN ('HIGH', 'CRITICAL') OR log_type = 'THREAT' OR action = 'BLOCKED'
            GROUP BY date_trunc('month', event_time)
            ORDER BY date;
        END;
        $$;
        """,
        """
        CREATE OR REPLACE FUNCTION public.get_detection_rule_performance()
        RETURNS TABLE(rule_name text, performance_percentage numeric)
        LANGUAGE plpgsql
        AS $$
        BEGIN
            RETURN QUERY 
            WITH rule_stats AS (
                SELECT 
                    policy,
                    COUNT(*) as total_events,
                    COUNT(CASE WHEN action IN ('BLOCKED', 'QUARANTINED') THEN 1 END) as successful_detections
                FROM logs 
                WHERE policy IS NOT NULL 
                GROUP BY policy
            )
            SELECT 
                rs.policy::TEXT as rule_name,
                CASE 
                    WHEN rs.total_events > 0 THEN 
                        ROUND((rs.successful_detections::numeric / rs.total_events::numeric) * 100, 2)
                    ELSE 0 
                END as performance_percentage
            FROM rule_stats rs
            ORDER BY performance_percentage ASC;
        END;
        $$;
        """,
        """
        CREATE OR REPLACE FUNCTION public.get_average_detection_rule_performance()
        RETURNS numeric
        LANGUAGE plpgsql
        AS $$
        BEGIN
            RETURN (SELECT AVG(performance_percentage) FROM public.get_detection_rule_performance());
        END;
        $$;
        """
        # Add more functions as needed for other KPIs
    ]

    # Connect to the database
    conn = psycopg2.connect(
        dbname=settings.DASHBOARD_POSTGRES_DB,
        user=settings.DASHBOARD_POSTGRES_USER,
        password=settings.DASHBOARD_POSTGRES_PASSWORD,
        host=settings.DASHBOARD_POSTGRES_HOST,
        port=settings.DASHBOARD_POSTGRES_PORT
    )
    conn.autocommit = True  # DDL must run outside a transaction block in some setups
    cur = conn.cursor()

    try:
        for create_fn in create_functions:
            cur.execute(create_fn)
            print("Function created successfully.")
    finally:
        cur.close()
        conn.close()