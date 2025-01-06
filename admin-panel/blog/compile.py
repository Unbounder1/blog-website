# image_process("alt text", ["large", "med", "small"])
# jinja filter processing
from jinja2 import Environment, FileSystemLoader
import markdown
import yaml
from dotmap import DotMap

toc_dict = [{}]

def image_process(image_link, alt_text="", image_size="med"):
    if (image_size == "large"):
        width = ""
        height = ""
    elif (image_size == "med"):
        width = ""
        height = ""
    else:
        width = ""
        height = ""
    outStr = '<img\nsrc="' + image_link + '"\nalt="' + alt_text + '"\nwidth="' + width + '"\nheight="' + height + '"\n/>'
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
    outputStr =  """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Understanding Python Virtual Environments</title>
</head>
<body>""" + outputStr
    outputStr += "\n</body>\n</html>"
    print(outputStr)

def main():
    # code struct:
    #
    # INPUT: directory
    # upload image assets to database using metadata.images[]
    # process toc, implement metadata into the page formatting
    # upload new tags to db
    # retrieve database image links
    # process body markdown -> html -> jinja (enable html escaping)
    dir = "template"

    compile_folder(dir)

    
main()