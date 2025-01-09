import os
import sys
sys.path.append(os.path.abspath('./.lib'))
from compile import compile_dir, db_connection, delete_db

def main():
    dirList = [d for d in os.listdir('.') if (os.path.isdir(d) and d[0] != "_" and d[0] != ".")]
    print(dirList)
    compile_dir("template")

main()