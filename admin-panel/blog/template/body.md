{{ "1" | chapter("title") }}

{{ "1.1" | subchapter("subtitle") }}

Chapters & subchapters start with their ID's , and then the corresponding filter

This is a jinja templated blog paragraph example. Here is an example of a variable used on compile time: {{ var1 }}. 

This should be another paragraph in the blog post. 
To implement an image, use **jinja** for formatting:

{{ "1.2" | subchapter("subtitle") }}

{{ metadata.images.image1 | image_process("alt text", "med")}}

