define(['jquery'], function ($) {
    
    var activities = new Array();
    
    activities.indexOf = function (id) {
        for (var n = 0; n < this.length; ++n) {
            if (this[n].id === id) {
                return n;
            }
        }
        
        return -1;
    }
    
    activities.contains = function (id) {
        return this.indexOf(id) !== -1;
    }
    
    activities.remove = function (id) {
        var n = this.indexOf(id);
        
        this.splice(n, 1);
    }
    
    function camelize(str) {
        return str.replace(/[_.-](\w|$)/g, function (_, x) {
            return x.toUpperCase();
        });
    }
    
    function startActivity(activityId, data) {
        if (activities.length > 0 && activities[activities.length - 1].id === activityId) {
            return;
        }
        
        var isCreated = require.defined('activity/' + activityId);
        
        require(['activity/' + activityId], function (activity) {
            
            var layoutLoaded = function () {
                var rootLayout = $(activity.rootLayout);
                if ( ! isCreated) {
                    rootLayout.appendTo('body');
                    
                    if (typeof(activity.init) === 'function') {
                        activity.init();
                    }
                }
                
                rootLayout.css('z-index', 1000);

                if (typeof(activity.resume) === 'function') {
                   activity.resume(data);
                }

                if (activities.length > 0) {
                    var parentActivity = activities[activities.length - 1];
                    if (typeof(parentActivity.pause) === 'function') {
                        parentActivity.pause();
                    }

                    $(parentActivity.rootLayout).css('z-index', -1);

                    activity.parentActivity = parentActivity;
                }

                activities.push(activity);
            }
            
            if ( ! isCreated) {
                var rootLayout = $(document.createElement('div'))
                                        .load('res/layout/' + activity.layoutHTML, layoutLoaded)
                                        .attr('id', camelize(activityId))
                                        .addClass('activity');
                    
                activity.id = activityId;
                activity.rootLayout = rootLayout[0];    
                return;
            }
            
            activities.remove(activityId);
        });
    }
    
    function finishActivity(activityId) {
        if (typeof(activityId) === 'undefined' && activities.length > 1) {
            activityId = activities[ activities.length - 1 ].id;
        }
        
        if (activityId === 'home') {
            throw new Error('홈 화면은 닫을 수 없습니다.');
        }
        
        if ( ! require.defined('activity/' + activityId)) {
            throw new Error(activityId + ' 이 실행되어 있지않음');
        }
        
        require(['activity/' + activityId], function (activity) {
            var parentActivity = activity.parentActivity;
            if (parentActivity) {
                $(parentActivity.rootLayout).css('z-index', 1000);
                
                if (typeof(parentActivity.resume) === 'function') {
                    parentActivity.resume();
                }
            }
            
            if (typeof(activity.pause) === 'function') {
                activity.pause(); 
            }
            
            $(activity.rootLayout).remove();
            
            require.undef(activityId);
            
            if (typeof(activity.destroy) === 'function') {
                activity.destroy();
            }
        });
    }
    
    function attachWidget(widgetId) {
        if (require.defined('widget/' + widgetId)) {
            return;
        }
        
        require(['widget/' + widgetId], function (widget) {
            var rootLayout = $(document.createElement('div'))
                                    .addClass('widget')
                                    .attr('id', camelize(widgetId));
                            
            var layoutLoaded = function () {
                if (widget.alwaysOnTop === true) {
                    rootLayout.appendTo('body');
                } else {
                    var homeActivity = activities[ activities.indexOf('home') ];

                    rootLayout.appendTo(homeActivity.rootLayout);
                }

                rootLayout.css('z-index', 9999);

                widget.id = widgetId;
                widget.rootLayout = rootLayout[0]; 

                if (typeof(widget.init) === 'function') {
                    widget.init();
                }

                updateWidget(widgetId);
            };
            
            rootLayout.load('res/layout/' + widget.layoutHTML, layoutLoaded);      
        });
    }
    
    function updateWidget(widgetId) {
        if ( ! require.defined('widget/' + widgetId)) {
            throw new Error(widgetId + ' 을 찾을수 없습니다.');
        }
        
        require(['widget/' + widgetId], function (widget) {
            
            if (typeof(widget.update) === 'function') {
                widget.update(); 
            }
        });
    }
    
    return {
        
        startActivity : startActivity,
        finishActivity : finishActivity,
        
        attachWidget : attachWidget,
        updateWidget : updateWidget,
        
        init : function () {
            startActivity('home_activity');
        }
    };
})