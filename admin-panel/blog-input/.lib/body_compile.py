# image_process("alt text", ["large", "med", "small"])
# jinja filter processing
from jinja2 import Environment
import markdown
import yaml
from dotmap import DotMap
import psycopg2
import dotenv
import os
import datetime
import re
import unicodedata

toc_dict = [{}]

#FIX ASTRO NOT UPDATINg STATIC LINKS (maybe)
#--------------------------------------
#--------------------------------------
#--------------------------------------
#--------------------------------------
#--------------------------------------
#--------------------------------------
#--------------------------------------
def image_process(image_link, alt_text="", image_size="med"):
    # Define width based on size
    if image_size == "large":
        width = "500"  
    elif image_size == "med":
        width = "300"
    else:  # "small"
        width = "150"

    blog_id = "{{ blog_id }}"
    backend_host = "{{ backend_host }}"
    backend_port = "{{ backend_port }}" 
    
    outStr = f'''<Image
  src="http://{backend_host}:{backend_port}/image/blog/blog_{blog_id}/{image_link}"
  alt="{alt_text}"
  width="{width}"
  format="auto"
  placeholder="blur"
/>'''
    
    return outStr

def chapter(id, title):
    temp_dict = {}
    temp_dict["number"] = id
    temp_dict["title"] = title
    temp_dict["subchapters"] = []
    toc_dict.append(temp_dict)
    return f'        <section id="{id}"></section>\n            <h2>{id}. {title}</h2>'

def subchapter(id, title):
    temp_dict = {}
    temp_dict["number"] = id
    temp_dict["title"] = title
    toc_dict[-1]["subchapters"].append(temp_dict)
    return f'        <section id="{id}"></section>\n            <h3>{id}. {title}</h3>'

def html_convert(dir, metadata, blog_id):
    """
    Converts a Markdown file (body.md) located in the specified directory
    to HTML, then processes any Jinja filters for chapters, subchapters,
    or images.

    Args:
        dir (str): The directory containing body.md.
        metadata (DotMap): A DotMap of metadata from metadata.yaml.
        blog_id (int): The resolved blog ID.

    Returns:
        str: Rendered HTML string after Jinja processing.
    """
    
    md_path = os.path.join("./", dir, "body.md")
    if not os.path.isfile(md_path):
        raise FileNotFoundError(f"Markdown file not found at path: {md_path}")

    with open(md_path, "r", encoding="utf-8") as f:
        html_content = markdown.markdown(f.read())

    env = Environment()
    env.filters["image_process"] = image_process
    env.filters["chapter"] = chapter
    env.filters["subchapter"] = subchapter

    template = env.from_string(html_content)
    process_one = template.render(metadata=metadata)
    template = env.from_string(process_one)

    dotenv.load_dotenv()
    backend_host = os.getenv('BACKEND_HOST', 'localhost')
    backend_port = os.getenv('BACKEND_PORT', '9000')
    return template.render(blog_id=blog_id, backend_host=backend_host, backend_port=backend_port)

def toc_process(toc):
    """
    Returns:
        str: A string containing the HTML of the Table of Contents.
    """
    output = """
    <div class="toc">
        <h2>Table of Contents</h2>
        <ul>
    """

    # Iterate through each chapter in the toc
    for chapter_item in toc:
        chapter_number = chapter_item.get('number')
        chapter_title = chapter_item.get('title')
        subchapters = chapter_item.get('subchapters', [])

        
        # If there is an empty dict in toc_dict (like the initial [{}]),
        # skip it to avoid KeyError or None output.
        if not chapter_number or not chapter_title:
            continue

        output += f'            <li><a href="#{chapter_number}">{chapter_number}. {chapter_title}</a>\n'

        # If there are subchapters, create a nested list
        if subchapters:
            output += '                <ul>\n'
            for subchapter_item in subchapters:
                sub_number = subchapter_item.get('number')
                sub_title = subchapter_item.get('title')
                if sub_number and sub_title:
                    sub_id = f"chapter{chapter_number}-sub{sub_number}".replace(" ", "-").lower()
                    output += f'                    <li><a href="#{sub_number}">{sub_number}. {sub_title}</a></li>\n'
            output += '                </ul>\n'

        # Close the chapter list item
        output += '            </li>\n'

    # Close the main list and container div
    output += """
        </ul>
    </div>
    """
    return output

def compile_folder(dir, metadata, blog_id):
    """
    Builds final HTML string by:
      1. Converting body.md to HTML via `html_convert()`
      2. Generating a table of contents via `toc_process()`
      3. Wrapping everything in <body> tags

    Args:
        dir (str): The directory that contains body.md
        metadata (DotMap): The metadata from metadata.yaml
        blog_id (int): The final blog ID

    Returns:
        str: Final HTML to be inserted into the `blog_body` column
    """
    outputStr = html_convert(dir, metadata, blog_id)
    outputStr = toc_process(toc_dict) + outputStr

    # formatting
    outputStr = f"""
<body>""" + outputStr
    outputStr += "\n</body>"
    return outputStr

def db_connection():
    """
    Loads environment variables via dotenv, then attempts a connection
    to the PostgreSQL database. Returns the connection object on success
    or -1 on failure.
    """
    dotenv.load_dotenv()
    DB_HOST = os.getenv('POSTGRES_HOST')
    DB_PORT = os.getenv('POSTGRES_PORT')
    DB_USER = os.getenv('POSTGRES_USER')
    DB_PASSWORD = os.getenv('POSTGRES_PASSWORD')
    DB_NAME = os.getenv('POSTGRES_NAME')
    DB_SSLMODE = os.getenv('POSTGRES_SSLMODE')

    if not DB_HOST or not DB_PORT or not DB_USER or not DB_PASSWORD or not DB_NAME:
        raise ValueError("One or more required DB environment variables are not set.")

    try:
        connection = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            dbname=DB_NAME,
            sslmode=DB_SSLMODE
        )
        print("Database connection successful")

        return connection

    except Exception as e:
        print("Error while connecting to the database:", e)
        return -1

def delete_db(connection, metadata):
    """
    Given a connection and metadata with `metadata.id`, deletes existing
    entries in blogdigest, blog_tags, tags (if orphaned), and blog_body
    for that specific ID.
    """
    if not hasattr(metadata, "id") or metadata.id is None:
        raise ValueError("metadata.id is required for deletion.")
    with connection.cursor() as cursor:
        try:
            cursor.execute("DELETE FROM blogdigest WHERE id = %s;", (metadata.id,))
            cursor.execute("DELETE FROM blog_tags WHERE blog_id = %s;", (metadata.id,))
            cursor.execute("""
                DELETE FROM tags
                WHERE id NOT IN (SELECT DISTINCT tag_id FROM blog_tags);
            """)
            cursor.execute("DELETE FROM blog_body WHERE blog_id = %s;", (metadata.id,))

            connection.commit()
            print("Deleted duplicate db")

        except Exception as e:
            connection.rollback()
            print(f"An error occurred: {e}")
            raise

def process_thumbnail(metadata):
    if not metadata.thumbnail_image.lower().startswith('http'):
        dotenv.load_dotenv()
        minio_host = os.getenv('BACKEND_HOST', 'localhost')
        minio_port = os.getenv('BACKEND_PORT', '8080')
        return f"http://{minio_host}:{minio_port}/image/blog/blog_{metadata.id}/{metadata.thumbnail_image}"
    else:
        return metadata.thumbnail_image
    
def slugify(value):
    value = unicodedata.normalize('NFKD', value)
    value = value.encode('ascii', 'ignore').decode('ascii')
    value = value.lower()
    value = re.sub(r'[^a-z0-9]+', '-', value)
    value = re.sub(r'^-+|-+$', '', value)
    return value
    
def body_input(connection, body, metadata, blog_id):
    """
    Inserts the compiled HTML body and metadata into the DB.

    1. Inserts new tags into `tags` table if they don't already exist.
    2. Inserts blog summary into `blogdigest`.
    3. Associates blog with tags in `blog_tags`.
    4. Inserts body HTML into `blog_body`.

    Returns:
        int: The blog_id used for insertion.
    """
    
    if not isinstance(blog_id, int):
        raise TypeError("blog_id must be an integer.")
    if not hasattr(metadata, "tags"):
        raise ValueError("metadata must have a 'tags' attribute.")
    if not isinstance(metadata.tags, (list, tuple)):
        raise TypeError("metadata.tags must be a list or tuple of tag names.")

    with connection.cursor() as cursor:

        # Get existing tags
        query = """
        SELECT name FROM tags;
        """
        cursor.execute(query)
        existing_tags = set(row[0] for row in cursor.fetchall())

        # New tags that need to be inserted
        new_tags = set(metadata.tags) - existing_tags

        # Insert new tags
        query = """
        INSERT INTO tags (name)
        VALUES (%s)
        """
        for tag in new_tags:
            cursor.execute(query, (tag,))

        # Retrieve the IDs of the tags in the order they appear in metadata.tags
        query = """
        SELECT id
        FROM tags
        WHERE name = ANY(%s)
        ORDER BY array_position(%s, name);
        """
        cursor.execute(query, (metadata.tags, metadata.tags))
        tag_ids = [row[0] for row in cursor.fetchall()]

        # Insert into blogdigest
        query = """
        INSERT INTO blogdigest (id, title, slug, summary, thumbnail_url, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        data = (
            blog_id,
            metadata.title,
            slugify(metadata.title),
            metadata.summary,
            process_thumbnail(metadata),
            metadata.created_at,
            metadata.updated_at
        )
        
        # Make sure required metadata fields exist
        if not hasattr(metadata, "title") or not hasattr(metadata, "summary"):
            raise ValueError("Metadata must have 'title' and 'summary' fields.")

        cursor.execute(query, data)

        # Insert into blog_tags
        values = [(blog_id, tag) for tag in tag_ids]
        query = "INSERT INTO blog_tags (blog_id, tag_id) VALUES (%s, %s)"
        cursor.executemany(query, values)

        # Insert into blog_body
        query = "INSERT INTO blog_body (blog_id, body) VALUES (%s, %s);"
        cursor.execute(query, (blog_id, body))

        connection.commit()
        return blog_id

def get_id(connection):
    """
    Returns the maximum ID from the blogdigest table (i.e., the last used ID).
    If the table is empty, this should return None.

    Args:
        connection: psycopg2 connection object.

    Returns:
        int or None: The max ID, or None if no rows in table.
    """
    with connection.cursor() as cursor:
        cursor.execute("SELECT MAX(id) AS blog_id FROM blogdigest")
        output = cursor.fetchone()
        return output[0]

def compile_dir(dir):
    """
    High-level function that:
      1. Reads metadata.yaml in `dir`
      2. Ensures `updated_at` is set (else sets it to now)
      3. Connects to DB
      4. Gets max blog ID, or uses metadata.id if present
      5. Deletes existing DB rows if metadata.id is found
      6. Compiles the blog into HTML (body + toc)
      7. Inserts into the DB
      8. Updates metadata.yaml with the final blog_id

    Returns:
        int: The final blog_id
    """
    
    dir_path = os.path.join("./", dir)
    if not os.path.isdir(dir_path):
        raise NotADirectoryError(f"The provided path '{dir_path}' is not a valid directory.")

    metadata_path = os.path.join(dir_path, "metadata.yaml")
    if not os.path.isfile(metadata_path):
        raise FileNotFoundError(f"metadata.yaml not found at path: {metadata_path}")

    with open(metadata_path, "r", encoding="utf-8") as file:
        metadata_dict = yaml.safe_load(file)
    metadata = DotMap(metadata_dict)

    connection = db_connection()

    if hasattr(metadata, 'delete') and metadata.delete == True:
        blog_id = get_id(connection)
        delete_db(connection, metadata)
        return 1

    # Ensure updated_at
    if not hasattr(metadata, 'updated_at') or metadata.updated_at is None:
        metadata.updated_at = datetime.datetime.now(datetime.timezone.utc)
    else:
        print(f"Did not update '{dir}'")
        return -1

    # Ensure created_at
    if not hasattr(metadata, 'created_at') or metadata.created_at is None:
        metadata.created_at = datetime.datetime.now(datetime.timezone.utc)

    if connection == -1:
        return 1
    
    blog_id = get_id(connection)

    # If table is empty, blog_id might be None, so we set it to 1
    if blog_id is None:
        blog_id = 1

    # Check if user provided an ID
    if hasattr(metadata, 'id') and metadata.id is not None:
        # Delete old entry
        delete_db(connection, metadata)
        blog_id = metadata.id
    else:
        blog_id += 1
    
    # Compile final HTML
    body = compile_folder(dir, metadata, blog_id)

    # Insert into DB
    blog_id = body_input(connection, body, metadata, blog_id)

    connection.close()
    print("Database connection closed")

    # Update metadata.yaml with the final blog_id
    metadata.id = blog_id
    plain_data = metadata.toDict()

    with open(metadata_path, 'w', encoding="utf-8") as file:
        yaml.safe_dump(plain_data, file, default_flow_style=False)

    return blog_id