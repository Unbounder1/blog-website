from compile import compile_dir, db_connection, delete_db
from minio import Minio
import dotenv
import os 

def connect_minio():
    dotenv.load_dotenv()
    client = Minio("localhost:9000",
               access_key=os.getenv('MINIO_USER'),
               secret_key=os.getenv('MINIO_PASS'),
                secure=False)
    return client

def upload_minio(client, bucket_name, destination_file, source_file):
    found = client.bucket_exists(bucket_name)
    if not found:
        client.make_bucket(bucket_name)
    else:
        print("Bucket already exists")
    
    client.fput_object(bucket_name, destination_file, source_file)
    print("Successfully uploaded")

def process_assets(dir):

    client = connect_minio()
    source_dir = "./" + dir + "/assets/"

    bucket_name = "python-test-bucket"
    destination_file = "my-test-file.txt"

    upload_minio(client,bucket_name, destination_file, source_dir+"temp.txt")
