## TODO
CREATE DELETE OPTION FOR FOLDER

## HOWTO USE

Compile with `python main.py`

DIrectory based structure (template folder is ignored):
- Copy the folder and edit as needed
- Remove updated-at and created-at timestamp to autogenerate new timestamp

### Images:
Upload the images to assets folder.
Reference image using imagename: `image.png` if its in ./assets/image.png

** Formatting **
```{ metadata.images.imagename | image_process("alt text here or leave empty", ["large", "med", "small"])}```
Large -> 500px
Med -> 300px
Small -> 150px

Outputs images as a hydration based html on minio object storage (.env file)

### Subchapter & Chapter:
```
{{ "1" | chapter("title") }}

{{ "1.1" | subchapter("subtitle") }}
```

Use this format to input chapters and subchapters. They will be added to the table of contents automatically.

### Tags:

tags:
- tag1
- tag2

Will auto upload to database if not already existing and add itself. Tags will delete if database changes tags.

### Variables:

Use variables to dynamically input things using {{ varname }} and add to metadata.yaml

### ENV:

```
MINIO_HOST=localhost
MINIO_PORT=9000
MINIO_USER=minioadmin
MINIO_PASS=minioadmin
MINIO_SECURE=false
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=mypassword
POSTGRES_NAME=blogdigestdb
POSTGRES_SSLMODE=disable
PORT=8080
BACKEND_HOST=localhost
BACKEND_PORT=8080
```