define([
    'system',
    
    'input/speechRecog',
    
    'lib/youtube-1.0', 
    
    'jquery',
    'jquery-draggable'
], function (system, speechRecog, youtube, $) {
    
    function setThumbnailHeightByAspectRatio() {
        var activity = $('#youtubeActivity');
        
        var outerWidth = $('.resultItemView i', activity).outerWidth();
        var outerHeight = Math.round((outerWidth / 16) * 9);
        
        $('.resultItemView i', activity).height(outerHeight);
    }
    
    function resultItemView(data) {
        var activity = $('#youtubeActivity');
        
        $('.resultItemView h1', activity).text(data.title);
        $('.resultItemView p', activity).text(data.desc);
        $('.resultItemView i', activity).css('background-image', 'url(' + data.thumb + ')');
        
        setThumbnailHeightByAspectRatio();
    }
    
    function hoverListItem() {
        var contents = $(this).data('contents');
        
        resultItemView(contents);
    }
    
    function queryResult(data) {
        var activity = $('#youtubeActivity');
        
        $('.queryResult', activity).show();
        $('.queryResult ul', activity).css('left', 0).empty();
        
        resultItemView(data.items[0]);
        
        for (var n = 0; n < data.items.length; ++n) {
            
            var contents = data.items[n];
            
            $([
                '<li>',
                    '<h1>', contents.title, '</h1>',
                    '<img src="', contents.thumb, '">',
                '</li>'
            ].join(''))
                .data('contents', contents)
                .hover(hoverListItem)
                //.click(clickListItem)
                .appendTo('#youtubeActivity .queryResult ul');
        }
    }
    
    function registSearchCommand() {
        var SUFFIX = [
            '찾아줘',
            '찾아봐',
            '찾아',
            '검색해줘',
            '검색해',
            '검색',
        ];

        speechRecog.addEventListener(
            '^(.+?)(' + SUFFIX.join('|') + ')', 
            function (isFinal, transcript, matches) {

                if ( ! system.isForegroundActivity('youtubeActivity')) {
                    return false;
                }

                if ( ! isFinal) {
                    return false;
                }

                var activity = $('#youtubeActivity');

                $('.queryForm input[type="search"]', activity).val(matches[1]);
                $('.queryForm', activity).submit();

                return true;
            }
        )
    }
    
    function __init__() {
        var activity = $('#youtubeActivity');
        
        $('.queryResult ul', activity).draggable({ axis : 'x' });

        $('.queryForm', activity)
            .center()
            .submit(function (event) {
                event.preventDefault();
                event.stopPropagation();
            
                $(this)
                    .fadeOut(
                        1000,
                        function () {
                            var query = $('.queryForm input[type="search"]', activity).val();
                            
                            youtube(query, queryResult);
                        }
                    )
            });
    }
 
    return {
        
        id: 'youtubeActivity',
        title: '유튜브',
        icon: 'ic_youtube.png',
        layoutHTML: 'activity_youtube.html',
        
        init: function () {
            console.log('youtube init');
            
            __init__();
            
            registSearchCommand();
        },
        
        resume: function () {
            console.log('youtube resume');
            
            var activity = $('#youtubeActivity');
                                 
            $('.queryResult', activity).hide(); 
            $('.queryForm input[type="search"]', activity).val('');
            $('.queryForm', activity).show();
        },
        
        pause: function () {
            console.log('youtube pause');
        },
        
        destroy: function () {
            console.log('youtube destroy');
        },
    };
});
