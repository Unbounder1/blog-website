# image_process("alt text", ["large", "med", "small"])
# jinja filter processing
from jinja2 import Environment, FileSystemLoader
import markdown
import yaml
from dotmap import DotMap
import psycopg2
import dotenv
import os
import datetime

toc_dict = [{}]

def image_process(image_link, alt_text="", image_size="med"):
    # Define width based on size
    if image_size == "large":
        width = "500"  
    elif image_size == "med":
        width = "300"
    else:  # "small"
        width = "150"
    
    outStr = f'''<Image
  src="$${image_link}$$" #MINIO
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

def html_convert(dir, metadata):
    f = open("./" + dir + "/body.md")
    html_content = markdown.markdown(f.read())
    f.close()

    env = Environment()
    env.filters["image_process"] = image_process
    env.filters["chapter"] = chapter
    env.filters["subchapter"] = subchapter


    template = env.from_string(html_content)

    return template.render(metadata=metadata)

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
    for chapter in toc:
        chapter_number = chapter.get('number')
        chapter_title = chapter.get('title')
        subchapters = chapter.get('subchapters', [])

        output += f'            <li><a href="#{chapter_number}">{chapter_number}. {chapter_title}</a>\n'

        # If there are subchapters, create a nested list
        if subchapters:
            output += '                <ul>\n'
            for subchapter in subchapters:
                sub_number = subchapter.get('number')
                sub_title = subchapter.get('title')

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

def compile_folder(dir):
    #Input YAML processing
    with open("./" + dir + "/metadata.yaml", "r") as file:
        metadata_dict = yaml.safe_load(file)
    metadata = DotMap(metadata_dict)

    outputStr = ""
    
    outputStr += html_convert(dir, metadata)
    outputStr = toc_process(toc_dict) + outputStr

    #formatting
    outputStr =  f"""
<body>""" + outputStr
    outputStr += "\n</body>"
    return metadata, outputStr

def db_connection():
    dotenv.load_dotenv()
    DB_HOST = os.getenv('DB_HOST')
    DB_PORT = os.getenv('DB_PORT')
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_NAME = os.getenv('DB_NAME')
    DB_SSLMODE = os.getenv('DB_SSLMODE')

    try:
        # Connect to the PostgreSQL database
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

        except Exception as e:
            connection.rollback()
            print(f"An error occurred: {e}")
            raise

def body_input(connection, body, metadata):
    with connection.cursor() as cursor:

        if metadata.id != None:
            delete_db(connection, metadata)

        #INSERTION INTO TAGS
        query = """
        SELECT name FROM tags;
        """

        cursor.execute(query)
        existing_tags = set(row[0] for row in cursor.fetchall())
        new_tags = set(metadata.tags) - existing_tags 

        query = """
        INSERT INTO tags (name)
        VALUES (%s)
        """
        for tag in new_tags:
            cursor.execute(query, (tag,))

        query = """
        SELECT id
        FROM tags
        WHERE name = ANY(%s)
        ORDER BY array_position(%s, name);
        """
        cursor.execute(query, (metadata.tags, metadata.tags))

        # Fetch all IDs
        tag_ids = [row[0] for row in cursor.fetchall()]

        #INSERTION INTO BLOGDIGEST
        query = """
        INSERT INTO blogdigest (title, summary, thumbnail_url, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """
        data = (
            metadata.title,
            metadata.summary,
            metadata.thumbnail_url,
            metadata.created_at,
            metadata.updated_at,
        )
        cursor.execute(query, data)

        blog_id = cursor.fetchone()
        values = [(blog_id[0], tag) for tag in tag_ids]
        query = "INSERT INTO blog_tags (blog_id, tag_id) VALUES (%s, %s)"
        cursor.executemany(query, values)

        query = "INSERT INTO blog_body (blog_id, body) VALUES (%s, %s);"
        cursor.execute(query, (blog_id[0],body))

        connection.commit()
        return blog_id[0]

def compile_dir(dir):
    # code struct:
    #
    # INPUT: directory
    # upload image assets to database using metadata.images[]
    # process toc, implement metadata into the page formatting
    # upload new tags to db
    # retrieve database image links
    # process body markdown -> html -> jinja (enable html escaping)

    metadata, body = compile_folder(dir)

    if not hasattr(metadata, 'updated_at') or metadata.updated_at is None:
        metadata.updated_at = datetime.datetime.now(datetime.timezone.utc)
    if not hasattr(metadata, 'created_at') or metadata.created_at is None:
        metadata.created_at = datetime.datetime.now(datetime.timezone.utc)

    connection = db_connection()

    if (connection == -1):
        return 1
    blog_id = body_input(connection, body, metadata)

    connection.close()
    print("Database connection closed")

    #apply info to metadat.yaml
    metadata.id = blog_id
    plain_data = metadata.toDict()
    with open('./' + dir + '/metadata.yaml', 'w') as file:
        yaml.safe_dump(plain_data, file, default_flow_style=False)