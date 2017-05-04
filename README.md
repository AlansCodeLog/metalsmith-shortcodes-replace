# metalsmith-shortcodes-replace
A Metalsmith plugin for processing shortcodes. You can use the built in matching function or specify your own replacement function (in which case you could match just about anything, not necessarily shortcodes).

## Install

```
npm install metalsmith-shortcodes-replace
```

## Usage

```javascript
const metalsmith = require('metalsmith');
const shortcodes = require('metalsmith-shortcodes-replace');
metalsmith
    //best to place before any markdown plugins
    .use(shortcodes({
        shortcodes: [
            {//built in matcher
                name: "shortcode",
                replace: function (params, match) {
                    var inner = params.inner
                    return "<shortcode>"+inner+"</shortcode>"
                },
            },
            {//custom replacement function
                find: /__(.*?)__/g, //string or regex
                replace: function(match, contents) { //parameters are defined by the find regex
                    return "<u>"+contents+"</u>"
                }
                //OR
                //replace: "<u>$1</u>"
            }
        ],
        //options
    }))
```

## Options

### `shortcodes`

Shortcodes should be an array of objects, each being their own shortcode.

### `clean_cache`
(default false)

I needed several of my shortcodes to fetch the code from an api (see [notes](#notes)) and I didn't want to have more and more requests piling up as the blog expanded so I added a cache. Setting this to true will clear it (or you can delete the `cache.shortcodes.json` file. It cannot detect changes in the shortcode replacement function so you should set this to true when changing what your shortcode returns.

If a shortcode matches the same thing as another shortcode but returns something different the cache would need to be cleared every time, so for those cases or for repetitively testing just one shortcode you can specify this option for individual shortcodes as well, and that shortcode well never look for itself in the cache.

```javascript
{
    clean_cache: true,
    name: "shortcode"
    replace: function (params, match) {
        var inner = params.inner
        return "<shortcode>"+inner+"</shortcode>"
    },
}
```

## Shortcode Options

### `name`
(string)

This will use the built in matcher so `name: "shortcode"` will match `[shortcode][/shortcode]` and if there's any parameters specified, for example `[shortcode id="1" other="attribute"]Interior[/shortcode]`, in the replace function you can access them with `params.id` and anything between the shortcode tags can be accessed with `params.inner`.

### `find`
(string or regex)

You should not specify a `name` when using `find` and vice versa. This is just the first parameter of the string `replace()` method and will allow you to match either a string or a custom regex.

### `replace`

#### Using the built matcher:
(function)
It has two parameters, `params`, which holds all the information gathered from the shortcode, and `match`, which is just the original match.

#### Custom Replacement
(function or string)

This behaves just like the second parameter of the string `replace()` method and it can be a function or a string. For example, in the underline example above, replace could just be `replace: "<u>$1</u>"`.

## To-Do

- [ ] Tests

## Notes

If you are fetching the code from some api, know that async functions do not mix well with the replace method. I ended up using the sync-request library for simplicities sake.
