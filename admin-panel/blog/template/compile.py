# image_process("alt text", ["large", "med", "small"])
# jinja filter processing
# from jinja2 import Environment, Filesystemloader
import yaml

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
    print(outStr)

def main():
    # code struct:
    #
    # upload image assets to database using metadata.images[]
    # process toc, implement metadata into the page formatting
    # retrieve database image links
    # process body markdown -> html -> jinja (enable html escaping)



image_process("./test", "med")