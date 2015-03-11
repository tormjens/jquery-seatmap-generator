jQuery.fn.dragToSelect = function (conf) {
    var c = typeof(conf) == 'object' ? conf : {};

    // Config
    var config = jQuery.extend({
        className:        'jquery-drag-to-select', 
        activeClass:    'active', 
        disabledClass:    'disabled', 
        selectedClass:    'selected', 
        scrollTH:        10, 
        percentCovered:    25, 
        selectables:    false, 
        autoScroll:        false, 
        selectOnMove:    false, 
        onShow:            function () {return true;}, 
        onHide:            function () {return true;}, 
        onRefresh:        function () {return true;}
    }, c);

    var realParent    = jQuery(this);
    var parent        = realParent;

    do {
        if (/auto|scroll|hidden/.test(parent.css('overflow'))) {
            break;
        }
        parent = parent.parent();
    } while (parent[0].parentNode);
    // Does user want to disable dragToSelect
    if (conf == 'disable') {
        parent.addClass(config.disabledClass);
        return this;
    }
    else if (conf == 'enable') {
        parent.removeClass(config.disabledClass);
        return this;
    }

    var parentOffset    = parent.offset();
    var parentDim        = {
        left:    parentOffset.left, 
        top:    parentOffset.top, 
        width:    parent.width(), 
        height:    parent.height()
    };

    // Current origin of select box
    var selectBoxOrigin = {
        left:    0, 
        top:    0
    };

    // Create select box
    var selectBox = jQuery('<div/>')
                        .appendTo(parent)
                        .attr('class', config.className)
                        .css('position', 'absolute');

    // Shows the select box
    var showSelectBox = function (e) {
        if (parent.is('.' + config.disabledClass)) {
            return;
        }

        selectBoxOrigin.left    = e.pageX - parentDim.left + parent[0].scrollLeft;
        selectBoxOrigin.top        = e.pageY - parentDim.top + parent[0].scrollTop;

        var css = {
            left:        selectBoxOrigin.left + 'px', 
            top:        selectBoxOrigin.top + 'px', 
            width:        '1px', 
            height:        '1px'
        };
        selectBox.addClass(config.activeClass).css(css);

        config.onShow();
    };

    // Refreshes the select box dimensions and possibly position
    var refreshSelectBox = function (e) {
        if (!selectBox.is('.' + config.activeClass) || parent.is('.' + config.disabledClass)) {
            return;
        }

        var left        = e.pageX - parentDim.left + parent[0].scrollLeft;
        var top            = e.pageY - parentDim.top + parent[0].scrollTop;
        var newLeft        = left;
        var newTop        = top;
        var newWidth    = selectBoxOrigin.left - newLeft;
        var newHeight    = selectBoxOrigin.top - newTop;

        if (left > selectBoxOrigin.left) {
            newLeft        = selectBoxOrigin.left;
            newWidth    = left - selectBoxOrigin.left;
        }

        if (top > selectBoxOrigin.top) {
            newTop        = selectBoxOrigin.top;
            newHeight    = top - selectBoxOrigin.top;
        }

        var css = {
            left:    newLeft + 'px', 
            top:    newTop + 'px', 
            width:    newWidth + 'px', 
            height:    newHeight + 'px'
        };
        selectBox.css(css);

        config.onRefresh();
    };

    // Hides the select box
    var hideSelectBox = function (e) {
        if (!selectBox.is('.' + config.activeClass) || parent.is('.' + config.disabledClass)) {
            return;
        }
        if (config.onHide(selectBox) !== false) {
            selectBox.removeClass(config.activeClass);
        }
    };

    // Scrolls parent if needed
    var scrollPerhaps = function (e) {
        if (!selectBox.is('.' + config.activeClass) || parent.is('.' + config.disabledClass)) {
            return;
        }

        // Scroll down
        if ((e.pageY + config.scrollTH) > (parentDim.top + parentDim.height)) {
            parent[0].scrollTop += config.scrollTH;
        }
        // Scroll up
        if ((e.pageY - config.scrollTH) < parentDim.top) {
            parent[0].scrollTop -= config.scrollTH;
        }
        // Scroll right
        if ((e.pageX + config.scrollTH) > (parentDim.left + parentDim.width)) {
            parent[0].scrollLeft += config.scrollTH;
        }
        // Scroll left
        if ((e.pageX - config.scrollTH) < parentDim.left) {
            parent[0].scrollLeft -= config.scrollTH;
        }
    };

    // Selects all the elements in the select box's range
    var selectElementsInRange = function () {
        if (!selectBox.is('.' + config.activeClass) || parent.is('.' + config.disabledClass)) {
            return;
        }

        var selectables        = realParent.find(config.selectables);
        var selectBoxOffset    = selectBox.offset();
        var selectBoxDim    = {
            left:    selectBoxOffset.left, 
            top:    selectBoxOffset.top, 
            width:    selectBox.width(), 
            height:    selectBox.height()
        };

        selectables.each(function (i) {
            var el            = $(this);
            var elOffset    = el.offset();
            var elDim        = {
                left:    elOffset.left, 
                top:    elOffset.top, 
                width:    el.width(), 
                height:    el.height()
            };

            if (percentCovered(selectBoxDim, elDim) > config.percentCovered) {
                el.addClass(config.selectedClass);
            }
            else {
                el.removeClass(config.selectedClass);
            }
        });
    };

    // Returns the amount (in %) that dim1 covers dim2
    var percentCovered = function (dim1, dim2) {
        // The whole thing is covering the whole other thing
        if (
            (dim1.left <= dim2.left) && 
            (dim1.top <= dim2.top) && 
            ((dim1.left + dim1.width) >= (dim2.left + dim2.width)) && 
            ((dim1.top + dim1.height) > (dim2.top + dim2.height))
        ) {
            return 100;
        }
        // Only parts may be covered, calculate percentage
        else {
            dim1.right        = dim1.left + dim1.width;
            dim1.bottom        = dim1.top + dim1.height;
            dim2.right        = dim2.left + dim2.width;
            dim2.bottom        = dim2.top + dim2.height;

            var l = Math.max(dim1.left, dim2.left);
            var r = Math.min(dim1.right, dim2.right);
            var t = Math.max(dim1.top, dim2.top);
            var b = Math.min(dim1.bottom, dim2.bottom);

            if (b >= t && r >= l) {
            /*    $('<div/>').appendTo(document.body).css({
                    background:    'red', 
                    position:    'absolute',
                    left:        l + 'px', 
                    top:        t + 'px', 
                    width:        (r - l) + 'px', 
                    height:        (b - t) + 'px', 
                    zIndex:        100
                }); */

                var percent = (((r - l) * (b - t)) / (dim2.width * dim2.height)) * 100;

            //    alert(percent + '% covered')

                return percent;
            }
        }
        // Nothing covered, return 0
        return 0;
    };

    // Do the right stuff then return this
    selectBox
        .mousemove(function (e) {
            refreshSelectBox(e);

            if (config.selectables && config.selectOnMove) {            
                selectElementsInRange();
            }

            if (config.autoScroll) {
                scrollPerhaps(e);
            }

            e.preventDefault();
        })
        .mouseup(function(e) {
            if (config.selectables) {            
                selectElementsInRange();
            }

            hideSelectBox(e);

            e.preventDefault();
        });

    if (jQuery.fn.disableTextSelect) {
        parent.disableTextSelect();
    }

    parent
        .mousedown(function (e) {
            // Make sure user isn't clicking scrollbar (or disallow clicks far to the right actually)
            if ((e.pageX + 20) > jQuery(document.body).width()) {
                return;
            }

            showSelectBox(e);

            e.preventDefault();
        })
        .mousemove(function (e) {
            refreshSelectBox(e);

            if (config.selectables && config.selectOnMove) {            
                selectElementsInRange();
            }

            if (config.autoScroll) {
                scrollPerhaps(e);
            }

            e.preventDefault();
        })
        .mouseup(function (e) {
            if (config.selectables) {            
                selectElementsInRange();
            }

            hideSelectBox(e);

            e.preventDefault();
        });

    // Be nice
    return this;
};