from body_compile import compile_dir, db_connection, delete_db
from minio import Minio
import dotenv
import os 
import yaml

def connect_minio():

    dotenv.load_dotenv()
    minio_host = os.getenv('MINIO_HOST', 'localhost')
    minio_port = os.getenv('MINIO_PORT', '9000')
    minio_user = os.getenv('MINIO_USER', 'minioadmin')
    minio_pass = os.getenv('MINIO_PASS', 'minioadmin')
    minio_secure = os.getenv('MINIO_SECURE', 'false').lower() == 'true'

    endpoint = f"{minio_host}:{minio_port}"

    client = Minio(
        endpoint,
        access_key=minio_user,
        secret_key=minio_pass,
        secure=minio_secure
    )

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
        if image_file.lower().startswith('http'):
            continue
        temp = (image_name, image_file)
        asset_list.append(temp)
    
    thumbnail_image = metadata_dict["thumbnail_image"]
    if not thumbnail_image.lower().startswith('http'):
        temp = ("thumbnail_image", thumbnail_image)
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