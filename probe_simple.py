import mysql.connector

try:
    conn = mysql.connector.connect(host="127.0.0.1", user="root", password="")
    cursor = conn.cursor()
    
    for db in ['bacheliers', 'facture', 'test']:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {db}.medicaments")
            print(f"DB: {db} | Count: {cursor.fetchone()[0]}")
        except Exception as e:
            print(f"DB: {db} | Error: {e}")

except Exception as e:
    print(e)
finally:
    if 'conn' in locals() and conn.is_connected():
        conn.close()
