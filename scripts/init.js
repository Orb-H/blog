var ps = [];

function item_init() {
    var headings = document.querySelectorAll(".post-content > h3,h4,h5,h6");
    var toc = document.getElementById("toc");
    var cur_toc = toc;
    var depth = 0;
    var nums = [0, 1, 1, 1];
    var article = document.getElementsByTagName("article")[0];

    for(var i = 0; i < headings.length; i++) {
        var element = headings[i];
        var new_depth = parseInt(element.tagName.substr(1)) - 3;
        var prefix = "";
        var prefix2 = "";

        if (new_depth < depth) {
            nums[new_depth]++;
            for (var j = 0; j <= new_depth; j++) {
                prefix += nums[j] + ".";
            }
            for (var j = depth; j > new_depth; j--) {
                cur_toc = cur_toc.parentElement.parentElement;
            }
        } else if (new_depth == depth) {
            nums[depth]++;
            for (var j = 0; j <= depth; j++) {
                prefix += nums[j] + ".";
            }
        } else {
            for (var j = depth + 1; j <= new_depth; j++) {
                nums[j] = 1;
            }
            for (var j = 0; j <= new_depth; j++) {
                prefix += nums[j] + ".";
            }
            cur_toc.lastElementChild.append(document.createElement("ul"));
            cur_toc = cur_toc.lastElementChild.lastElementChild;
        }

        prefix2 = prefix.substr(0, prefix.length - 1);
        var li = document.createElement("li");
        li.innerHTML = "<a href=\"#s-" + prefix2 + "\">" + prefix + "</a> " + element.textContent.replace("]#[", "");
        cur_toc.append(li);

        element.innerHTML = "<a href=\"#toc\" id=s-" + prefix2 + ">" + prefix + "</a> " + element.innerHTML; 
        depth = new_depth;
    }

    setTimeout(function() {
        if (location.href.indexOf("#") != -1) {
            document.getElementById(location.href.split("#")[1]).scrollIntoView();
        }
    }, 500);
}

if (document.readyState !== 'loading') {
    item_init();
} else {
    window.addEventListener('DOMContentLoaded', item_init);
}