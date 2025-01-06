# image_process("alt text", ["large", "med", "small"])
# jinja filter processing
from jinja2 import Environment, FileSystemLoader
import markdown
import yaml
from dotmap import DotMap

'''
jinja filter function in control of image formatting. 
'''
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

def convert_html(dir, metadata):
    f = open("./" + dir + "/body.md")
    html_content = markdown.markdown(f.read())

    env = Environment()
    env.filters["image_process"] = image_process

    template = env.from_string(html_content)

    return template.render(metadata=metadata)

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

    #Input YAML processing
    with open("./" + dir + "/metadata.yaml", "r") as file:
        metadata_dict = yaml.safe_load(file)
    metadata = DotMap(metadata_dict)

    outputStr = convert_html(dir, metadata)
    print(outputStr)

    
main()