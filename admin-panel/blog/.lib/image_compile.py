from body_compile import compile_dir, db_connection, delete_db
from minio import Minio
import dotenv
import os 
import yaml

def connect_minio():
    dotenv.load_dotenv()
    client = Minio("localhost:9000",
               access_key=os.getenv('MINIO_USER'),
               secret_key=os.getenv('MINIO_PASS'),
                secure=False)
    return client

def upload_minio(client, bucket_name, destination_file, source_file, tag):
    found = client.bucket_exists(bucket_name)
    if not found:
        client.make_bucket(bucket_name)
    else:
        print("Bucket already exists")
    
    client.fput_object(bucket_name, destination_file, source_file)
    print("Successfully uploaded")

def get_assets(dir):
    asset_list = []
    with open("./" + dir + "/metadata.yaml", "r") as file:
        metadata_dict = yaml.safe_load(file)

    for image_name, image_file in metadata_dict["images"].items():
        temp = (image_name, image_file)
        asset_list.append(temp)
    
    return asset_list

def process_assets(dir, blog_id):

    client = connect_minio()
    source_dir = "./" + dir + "/assets/"
    destination_bucket = "blog"
    destination_dir = "blog_" + str(blog_id) + "/"

    asset_list = get_assets(dir)
    for asset_name, asset_source in asset_list:
        upload_minio(client,destination_bucket, destination_dir + asset_source, source_dir + asset_source, asset_name )

# Generate a bucket based on the blog_id, create the images with tags of the name. 