define([ 
    'system',
    
    'jquery',
    
    'input/speechRecog',
    'output/speechUtterance',
],function (system, $, speechRecog, speechUtter) {
    
    function registCommands() {
        var REGEX_EXECUTE = '(.+?)(보여줘|띄워|꺼내|열어|실행|켜줘|켜저|켜봐|켜바)';
        var REGEX_WIKI = '(.+?)(뭐지|뭐냐|뭐야|찾아|검색)';
        var REGEX_GO_HOME = '(홈으로|홈화면|바탕화면|메인화면|메인으로)';
        var REGEX_REFRESH = '(새로고침)';
         
        speechRecog.addEventListener(
            REGEX_GO_HOME,
            function (isFinal, transcript, matches) {
                if ( ! isFinal) {
                    return false;
                }
                
                system.startActivity('homeActivity');
                return true;
            }
        );
         
        speechRecog.addEventListener(
            REGEX_REFRESH,
            function (isFinal, transcript, matches) {
                if ( ! isFinal) {
                    return false;
                }
                
                window.location.reload();
                return true;
            }
        );

        speechRecog.addEventListener(
            REGEX_EXECUTE,
            function (isFinal, transcript, matches) {
                if ( ! isFinal) {
                    return false;
                }

                var activity = matches[1].replace(/\s/g, '').toLowerCase(); 

                switch (activity) {
                    case '모션학습': system.startActivity('tutorialActivity'); break;
                    case '일정': 
                    case '달력':     system.startActivity('calendarActivity'); break;
                    case '뉴스':     system.startActivity('newsActivity'); break;
                    case '날씨':     system.startActivity('weatherActivity'); break;
                    case '유튜브': 
                    case '유투브':   system.startActivity('youtubeActivity'); break;
                    case '카메라': 
                    case '사진기':   system.startActivity('cameraActivity'); break;
                    case '시계':     system.startActivity('clockActivity'); break;
                    default:         return false;
                }
                
                return true;
            }
        );

        speechRecog.addEventListener(
            REGEX_WIKI, 
            function (isFinal, transcript, matches) {
                if (system.isForegroundActivity('youtubeActivity')) {
                    return false;
                }

                if ( ! isFinal) {
                    return false;
                }

                var url = window.URL.createEndpointURL('wiki', { 'q' : matches[1] });
                var handler = function (data) {
                    if ( ! data || data.length <= 0) {
                        speechUtter.speak('적절한 답변을 찾지 못하였습니다.');
                        return;
                    }

                    var data = data[0].replace(/\([^\)]+\)/gi, "")
                                      .replace(/\[[^\]]+\]/gi, "")
                                      .replace(/\{[^\}]+\}/gi, "")
                                      .replace(/『[^』]+』/gi, "")
                                      .replace(/《[^》]+》/gi, "")
                                      .replace(/「[^」]+」/gi, "")
                                      .replace(/〈[^〉]+〉/gi, "");

                    speechUtter.speak(data);
                }

                $.getJSON(url, handler);
                return true;
            }
        );
    }
    
    return {
        
        id : 'homeActivity',
        title : '홈 화면',
        icon : 'ic_home.png',
        layoutHTML : 'activity_home.html',
        
        init : function () {
            console.log('home init');
            
            system.attachWidget('notifyWidget');
            system.attachWidget('clockWidget');
            system.attachWidget('menuWidget');
            system.attachWidget('skeletonWidget');
            system.attachWidget('newsWidget');
            system.attachWidget('transcriptWidget');
            system.attachWidget('weatherWidget');
            
            registCommands();
        },
        
        resume : function () {
            console.log('home resume');
            
            var clockWidget = system.getWidget('clockWidget');
            if (clockWidget) {
                clockWidget.focus();
            }
        },
        
        pause : function () {
            console.log('home pause');
            
            var clockWidget = system.getWidget('clockWidget');
            if (clockWidget) {
                clockWidget.blur();
            }
        },
        
        destroy : function () {
            console.log('home destroy');
        },
    }
})