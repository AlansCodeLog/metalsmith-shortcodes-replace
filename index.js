const fs = require('fs-extra');

module.exports = plugin;

function plugin(opts) {
    if(typeof opts.clean_cache !== "undefined" && opts.clean_cache == true) {
        fs.removeSync('cache.shortcodes.json')
    }
    fs.ensureFileSync('cache.shortcodes.json')
    var cache = fs.readJsonSync('cache.shortcodes.json', { throws: false })
    if (cache == null) {
        cache = {shortcodes:{}}
    }
    return function(files, metalsmith, done){
        for (file in files) {
            var post = files[file]
            var contents = post.contents.toString() //convert buffer
            if (contents.match(/\[\//)) {
                for (shortcode of opts.shortcodes) {
                    if (typeof shortcode.name !== "undefined" && typeof shortcode.replace == "function") {
                        let name= shortcode.name
                        re = new RegExp ("(\\s?)+\\["+name+"(.*?)\\](?!\\()([\\S\\s]*?)\\[\\/"+name+"\\](\\s?)+", "gm")
                        contents = contents.replace(re, function (match, notused, params, inner, notusedeither) {
                            params = params.replace("\'", "\"").split(/(=\"|\")/)
                            params = params.map(item => {
                                if (item !== "\"" && item.length > 0 && item !== "=\"") {
                                    item = item.trim()
                                    return item
                                }
                            }).filter(item => {return typeof item !== "undefined"})
                            let obj = {}
                            for (i = 0; i < params.length; i = i+2) {
                                obj[params[i]] = params[i+1]
                            }
                            obj.inner = inner
                            if ((typeof shortcode.clean_cache == "undefined" || shortcode.clean_cache !== true) && typeof cache.shortcodes !== "undefined" && typeof cache.shortcodes[name] !== "undefined" && typeof cache.shortcodes[name][match] !== "undefined") {
                                return cache.shortcodes[name][match]
                            } else {
                                var data = shortcode.replace(obj, match, metalsmith)
                                cache.shortcodes = cache.shortcodes || {}
                                cache.shortcodes[name] = cache.shortcodes[name] || {}
                                cache.shortcodes[name][match] = data
                                return data
                            }
                        })
                    } else if (typeof shortcode.find !== "undefined" && (typeof shortcode.replace == "string" || typeof shortcode.replace == "function")) {
                        contents = contents.replace(shortcode.find, shortcode.replace)
                    }
                }
            }
            contents = new Buffer(contents)
            files[file].contents = contents
        }
    }
    fs.writeJsonSync('cache.shortcodes.json', cache)
    done()
}
