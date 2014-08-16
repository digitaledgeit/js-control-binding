/**
 * Creates a control plugin that binds the control value to a model
 * @param   {Object} options
 * @param   {Object} options.model      The model to bind to
 * @param   {String} options.property   The model property to bind to
 * @param   {Object} [options.mapper]   Methods to map data between the model and control
 * @param   {String} [options.event]    The control event to bind on
 * @returns {Function}
 */
module.exports = function(options) {

	var
		model       = options.model,
		property    = options.property,
		mapper      = options.mapper,
		event       = options.event || 'validate'
	;

	return function(control) {

		/**
		 * Map a value to the control
		 * @param   {*} value
		 */
		function mapToControl(value) {

			//map the model value to a format fit for the control
			if (mapper && mapper.toControl) {
				value = mapper.toControl(value);
			}

			//set the control value
			control.setValue(value);
		}

		/**
		 * Map a value to a property on the model
		 * @param   {*} value
		 */
		function mapToModel(value) {

			//map the control value to a format fit for the model
			if (mapper && mapper.toModel) {
				value = mapper.toModel(value);
			}

			//set the model property
			model.set(property, value, {silent: true});
		}

		//bind to control events
		if (event === 'validate') {
			control.on('validate', function(valid, value) {
				if (valid) mapToModel(value);
			});
		} else {
			control.on(event, function() {
				mapToModel(control.getValue());
			});
		}

		//bind to model events
		model.on('change:'+property, mapToControl);

	};

};