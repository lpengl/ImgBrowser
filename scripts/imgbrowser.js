
(function ($) {
    var ImgBrowser = function (options) {
        this.options = $.extend({}, ImgBrowser.defaults, options);

        this.init();
    };

    ImgBrowser.defaults = {

    };

    ImgBrowser.throttle = function (fn, context, delay) {
        return function () {
            var args = arguments;
            clearTimeout(fn.timerId);
            fn.timerId = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    };

    ImgBrowser.prototype.init = function () {
        this.build();
        this.enable();
    };

    ImgBrowser.prototype.build = function () {
        var self = this;
        $('<div id="imgbrowser" class="imgbrowser"><a href="" class="ib-close"><img src="images/icons/close.png" alt="close" /></a><div class="ib-main-container"><div class="ib-container"><div class="ib-wrapper"><img src="images/1.jpg" alt="" /></div></div><div class="ib-thumb-container"><a href="" class="thumb-prev"></a><a href="" class="thumb-next"></a><div class="ib-thumb-list-container"><ul id="ib-thumb-list" class="ib-thumb-list"></ul></div></div></div></div>').appendTo($("body"));

        this.$imgbrowser = $("#imgbrowser");
        this.$imageContainer = this.$imgbrowser.find(".ib-container");
        this.$imageWrapper = this.$imgbrowser.find(".ib-wrapper");
        this.$thumbContainer = this.$imgbrowser.find(".ib-thumb-container");
        this.$thumbList = this.$imgbrowser.find(".ib-thumb-list");

        this.$imgbrowser.find(".ib-close").on("click", function () {
            self.end();
            return false;
        });

        this.$imgbrowser.find(".thumb-prev").on("click", function () {
            if (self.currentIndex > 0) {
                self.changeImg(self.currentIndex - 1);
            }
            return false;
        });

        this.$imgbrowser.find(".thumb-next").on("click", function () {
            if (self.currentIndex < self.totalItems - 1) {
                self.changeImg(self.currentIndex + 1);
            }
            return false;
        });

        this.$thumbList.on("click", function (event) {
            var clickedIndex = $(this).find("li").index($(event.target).closest("li"));
            self.changeImg(clickedIndex);
            return false;
        });
    };

    ImgBrowser.prototype.calculateMaxSize = function () {
        var $window = $(window),
            windowHeight = $window.height();

        this.options.maxWidth = this.$imageContainer.width();
        this.options.maxHeight = $window.height() -
            (parseInt(this.$imageWrapper.css("outlineWidth"), 10) * 2) -
            (parseInt(this.$thumbContainer.css("marginTop"), 10) * 2) -
            this.$thumbContainer.height();
    };

    ImgBrowser.prototype.enable = function () {
        var self = this;

        $(document).on("click", "ul[data-imgbrowser]", function (event) {
            self.start($(event.target), $(event.currentTarget));
            return false;
        });

        $(window).on("resize", ImgBrowser.throttle(function () {
            this.calculateMaxSize();
            this.sizeAndLocateImg();
        }, self, 100));
    };

    ImgBrowser.prototype.start = function ($target, $currentTarget) {
        $("body").addClass("imgbrowser-disable-scrolling");

        var $targetLi = $target.closest("li");
        $targetLi.addClass("imgbrowser-current");

        this.initThumbList($currentTarget);
        this.changeImg(this.currentIndex, true);
        this.$imgbrowser.fadeIn();
        this.calculateMaxSize();

        $targetLi.removeClass("imgbrowser-current");
    };

    ImgBrowser.prototype.initThumbList = function ($currentTarget) {
        var self = this;
        var $tempWrapper = $("<ul></ul>");
        var $listItems = $currentTarget.find("li");

        this.currentIndex = 0;
        this.totalItems = $listItems.length;
        this.imgSet = [];

        $listItems.each(function (index) {
            var $current = $(this),
                $img = $current.find("img"),
                lnkHref = $current.find("a").attr("href"),
                imgSrc = $img.attr("src"),
                imgAlt = $img.attr("alt");

            var $listItem = $('<li><a href=""><img src="" alt="" /></a></li>');
            $listItem
                .find("a").attr("href", lnkHref).end()
                .find("img").attr({ src: imgSrc, alt: imgAlt });

            if ($current.hasClass("imgbrowser-current")) self.currentIndex = index;

            $tempWrapper.append($listItem);
            self.imgSet.push({ url: lnkHref });
        });

        this.$thumbList.html($tempWrapper.html());
        this.$thumbList.css({ width: 160 * this.totalItems + 10 });
    };

    ImgBrowser.prototype.changeImg = function (index, isOpen) {
        if (!isOpen && index === this.currentIndex) return;
        this.locateThumbList(index);
        this.showImg(index);
    };

    ImgBrowser.prototype.locateThumbList = function (index) {
        this.$thumbList.find("li")
            .removeClass("active")
            .eq(index).addClass("active");
        
        var margin = 0;
        if (index >= this.totalItems - 4) {
            margin = -(this.totalItems - 6) * 160;
        } else if (index > 2) {
            margin = -(index - 2) * 160;
        }

        this.$thumbList.animate({ marginLeft: margin + "px" });
        this.currentIndex = index;
    };

    ImgBrowser.prototype.showImg = function (index) {
        var self = this,
            $img = this.$imageWrapper.find("img");
        $img.hide();

        var tempImg = new Image();
        tempImg.onload = function () {
            var options = self.options;
            self.originalWidth = tempImg.width;
            self.originalHeight = tempImg.height;
            
            $img.attr("src", self.imgSet[index].url);

            self.sizeAndLocateImg();

            $img.fadeIn("slow");
        };
        tempImg.src = this.imgSet[index].url;
    };

    ImgBrowser.prototype.sizeAndLocateImg = function () {
        var options = this.options,
            $img = this.$imageWrapper.find("img"),
            height = this.originalHeight,
            width = this.originalWidth;

        if (this.originalHeight > options.maxHeight) {
            height = options.maxHeight;
            width = this.originalWidth * (options.maxHeight / this.originalHeight);
        }
        if (this.originalWidth > options.maxWidth) {
            width = options.maxWidth;
            height = this.originalHeight * (options.maxWidth / this.originalWidth);
        }

        $img.width(width);
        $img.height(height);

        this.$imageWrapper.animate({
            width: width,
            height: height,
            marginTop: -height / 2,
            marginLeft: -width / 2
        }, 500, 'swing');
    };

    ImgBrowser.prototype.end = function () {
        $("body").removeClass("imgbrowser-disable-scrolling");
        this.$imgbrowser.fadeOut();
    };

    imgbrower = new ImgBrowser();
})(jQuery);