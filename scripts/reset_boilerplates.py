import os
import sqlite3
import MySQLdb
import ast
from dotenv import load_dotenv

# Load root .env
load_dotenv('.env')

def extract_boilerplate(code):
    if not code:
        return code
    try:
        tree = ast.parse(code)
        lines = code.split('\n')
        boilerplate_lines = []
        for node in tree.body:
            if isinstance(node, ast.ClassDef) and node.name == 'Solution':
                boilerplate_lines.append(f"class {node.name}:")
                for item in node.body:
                    if isinstance(item, ast.FunctionDef):
                        # extract decorators?
                        for dec in item.decorator_list:
                            boilerplate_lines.append(f"    @{dec.id if hasattr(dec, 'id') else 'decorator'}") # simple handling
                        # get args
                        args = ast.unparse(item.args)
                        returns = f" -> {ast.unparse(item.returns)}" if item.returns else ""
                        boilerplate_lines.append(f"    def {item.name}(self, {args}){returns}:")
                        # get docstring if exists
                        if ast.get_docstring(item):
                            doc = ast.get_docstring(item)
                            boilerplate_lines.append(f"        \"\"\"{doc}\"\"\"")
                        boilerplate_lines.append(f"        pass\n")
            elif isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom):
                boilerplate_lines.append(ast.unparse(node))
        
        if boilerplate_lines:
            return "\n".join(boilerplate_lines)
        return code
    except Exception as e:
        # If parsing fails, return original
        return code

db_dialect = os.getenv('DB_DIALECT', 'sqlite')
if db_dialect == 'mysql':
    conn = MySQLdb.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        passwd=os.getenv('DB_PASSWORD'),
        db=os.getenv('DB_NAME')
    )
    cursor = conn.cursor()
    cursor.execute("SELECT id, python_code FROM problems")
else:
    conn = sqlite3.connect('database.sqlite')
    cursor = conn.cursor()
    cursor.execute("SELECT id, python_code FROM problems")

rows = cursor.fetchall()
updated_count = 0
for row in rows:
    q_id, python_code = row
    if python_code:
        boiler = extract_boilerplate(python_code)
        if boiler != python_code:
            if db_dialect == 'mysql':
                cursor.execute("UPDATE problems SET practice_scaffold = %s WHERE id = %s", (boiler, q_id))
            else:
                cursor.execute("UPDATE problems SET practice_scaffold = ? WHERE id = ?", (boiler, q_id))
            updated_count += 1

conn.commit()
conn.close()
print(f"Updated {updated_count} boilerplates.")
