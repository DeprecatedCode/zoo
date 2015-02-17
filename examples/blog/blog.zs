# Sample Blog Application

'<h1>My Zoo Blog</h1>'.print

# Configuration

dir: 'data/'
ext: '.txt'

# Regex to build a slug from an article title

make_slug: {it.lower.replace ~"[^a-z1-9]" "-" \
                    .replace ~"-+" "-"        \
                    .replace ~"^-|-$" ""}

# Save new post

{
  ? @request.method = "POST": {
    "Saving...".print
    filename: make_slug{it: @request.form.text.lines 0}
    @dir dir .ensure
    ? filename.length: @file(dir filename ext).write(@request.form.text)
    @redirect '?'
  }$
}$

# Delete a post

{
  ? @request.args ?? delete: {
    "Deleting...".print
    filename: make_slug{it: @request.args.delete}
    @file(dir filename ext).delete
    @redirect '?'
  }$
}$

# New post form

new_post: """
<form action="?" method="POST">
  <b>New Post:</b>
  <i style="font-size: 12px; color: gray;">*First line is the post title</i><br/>
  <textarea style="font-family: sans-serif; line-height: 1.5; padding: 1em;"
    name="text" cols="60" rows="10"></textarea><br/>
  <input type="submit" />
</form>
<hr/>"""

# Display existing post

? @request.args ?? slug: {
  slug: @request.args.slug
  '<a href="?">&laquo; All Posts</a> &bull;
   <a href="?delete=' slug '">Delete Post</a>'.print

  @file(dir slug ext).lines @ {
    ? key = 0: '<h2>' (it.html) '</h2>'.print
            *: it.html '<br/>'.print
  }
}$

# List all posts

*: {
    new_post.print
    @dir dir .files @ {
      lines: it .lines
      ? lines ?? 0: {
        slug: it .name .replace '.txt' ''
        '<p><a href="?slug=' (slug.esc) '">' (lines[0].html) '</a></p>'.print
      }$
    }
}$
