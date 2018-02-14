(function($){

    var $navigation     = null,
        $actionlist     = null,
        $header         = null,
        $content        = null,
        $requestContent = null,
        $requestText    = null,
        $actionContent  = null,
        $postRequestParam = null,
        $postRequestData = null,
        $window         = null,
        $leftSideMenu   = null,
        navTopOffset    = 0,
        localTimeZone   = null,
        extras          = {
            highlight : true,
            beautify  : {
                js  : true,
                css : true,
                html: true
            }
        };

    function init() {

        function cachedScript(url, options){
            options = $.extend(options || {}, {
                dataType: 'script',
                cache: true,
                url: url
            });
            
            return $.ajax(options);
        }

        $navigation = $('#navigation');
        $actionlist = $('#actionlist');
        $header = $('#header');
        $leftSideMenu = $('#leftSideMenu');

        $content = $('#content');

        $requestContent = $('#requestcontent');
        $requestText = $('#requesttext');
        $actionContent = $('#actioncontent');
        $postRequestParam = $('#postrequestparameters');
        $postRequestData = $('#postrequestdata');

        $window = $(window);

        navTopOffset = parseInt($navigation.css('top').replace(/px/,'')) + 2;

        var protocol = /^https?/.test(location.protocol) ? location.protocol : 'http:';
        $('<link href="'+protocol+'//xlt.xceptance.com/static/highlightjs/7.5/styles/xc.min.css" rel="stylesheet" type="text/css" />').appendTo('head');
        cachedScript(protocol+'//xlt.xceptance.com/static/highlightjs/7.5/highlight.min.js').fail(function(){
            extras.highlight = false;
        });
        cachedScript(protocol+'//xlt.xceptance.com/static/beautify/20140610-bdf3c2e743/beautify-min.js').fail(function(){
            extras.beautify.js = false;
        });
        cachedScript(protocol+'//xlt.xceptance.com/static/beautify/20140610-bdf3c2e743/beautify-html-min.js').fail(function(){
            extras.beautify.html = false;
        });
        cachedScript(protocol+'//xlt.xceptance.com/static/beautify/20140610-bdf3c2e743/beautify-css-min.js').fail(function(){
            extras.beautify.css = false;
        });

        localTimeZone = (function(){
            var dateString = new Date().toString(),
                zone = dateString.match(/\(([^\(]+)\)$/) || dateString.match(/(GMT[-+0-9]*)/);

            if (zone && zone.length > 1) {
                return zone[1];
            }
             
            return null;
        })();

        initEvents();

    }

    function initEvents() {
        var $highlight = $('#highlightSyntax'),
            $beautify  = $('#beautify');
        if(extras.highlight) {
            $highlight.click(function(){
                $requestText.each(function(i, e) {
                    hljs.highlightBlock(e)
                });
            }).removeAttr('disabled');
        }

        if(extras.beautify.js || extras.beautify.css || extras.beautify.html) {
            $beautify.click(function(){
                var s = $requestText.text();
                // CSS
                if($requestText.hasClass('css')) {
                    try {
                        s = css_beautify(s);
                    }
                    catch(e){}
                }
                // Javascript / JSON
                else if($requestText.hasClass('javascript')) {
                    try {
                        s = js_beautify(s);
                    }
                    catch(e){}
                }   
                // HTML
                else if($requestText.hasClass('html') || $requestText.hasClass('xml')) {
                    try {
                        s = html_beautify(s, {
                            preserve_newlines : false,
                            wrap_line_length : 0
                        });
                    }
                    catch(e){}
                }
                $requestText.text(s);
            }).removeAttr('disabled');
        }
    }

    function htmlEncode(value) {
        return $('<div/>').text(value).html();
    }

    function trim(str){
        str = str || '';
        return str.replace(/^\s+|\s+$/g, '');
    }

    function showAction(element) {
        var $element = $(element);
        // only show this action if not shown yet
        if (!$element.hasClass("active")) {
            // switch active state of navigation
            $(".active", $actionlist).removeClass("active");
            $element.addClass("active");

            // hide request content
            $requestContent.hide();

            // update and show action content iframe
            var data       = $element.data("json"),
                actionFile = data.fileName;
            if(actionFile) {
                $('#errorNoPage', $content).hide();
                $actionContent.attr('src', actionFile).show();
            }
            else {
                $actionContent.hide();
                $('#errorNoPage', $content).show();
            }
        }

        if(!$element.hasClass("current")) {
            $(".current", $actionlist).removeClass("current");
            $element.addClass("current");
        }
    }

    function expandCollapseAction(element) {
        // lazily create the requests
        if ($('ul.requests', element).length == 0) {
            createRequestsForAction(element);
        }

        // show/hide the requests
        $('ul.requests', element).slideToggle(200, resizeContent);

        // show/hide the requests
        $('.expander', element).toggleClass("expanded");
    }

    function createRequestsForAction(actionElement) {
        // build requests element
        var requests       = $('<ul class="requests"></ul>'),
            $actionElement = $(actionElement),
            action         = $actionElement.data('json'),
            actionRequests = action && action.requests || [];

        $actionElement.append(requests);

        // make sure, we do not see it building up
        requests.hide();

        // ok, we have to add the data from the json object to it
        for ( var i = 0, l = actionRequests.length; i < l; i++) {
            var request = actionRequests[i];
            var name = request.name;
            var requestClass = determineClass(request.mimeType, request.responseCode);
            var title = "[" + request.responseCode + "] " + request.url;

            var requestElement = $('<li class="request" title="' + htmlEncode(title) + '"><span class="name ' + htmlEncode(requestClass) 
                                    + '">' + htmlEncode(name) + '</span></li>');

            // store the json object for later
            requestElement.data("json", request)
            // attach listeners at action's name
            .children('.name')
            // setup onclick to show request content
            .click( function(event) {
                showRequest(this.parentNode);
                event.stopPropagation();
            })
            // setup ondblclick to do nothing
            .dblclick( function(event) {
                event.stopPropagation();
            });

            // insert into DOM
            requests.append(requestElement);
        }
    }

    function determineClass(mimeType, responseCode) {
        if (responseCode >= 400 || responseCode == 0) {
            return "httpError";
        }
        if (responseCode == 301 || responseCode == 302) {
            return "httpRedirect";
        }
        if (mimeType.indexOf("image/") == 0) {
            return "contentTypeImage";
        }
        if (mimeType == "text/css") {
            return "contentTypeCSS";
        }
        if (mimeType.indexOf("javascript") >= 0 || mimeType == "application/json") {
            return "contentTypeJS";
        }
        return "other";
    }

    function populateKeyValueTable(table, keyValueArray) {
        var isRequestHeaderTable = table.attr('id') === 'requestheaders',
            kvLength = keyValueArray.length;

        // Clear table contents first.
        table.empty();

        if (kvLength == 0) {
            var tableRow = $('<tr><td class="empty" colspan="2">None.</td></tr>');
            table.append(tableRow);
        }
        else {
            for(var i = 0; i < kvLength; i++) {
                var kv    = keyValueArray[i],
                    name  = htmlEncode(kv.name_),
                    value = kv.value_;
                if(isRequestHeaderTable && name.toLowerCase() === "cookie") {
                    value = value.split(";").map(function(e){
                        var idx = e.indexOf('='),
                            cname = idx < 0 ? e : e.substring(0, idx),
                            cvalue = idx < 0 || idx > e.length-1 ? '' : e.substring(idx+1);
                        return [ cname, cvalue ].map(trim).map(htmlEncode);
                    })
                    .sort(function(a,b){ return a=a[0].toLowerCase(),b=b[0].toLowerCase(),a<b?-1:b<a?1:0 })
                    .map(function(e){
                        return '<div class="crow"><span class="cname">'+e[0]+'</span><span class="csep">=</span><span class="cvalue">'+e[1]+'</span></div>';
                    })
                    .join('');
                }
                else {
                    value = htmlEncode(value);
                }

                table.append($('<tr><td class="key">' + name + '</td><td class="value">' + value + '</td></tr>'));
            }
        }

        return table;
    }

    function activateTab(element) {
        // switch active tab header
        $('.selected', $requestContent).removeClass('selected');
        $(element).addClass('selected');

        // switch active tab panel
        $('#requestcontent > div').hide();
        var index = $('#requestcontent li').index(element);

        $('#requestcontent > div').eq(index).show();
    }

    function showRequest(element) {
        $('#errorNoPage', $content).hide();

        var $element = $(element),
            $action = $element.parents(".action");
        // only show this request if not shown yet
        if (!$element.hasClass("active")) {
            // switch active state of navigation
            $(".active", $actionlist).removeClass("active");
            $element.addClass("active");

            // hide action content
            $actionContent.hide();
            $('#errorMessage').hide();

            // retrieve the request data
            var requestData = $element.data("json");

            // update content view tab based on the mime type
            if (requestData.mimeType.indexOf('image/') == 0) {
                // update the image
                $('#requestimage').attr('src', requestData.fileName).show();
                $requestText.hide();
            }
            else {
                $('#requestimage').hide();

                // check if we have no response or it was empty
                if(requestData._noContent) {
                    $requestText.text('').show();
                }
                else {
                    // update the text, load it from file
                    $.ajax({
                        url : requestData.fileName,
                        dataType : 'text',
                        success : function(data) {
                            var subMime  = requestData.mimeType.substring(requestData.mimeType.indexOf('/')+1),
                                lang = /x?html/.test(subMime) ? 'html' : /xml/.test(subMime) ? 'xml' : /(javascript|json)$/.test(subMime) ? 'javascript' : /^css$/.test(subMime) ? 'css' : undefined,
                                canBeautify = lang && (( /(ht|x)ml/.test(lang) && extras.beautify.html ) || ( 'javascript' === lang && extras.beautify.js) || ('css' === lang && extras.beautify.css));

                            $('#beautify').prop('disabled', !canBeautify);

                            $requestText.text(data).removeClass().addClass(lang ? ('language-'+lang+' '+lang) : 'text').show();
                        },
                        error : function(xhr,textStatus,errorThrown) {
                            $requestText.hide();
                            $('#errorMessage .filename').text(requestData.fileName);
                            $('#errorMessage').show();
                            centerErrorMessage();
                        }
                    });
                }
            }

            // update the request information tab
            $("#url").empty().append($('<a>').attr('href', requestData.url).attr('target','_blank').text(requestData.url));
            $("#requestmethod").text(requestData.requestMethod);

            // start time
            var startDate = new Date(requestData.startTime);
            $("#time-start-gmt").text(formatDate(startDate, true));
            $("#time-start-local").text(formatDate(startDate));

            // headers and parameters
            populateKeyValueTable($("#requestheaders"), requestData.requestHeaders);
            populateKeyValueTable($("#requestparameters"), requestData.requestParameters);
            populateKeyValueTable($("#queryparameters"), requestData.queryParameters);

            // POST parameters should be displayed for POST requests only.
            $postRequestData.hide();
            var bodyRaw = requestData.requestBodyRaw || '';
            if(requestData.requestMethod === "POST") {
                $postRequestParam.show();

                if(bodyRaw.length > 0) {
                    $('textarea', $postRequestData).text(bodyRaw);
                    $postRequestData.show();
                }
            }
            else {
                $postRequestParam.hide();
            }

            // update the request content tab
            $("#requestbody").text(requestData.requestBodyRaw || '');

            // update the response information tab
            $("#status").text(requestData.status);
            $("#loadtime").text(requestData.loadTime + " ms");
            populateKeyValueTable($("#responseheaders"), requestData.responseHeaders);

            // finally show the request content
            $requestContent.show();
        }

        if(!$action.hasClass("current")) {
            $(".current", $actionlist).removeClass("current");
            $action.addClass("current");
        }
    }

    function formatDate(date, toGmt) {
        var d  = moment(date),
            tz = toGmt ? "GMT" : localTimeZone;

        if(toGmt) {
            d.utc();
        }

        var result = d.format();

        result = result.replace("T", " ");
        result = result.replace(/\+.*/, ("."+d.format("SSS")));

        if(tz) {
            result = result + " [" + tz + "]";
        }

        return result;
    }
    


    function centerErrorMessage() {
        var content = $content,
            height  = Math.floor(0.333 * content.height()),
            width   = content.width() - 700;

        $('#errorMessage, #errorNoPage').css({ position: 'absolute', left: width/2 + 'px', top: height/2 + 'px' });
    }

    /*
     * Resize the action content area
     */
    function resizeContent() {
        var height = $window.height(), // get the current viewport size
            leftPos = parseInt($content.css('left').replace(/px/,'')); // and left position of content area

        // resize navigation
        resizeNav(height);
        // .. and content area
        $content.height(height).width($window.width()-leftPos);

        // finally, center error message
        centerErrorMessage();
    }

    function resizeNav(winHeight) {
        winHeight = winHeight || $window.height();
        $actionlist.height(winHeight-navTopOffset-15);
        $leftSideMenu.height(winHeight);
        $('.vsplitbar').height(winHeight);
    }

    function preprocessRequests(requests) {
        function kvSort(a,b) {
            var aName = a.name_, bName = b.name_;
            if(aName < bName) return -1;
            if(aName > bName) return 1;
            return 0;
        }

        function checkHasNoContent(rqData) {
            rqData = rqData || {};

            var headers  = rqData.responseHeaders || [],
                respCode = rqData.responseCode || 0;

            // check for redirect (response file is empty and will cause an error when trying to be read in)
            // and zero content length response header as well
            if(/30[0-8]|20[45]/.test(respCode)) {
                return true;
            }

            for(var i = 0, l = headers.length, h; i < l; i++) {
                h = headers[i];
                if(h.name_ === "Content-Length") {
                    return h.value_ === "0";
                }
            }

            return false;
        }

        function decodeQueryParam(param) {
            param = param || '';

            var kv = param.split('=').map(decodeQPNameOrValue),
                r  = null;
             if(kv && kv.length > 0) {
                 r = {
                     name_  : kv[0],
                     value_ : kv.length > 1 ? kv.slice(1).join('=') : ''
                 };
             }

             return r;
        }
        
        function decodeQPNameOrValue(nameOrValue) {
            nameOrValue = (nameOrValue || '').replace(/[+]/g, ' ');
            try {
                nameOrValue = decodeURIComponent(nameOrValue);
            }
            catch(e) {
                if(typeof(window.unescape) === 'function') {
                    try {
                        nameOrValue = window.unescape(nameOrValue);
                    }
                    catch(e2){}
                }
            }
            return nameOrValue;
        }

        function parseParams(str) {
            str = str || '';

            var params = [];
            if(str.length > 0) {
                params = str.split('&')
                // transform into decoded name/value pairs
                .map(decodeQueryParam)
                // filter out nulls and empty names
                .filter(function(e) { 
                    return !!e && e.name_.length;
                })
                // and sort it
                .sort(kvSort);
            }
            return params;
        }

        function parsePostBodyIfNecessary(rqData) {
            rqData = rqData || {};

            var body = rqData.requestBodyRaw || '',
                method = rqData.requestMethod,
                params = rqData.requestParameters,
                isUrlEncoded = rqData.requestHeaders.some(function(e){
                    var n = e.name_.toLowerCase(),
                        v = e.value_.toLowerCase();
                    return n === 'content-type' && v === 'application/x-www-form-urlencoded';
                });
            if(method === 'POST' && isUrlEncoded && body.length > 0) {
                body = body.split('\n');
                body = body[body.length-1];

                parseParams(body).forEach(function(p){
                    params.push(p)
                });
            }
        }

        var l = requests && requests.length;
        for(var i = 0, r; i < l; i++) {
            r = requests[i];
            r._noContent = checkHasNoContent(r);
            parsePostBodyIfNecessary(r);
            r.requestHeaders.sort(kvSort);
            r.responseHeaders.sort(kvSort);
            r.requestParameters.sort(kvSort);

            // parse request query string
            var url = r.url || '',
                idx = url.indexOf('?'),
                hIdx = url.indexOf('#'),
                params = [];
            if(idx > 0 && (hIdx < 0 || idx < hIdx)) {
                var qs = url.substring(idx+1, (hIdx < 0 ? url.length : hIdx));
                params = parseParams(qs);
            }

            params.sort(kvSort);
            r.queryParameters = params;
        }
    }

    function loadJSON() {
        // get the json data from the external file
        var transaction = jsonData,
            actions     = transaction.actions;

        document.title = transaction.user + " - XLT Result Browser";

        var $actions = $('<ul class="actions"></ul>');
        $actions.hide();

        for ( var i = 0, l = actions.length; i < l; i++) {
            var action = actions[i];
            var $actionElement = $('<li class="action" title="Double-click to show/hide this action\'s requests."><span class="expander" title="Single-click to show/hide this action\'s requests."/><span class="name">' + htmlEncode(action.name) + '</span></li>');

            // store the json object for later
            $actionElement.data("json", action)
            // attach listeners at action's name
            .children('.name')
            // setup onclick to show action content
            .click( function(event) {
                showAction(this.parentNode);
            })
            // setup ondblclick to show/hide requests
            .dblclick( function(event) {
                expandCollapseAction(this.parentNode);
            });

            // setup click to show/hide requests
            $('.expander', $actionElement).click( function(event) {
                expandCollapseAction(this.parentNode);
            })
            // setup ondblclick to do nothing since a dblclick causes the following event sequence to be dispatched:
            // dblclick ::= click -> click -> dblclick
            .dblclick( function(event) {
                event.stopPropagation(); 
            });

            // insert into DOM
            $actions.append($actionElement);

            // preprocess action's requests
            preprocessRequests(action.requests);
        }

        // insert the actions into the DOM
        $actionlist.append($actions);

        // show them
        $actions.slideDown(200);
        
        // activate highlighter
        $('#highlightSyntax').unbind("click").click(function() {
            $('#requesttext').each(function(i, e) {hljs.highlightBlock(e)})
        });
    }
    

    // the on load setup
    $(document).ready( function() {
        init();

        var $progress = $('#progressmeter');

        try {
            $progress.show(100);

            loadJSON();

            // take care of the size of the content display area to
            // adjust it to the window size
            $(window).bind("resize", function(event) {
                resizeContent();
            });

            // setup onclick for the tabbed panel in the request content
            // area
            $('.tabs-nav li', $requestContent).click( function(event) {
                activateTab(this);
            });

            $('#container').splitter({ type: "v", sizeLeft: 275 });

            // resize in the beginning already
            resizeContent();

            // activate first request-tab
            activateTab($('.tabs-nav li', $requestContent).get(0));

            // open the first action
            $('li.action > span.name', $actionlist).eq(0).click();
        }
        finally {
             $progress.hide(200);
        }
    });

})(jQuery);
