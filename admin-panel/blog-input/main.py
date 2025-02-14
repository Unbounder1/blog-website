import os
import sys
sys.path.append(os.path.abspath('./.lib'))
from body_compile import compile_dir, db_connection, delete_db
from image_compile import process_assets

def main():
    dirList = [d for d in os.listdir('.') if (os.path.isdir(d) and d[0] != "_" and d[0] != ".")]

    for dir in dirList:
        blog_id = compile_dir(dir)

        if blog_id == -1:
            continue
        else:
            process_assets(dir, blog_id)

main()