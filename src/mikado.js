/**
 * Mikado.js
 * Copyright 2019 Nextapps GmbH
 * Author: Thomas Wilkerling
 * Licence: Apache-2.0
 * https://github.com/nextapps-de/mikado
 */

"use strict";

import "./event.js";
import "./helper.js";
import "./cache.js";
import "./store.js";
import "./polyfill.js";
//import { profiler_start, profiler_end } from "./profiler.js";

const { requestAnimationFrame, cancelAnimationFrame } = window;

const defaults = {

    "store": false,
    "loose": true,
    "cache": true,
    "async": false,
    "reuse": true
    //"flat": false,
    //"diff": false
};

/**
 * @dict
 */

let state = {};

/**
 * @type {Object<string, Template>}
 */

const templates = {};

/**
 * @param {Element|Template} root
 * @param {Template|Object=} template
 * @param {Object=} options
 * @constructor
 */

export default function Mikado(root, template, options){

    if(!root.nodeType){

        options = template;
        template = root;
        root = null;
    }

    if(!template){

        options = root;
        //root = options["root"];
        //template = options["template"];
    }

    if(root){

        this.mount(root);
    }
    else{

        this.dom = null;
        this.root = null;
        this.length = 0;
    }

    this.init(/** @type {Template} */ (template), options);
};

/**
 * @param {string|Template} name
 * @param {Template=} tpl
 */

Mikado.register = function(name, tpl){

    if(!tpl){

        tpl = /** @type {Template} */ (name);
        name = tpl["n"];
    }

    templates[name] = tpl;

    return Mikado;
};

/**
 * @param {Element|Template} root
 * @param {Template|Object=} template
 * @param {Object=} options
 */

Mikado.new = function(root, template, options){

    return new Mikado(root, template, options);
};

Mikado.prototype.mount = function(target){

    if(this.root !== target){

        this.root = target;

        this.check();

        this.dom = target["_dom"] || (target["_dom"] = collection_to_array(target.children));
        this.length = this.dom.length;
    }

    return this;
};

/**
 * @dict
 */

const event_types = {

    "tap": 1,
    "change": 1,
    "click": 1,
    "dblclick": 1,
    "input": 1,
    "keydown": 1,
    "keypress": 1,
    "keyup": 1,
    "mousedown": 1,
    "mouseenter": 1,
    "mouseleave": 1,
    "mousemove": 1,
    "mouseout": 1,
    "mouseover": 1,
    "mouseup": 1,
    "mousewheel": 1,
    "touchstart": 1,
    "touchmove": 1,
    "touchend": 1,
    "touchcancel": 1,
    "reset": 1,
    "select": 1,
    "submit": 1,
    "toggle": 1,
    "blur": 1,
    "error": 1,
    "focus": 1,
    "load": 1,
    "resize": 1,
    "scroll": 1
};

Mikado.prototype.sync = function(){

    this.root["_dom"] = this.dom = collection_to_array(this.root.children);
    this.length = this.dom.length;

    return this;
};

Mikado.prototype.index = function(node){

    return node["_idx"];
};

Mikado.prototype.node = function(index){

    return this.dom[index];
};

Mikado.prototype.item = function(index){

    return this.loose ? this.dom[index]["_item"] : this.store[index];
};

/**
 * @param {Template|string} template
 * @param {Object=} options
 * @returns {Mikado}
 */

Mikado.prototype.init = function(template, options){

    if(DEBUG){

        if(!template){

            console.error("Initialization Error: Template is not defined.");
        }
    }

    options = options ?

        Object.assign({}, this.config || defaults, options)
    :
        defaults;

    /** @export */
    this.config = options;

    if(typeof template === "string"){

        template = templates[template];
    }
    else{

        Mikado.register(template);
    }

    if(SUPPORT_CACHE){

        this.cache = options["cache"];
    }

    if(SUPPORT_ASYNC){

        this.async = options["async"];
    }

    this.reuse = options["reuse"];

    /** @export */
    this.state = options["state"] || state;

    if(SUPPORT_STORAGE){

        const store = options["store"];

        if(store){

            this.loose = options["loose"];

            if(this.loose){

                this.store = false;
            }
            else{

                this.extern = typeof store === "object";

                /** @export */
                this.store = store && (this.extern ? store : []);
            }

            //this.flat = options["flat"];
            //this.diff = options["diff"];
        }
        else{

            this.store = false;
            this.loose = false;
        }
    }

    if(this.template !== template){

        //this.template = template;
        this.template = template["n"];
        this.vpath = null;
        this.update_path = null;
        //this.factory = null;
        this.static = true;
        this.factory = this.parse(template);

        this.check();
    }

    if(options["once"]){

        this.render().destroy(true);
    }

    return this;
};

Mikado.prototype.check = function(){

    if(this.root){

        const id = this.root["_tpl"];

        if(id !== this.template){

            this.root["_tpl"] = this.template;

            if(id){

                this.clear();
            }
        }
    }
};

function collection_to_array(collection){

    let length = collection.length;
    const array = new Array(length);

    for(let i = 0, item; i < length; i++) {

        item = collection[i];
        item["_idx"] = i;
        array[i] = item;
    }

    return array;
}

Mikado.prototype.create = function(item, view, index){

    //profiler_start("create");

    let factory = this.factory;

    /*
    if(!factory){

        this.factory = factory = this.parse(this.template);
    }
    */

    this.static || this.update_path(factory["_path"], item, index, view);

    const tmp = factory.cloneNode(true);

    //profiler_end("create");

    return tmp;
};

if(SUPPORT_STORAGE){

    Mikado.prototype.refresh = function(view){

        if(typeof view === "number"){

            let index = view;
            const node = this.dom[index];
            let item = this.storage ? this.store[index] : node["_item"];

            return this.update(node, item, null, index);
        }

        const items = this.store;
        const count = items ? items.length : (this.loose ? this.length : 0);

        // items delegated from import
        if(this.loose){

            this.store = null;
        }

        for(let x = 0; x < count; x++){

            this.update(this.dom[x], items ? items[x] : null, view, x);
        }

        return this;
    };
}

let timer;

/**
 * @param {Array<*>|Function=} items
 * @param {Object|Function=} view
 * @param {Function=} callback
 * @param {boolean=} skip_async
 * @returns {Mikado|Promise}
 */

Mikado.prototype.render = (function(items, view, callback, skip_async){

    if(DEBUG){

        if(!this.root){

            console.error("Template was not mounted or root was not found.");
        }
    }

    /*
    if(SUPPORT_STORAGE && !items){

        items = this.store;

        // items delegated from import
        if(this.loose){

            this.store = null;
        }
    }
    else if(typeof items === "function"){

        callback = items;

        if(SUPPORT_STORAGE){

            items = this.store;
        }
    }
    */

    if(typeof view === "function"){

        callback = view;
        view = null;
    }

    if(SUPPORT_ASYNC && !skip_async){

        if(callback){

            const self = this;

            timer = requestAnimationFrame(function(){

                timer = null;
                self.render(items, view, null, true);

                if(typeof callback === "function"){

                    callback();
                }
            });

            return this;
        }

        if(this.async){

            const self = this;

            return new Promise(function(resolve){

                timer = requestAnimationFrame(function(){

                    timer = null;
                    self.render(items, view, null, true);
                    resolve();
                });
            });
        }
    }

    //profiler_start("render");

    if(this.static){

        this.dom[0] || this.add();
    }
    else if(items || this.loose){

        let count = items ? items.length : this.length;
        //let fragment;

        this.reuse || this.clear(/* resize: */ count);

        // add or update

        for(let x = 0; x < count; x++){

            if(x < this.length){

                //if(this.reuse){

                    this.update(this.dom[x], items[x], view, x);
                // }
                // else{
                //
                //     this.replace(this.dom[x], items[x], view, x);
                // }
            }
            else{

                this.add(items[x], view, this.root /*|| (fragment = document.createDocumentFragment())*/);
            }
        }

        // if(fragment){
        //
        //     this.root.appendChild(fragment);
        // }

        // reduce

        if(count < this.length){

            if(SUPPORT_STORAGE && this.store){

                this.store.splice(count);
            }

            const nodes = this.dom.splice(count);
            this.length = count;
            count = nodes.length;

            for(let x = 0; x < count; x++){

                this.root.removeChild(nodes[x]);
            }
        }
    }

    //profiler_end("render");

    return this;
});

/**
 * @param {*=} item
 * @param {*=} view
 * @param {Element|DocumentFragment=} target
 * @returns {Mikado}
 */

Mikado.prototype.add = function(item, view, target){

    //profiler_start("add");

    const length = this.length;
    const tmp = this.create(item, view, length);

    if(SUPPORT_STORAGE) {

        //item["_ref"] = tmp;

        if(this.store){

            this.store[length] = item;
        }
        else if(this.loose){

            tmp["_item"] = item;
        }
    }

    tmp["_idx"] = length;
    (target || this.root).appendChild(tmp);
    this.dom[length] = tmp;
    this.length++;

    //profiler_end("add");

    return this;
};

/**
 * @param {boolean=} resize
 */

Mikado.prototype.clear = function(resize){

    //profiler_start("clear");

    this.root["_dom"] = this.dom = resize ? new Array(resize) : [];
    this.root.textContent = "";
    this.length = 0;

    if(SUPPORT_STORAGE && this.store){

        if(this.extern){

            this.store.splice(0);
        }
        else{

            this.store = resize ? new Array(resize) : [];
        }
    }

    if(SUPPORT_CACHE && this.cache){

        this.root["_html"] = null;
    }

    //profiler_end("clear");

    return this;
};

Mikado.prototype.destroy = function(unload){

    if(unload){

        this.unload();
    }

    this.dom = null;
    this.root = null;
    //this.template = null;
    this.vpath = null;
    this.update_path = null;
    this.factory = null;
};

if(SUPPORT_ASYNC){

    Mikado.prototype.cancel = function(){

        if(timer){

            cancelAnimationFrame(timer);
            timer = null;
        }
    };
}

/**
 * @param {*=} items
 * @param {*=} view
 */

Mikado.prototype.append = function(items, view){

    //profiler_start("append");

    const count = items.length;

    for(let x = 0; x < count; x++){

        this.add(items[x], view);
    }

    //profiler_end("append");

    return this;
};

Mikado.prototype.remove = function(node){

    //profiler_start("remove");

    const index = node["_idx"];

    this.dom.splice(index, 1);
    this.root.removeChild(node);
    this.length--;

    if(SUPPORT_STORAGE && this.store){

        this.store.splice(index, 1);
    }

    for(let i = index; i < this.length; i++){

        this.dom[i]["_idx"] = i;
    }

    //profiler_end("remove");

    return this;
};

Mikado.prototype.replace = function(node, item, view, index){

    //profiler_start("replace");

    if(typeof index === "undefined"){

        index = node["_idx"];
    }

    const tmp = this.create(item, view, index);

    if(SUPPORT_STORAGE) {

        if(this.store){

            this.store[index] = item;
        }
        else if(this.loose){

            tmp["_item"] = item;
        }
    }

    tmp["_idx"] = index;
    //node.replaceWith(tmp);
    this.root.replaceChild(tmp, node);
    this.dom[index] = tmp;

    //profiler_end("replace");

    return this;
};

/**
 * @param {Element|number} node
 * @param {*=} item
 * @param {*=} view
 * @param {number=} index
 */

Mikado.prototype.update = function(node, item, view, index){

    //profiler_start("update");

    //if(!this.static){

        /*
        if(typeof node === "number"){

            index = node;
            node = this.dom[node];
        }
        else if(typeof index === "undefined"){

            index = node["_idx"];
        }
        */

        if(SUPPORT_STORAGE){

            if(this.store){

                //if(item){

                    this.store[index] = item;
                // }
                // else{
                //
                //     item = this.store[index];
                // }
            }
            else if(this.loose){

                //if(item){

                    node["_item"] = item;
                // }
                // else{
                //
                //     item = node["_item"];
                // }
            }
        }

        this.update_path(node["_path"] || this.create_path(node), item, index, view);
    //}

    //profiler_end("update");

    return this;
};

function diff(store, item, diff){

    let changes = null;

    if(store){

        const keys = store["_keys"] || (store["_keys"] = Object.keys(store));
        const length = keys.length;

        for(let i = 0, key, val; i < length; i++){

            key = keys[i];
            val = store[key];

            if(item[key] !== val){

                if(diff){

                    (changes || (changes = {}))[key] = val;
                }
                else{

                    return true;
                }
            }
        }
    }

    return changes;
}

// resolve(nodes, "&") => root
// resolve(nodes, "&>") => root.firstElementChild
// resolve(nodes, "&>+") => root.firstElementChild.nextElementSibling
// resolve(nodes, "&>+:") => root.firstElementChild.firstChild
// resolve(nodes, "&>++") => root.firstElementChild.nextElementSibling.nextElementSibling

Mikado.prototype.create_path = function(root){

    //profiler_start("create_path");

    const length = this.vpath.length;
    const cache = {};
    const new_path = new Array(length);

    for(let x = 0; x < length; x++){

        const path = this.vpath[x];

        new_path[x] = cache[path] || resolve(root, path, cache);
    }

    root["_path"] = new_path;

    //profiler_end("create_path");

    return new_path;
};

function resolve(root, path, cache){

    //profiler_start("resolve");

    let tmp = "";

    for(let i = 0; i < path.length; i++){

        const current_path = path[i];

        tmp += current_path;

        if(cache[tmp]){

            root = cache[tmp];
        }
        else{

            if(current_path === ">"){

                root = root.firstElementChild;
            }
            else if(current_path === "+"){

                root = root.nextElementSibling;
            }
            else if(current_path === "|"){

                root = root.firstChild;
            }

            cache[tmp] = root;
        }
    }

    //profiler_end("resolve");

    return root;
}

let tmp_fn;

/**
 * @param {Template|Array<Template>} tpl
 * @param {number=} index
 * @param {string=} path
 * @param {Array=} dom_path
 * @returns {Element}
 */

Mikado.prototype.parse = function(tpl, index, path, dom_path){

    //profiler_start("parse");

    const node = /*tpl["t"] || index ?*/

        document.createElement(tpl["t"] || "div");
    //:
    //    document.createDocumentFragment();

    if(!index){

        index = 0;
        path = "&";
        tmp_fn = "";
        this.vpath = [];
        node["_path"] = dom_path = [];
    }

    const style = tpl["s"];
    const child = tpl["i"];
    let text = tpl["x"];
    let html = tpl["h"];
    const attr = tpl["a"];
    let class_name = tpl["c"];
    const js = tpl["j"];
    let path_length = this.vpath.length;
    let has_update = 0;
    let new_fn = "";

    if(js){

        new_fn += js + ";";
    }

    if(class_name){

        if(typeof class_name === "object"){

            new_fn += SUPPORT_CACHE && this.cache ?

                ".setClass(self," + class_name[0] + ")"
            :
                "self.className=" + class_name[0] + ";";

            this.vpath[path_length] = path;
            dom_path[path_length] = node;
            this.static = false;
            has_update++;
        }
        else{

            node.className = class_name;
        }
    }

    if(attr){

        const keys = Object.keys(attr);
        let has_dynamic_values;

        for(let i = 0; i < keys.length; i++){

            const key = keys[i];
            let value = attr[key];

            if(typeof value === "object"){

                new_fn += SUPPORT_CACHE && this.cache ?

                    ".setAttribute(self,'" + key + "'," + value[0] + ")"
                :
                    "self.setAttribute('" + key + "'," + value[0] + ");";

                has_dynamic_values = true;
                has_update++;
            }
            else{

                node.setAttribute(key, value);
            }

            if(SUPPORT_EVENTS && event_types[key]){

                this.listen(key);
            }
        }

        if(has_dynamic_values){

            this.vpath[path_length] = path;
            dom_path[path_length] = node;
            this.static = false;
        }
    }

    if(style){

        if(typeof style === "string"){

            node.style.cssText = style;
        }
        else if(style.length){

            new_fn += SUPPORT_CACHE && this.cache ?

                ".setCSS(self," + style[0] + ")"
            :
                "self.style.cssText=" + style[0] + ";";

            this.vpath[path_length] = path;
            dom_path[path_length] = node;
            this.static = false;
            has_update++;
        }
        else{

            const keys = Object.keys(style);
            let has_dynamic_values;

            for(let i = 0; i < keys.length; i++){

                const key = keys[i];
                const value = style[key];

                if(typeof value === "object"){

                    new_fn += SUPPORT_CACHE && this.cache ?

                        ".setStyle(self,'" + key + "'," + value[0] + ")"
                    :
                        "self.style.setProperty('" + key + "'," + value[0] + ");";

                    has_dynamic_values = true;
                    has_update++;
                }
                else{

                    node.style.setProperty(key, value);
                }
            }

            if(has_dynamic_values){

                this.vpath[path_length] = path;
                dom_path[path_length] = node;
                this.static = false;
            }
        }
    }

    if(!child){

        if(text){

            path += "|";

            const is_object = typeof text === "object";

            if(is_object){

                text = text[0];
            }

            let text_node = document.createTextNode(text);

            if(is_object){

                if(dom_path[path_length]){

                    concat_path(has_update, new_fn, path_length, SUPPORT_CACHE && this.cache);
                    new_fn = "";
                    path_length++;
                }

                new_fn += SUPPORT_CACHE && this.cache ?

                    ".setText(self," + text + ")"
                :
                    "self.nodeValue=" + text + ";";

                this.vpath[path_length] = path;
                dom_path[path_length] = text_node;
                this.static = false;
                has_update++;
            }

            node.appendChild(text_node);
        }
        else if(html){

            if(typeof html === "object"){

                html = html[0];
                new_fn += SUPPORT_CACHE && this.cache ?

                    ".setHTML(self, " + html + ")"
                :
                    "self.innerHTML=" + html + ";";

                this.vpath[path_length] = path;
                dom_path[path_length] = node;
                this.static = false;
                has_update++;
            }
            else{

                node.innerHTML = html;
            }
        }
    }

    concat_path(has_update, new_fn, path_length, SUPPORT_CACHE && this.cache);

    if(child){

        if(child.length){

            let tmp = ">";

            for(let i = 0; i < child.length; i++){

                if(i){

                    tmp += "+";
                }

                node.appendChild(this.parse(child[i], index + i + 1, path + tmp, dom_path));
            }
        }
        else{

            node.appendChild(this.parse(child, index + 1, path + ">", dom_path));
        }
    }

    if(!index && !this.static){

        // console.log('"use strict";var self;' + tmp_fn);
        // console.log(dom_path);
        // console.log(this.vpath);

        this.update_path = Function("p", "item", "index", "view", (

            tmp_fn ?

                '"use strict";var self;' + tmp_fn //+ ';'  // var root=p[0]
            :
                ""
        ));
    }

    //profiler_end("parse");

    return node;
};

function concat_path(has_update, new_fn, path_length, cache){

    if(has_update){

        if(has_update > 1){

            tmp_fn += "self=p[" + path_length + "];";

            if(SUPPORT_CACHE && cache){

                tmp_fn += "this" + new_fn + ";";
            }
            else{

                tmp_fn += new_fn;
            }
        }
        else{

            if(SUPPORT_CACHE && cache){

                tmp_fn += "this" + new_fn.replace(/self/g, "p[" + path_length + "]") + ";";
            }
            else{

                tmp_fn += "p[" + path_length + "]" + new_fn.substring(4); // cut "self"
            }
        }
    }
}

// TODO: when rendering on a modified template all states hast to reset to its default template values

if(SUPPORT_TRANSPORT){

    Mikado.prototype.load = function(file, callback){

        if(templates[file]){

            if(this instanceof Mikado){

                this.init(templates[file]);
            }

            callback && callback();
            return;
        }

        const self = this;
        const xhr = new XMLHttpRequest();

        xhr.overrideMimeType("application/json");
        xhr.open("GET", file, callback !== false);

        xhr.onload = function(){

            let json = this.responseText;

            if(json){

                let error;

                try{

                    const tpl = /** @type {Template} */ (JSON.parse(json));

                    Mikado.register(file, tpl);

                    if(self instanceof Mikado){

                        self.init(tpl);
                    }
                }
                catch(e){

                    error = e;
                }

                if(typeof callback === "function"){

                    callback(error);
                }
            }
        };

        xhr.send();
    };

    Mikado.load = Mikado.prototype.load;
}

/**
 * @param {Template=} template
 */

Mikado.prototype.unload = function(template){

    template || (template = this.template);

    if(template){

        templates[template/*["n"]*/] = null;
    }
};

Mikado.unload = Mikado.prototype.unload;