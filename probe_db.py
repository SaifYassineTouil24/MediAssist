import mysql.connector

try:
    conn = mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password=""
    )
    cursor = conn.cursor()
    
    print("--- Scanning all databases for 'medicaments' table ---")
    cursor.execute("SHOW DATABASES")
    databases = [db[0] for db in cursor.fetchall()]
    
    for db in databases:
        if db in ['information_schema', 'performance_schema', 'mysql', 'sys', 'phpmyadmin']:
            continue
            
        try:
            cursor.execute(f"USE {db}")
            cursor.execute("SHOW TABLES LIKE 'medicaments'")
            if cursor.fetchone():
                cursor.execute(f"SELECT COUNT(*) FROM {db}.medicaments")
                count = cursor.fetchone()[0]
                print(f"FOUND: Database '{db}' has 'medicaments' table with {count} rows.")
                
                # Check columns to verify it matches source schema
                cursor.execute(f"DESCRIBE {db}.medicaments")
                cols = [c[0] for c in cursor.fetchall()]
                print(f"   Columns: {cols}")
        except Exception as err:
            print(f"Error checking {db}: {err}")

except Exception as e:
    print(e)
finally:
    if 'conn' in locals() and conn.is_connected():
        conn.close()
