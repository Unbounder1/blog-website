import os
import sys
sys.path.append(os.path.abspath('./.lib'))
from body_compile import compile_dir, db_connection, delete_db
from image_compile import process_assets

def main():
    # dirList = [d for d in os.listdir('.') if (os.path.isdir(d) and d[0] != "_" and d[0] != ".")]
    # print(dirList)
    compile_dir("template")
    process_assets("template", 1)

main()