(function($, undefined) {

	/**
	 * Base class for bitwise widgets
	 *
	 * Usage:
	 * $.widget("bitwise.<new_widget>", $.bitwise.base, { <new_widget>-stuff });
	 */
	$.widget("bitwise.base", {
	
		/**
		 * Sort of constructor
		 */
		_create: function() {
			this.$element = $(this.element);
		},
		
		/**
		 * Initialize the specific widget.
		 * This is called automatically by
		 * the widget factory
		 */
		_init: function() {
			throw "'_init' Should be overwritten by implementer";
		},
		
		/**
		 * Called automatically by the widget factory
		 * @params {hash} A set of options to change
		 */
		_setOptions: function(options) {
			// the superApply call does not work
			// if we use the param directly
			this._superApply(arguments);
			this._updateUi();
		},
		
		/**
		 * Called by the widget factory, whenever
		 * an option needs to be set.
		 * This can be overridden to apply validation
		 * etc.
		 * @param {string} The name of the option to set
		 * @param {string} The new value for the option
		 */
		_setOption: function(key, val) {
			this._super(key, val);
		},
		
		/**
		 * Build/prepare UI elements and render them
		 */
		_makeUi: function() {
			throw "'_makeUi' Should be overwritten by implementer";
		},
		
		/**
		 * Update UI elements due to changes in options,
		 * values or whatever.
		 */
		_updateUi: function() {
			throw "'_updateUi' Should be overwritten by implementer";
		},
		
		disable: function() {
			this.$element.addClass("disabled");
		},
		
		enable: function() {
			this.$element.removeClass("disabled");
		},
		
		isDisabled: function() {
			return this.$element.hasClass("disabled");
		}
	});

})(jQuery);