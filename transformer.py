import sqlite3
import mysql.connector

# Connect to SQLite
sqlite_conn = sqlite3.connect("mediassist/medicaments.db")
sqlite_cursor = sqlite_conn.cursor()

# Connect to MySQL
mysql_conn = mysql.connector.connect(
    host="127.0.0.1",
    user="root",
    password="",
    database="mediassist"
)
mysql_cursor = mysql_conn.cursor()

# Fetch all rows from SQLite
sqlite_cursor.execute("SELECT name, price, dosage, composition, Classe_thérapeutique, Code_ATCv FROM medicaments")
rows = sqlite_cursor.fetchall()

print(f" Found {len(rows)} records to migrate.\n")

# Insert each row into MySQL and print it
for i, row in enumerate(rows, start=1):
    mysql_cursor.execute("""
        INSERT INTO medicaments (name, price, dosage, composition, Classe_thérapeutique, Code_ATCv)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, row)
    
    # Print current row info

# Commit all changes
mysql_conn.commit()

# Close connections
sqlite_conn.close()
mysql_conn.close()

print("\n Data migrated successfully!")
