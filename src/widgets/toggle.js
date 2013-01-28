(function($, undefined) {

	/**
	 * Makes an HTML area able to collapse and expand.
	 * By adding the class "active" to the "bw-toggle-content"
	 * element, the area will be expanded by default.
	 *
	 * <div class="bw-toggle">
	 * 	<div class="bw-toggle-content active">
	 * 		...your content...
	 * 	</div>
	 * 	
	 * 	<div class="bw-toggle-collapse">Click to hide</div>
	 * 	<div class="bw-toggle-expand">Click to show</div>
	 * </div>
	 */
	$.widget("bitwise.toggle", $.bitwise.base, {
	
		options: {
			/**
			 * The current state. Either "collapsed" or "expanded"
			 * @type {string}
			 */
			state: "",
			
			/**
			 * Duration of the collapse/expand animation
			 * @type {int}
			 */
			duration: 350
		},
	
		_init: function() {
			this.$content = this.$element.find(".bw-toggle-content");
			this.$collapse = this.$element.find(".bw-toggle-collapse");
			this.$expand = this.$element.find(".bw-toggle-expand");
			
			this._makeUi();
			
			this.options.state = this._getCurrentState();
			
			this._updateUi();
		},
		
		_makeUi: function() {
			this.$collapse.click($.proxy(function() {
				this.toggle();
			}, this));
			
			this.$expand.click($.proxy(function() {
				this.toggle();
			}, this));
		},
		
		_updateUi: function() {
			if (this.options.state == "expanded") {
				this.$content.addClass("active");
				this.$expand.addClass("hidden");
				this.$collapse.removeClass("hidden");
				
				this.$content.slideDown(this.options.duration);
			}
			else {
				this.$expand.removeClass("hidden");
				this.$collapse.addClass("hidden");
				
				// if we remove the active class before the animation is done
				// the element's height just snaps to 0
				this.$content.slideUp(this.options.duration, $.proxy(function() {
					this.$content.removeClass("active");
				}, this));
			}
		},
		
		_getCurrentState: function() {
			var res = "collapsed";
			if (this.$content.hasClass("active")) {
				res = "expanded";
			}
			
			return res;
		},
		
		toggle: function() {
			if (this.isDisabled()) {
				return;
			}
			
			var curState = this._getCurrentState();
			
			if (curState == "expanded") {
				this.options.state = "collapsed";
			}
			else {
				this.options.state = "expanded";
			}
			
			this._updateUi();
		}
	});

})(jQuery);