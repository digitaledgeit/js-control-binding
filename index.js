
/**
 * Convert an undefined or null value to the empty string
 * @param   {*} value
 * @returns {*}
 */
function convertToEmpty(value) {
  if (value === undefined || value === null) {
    return '';
  } else {
    return value;
  }
}

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

  //whether to ignore the change
  var ignore = false;

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
      control.setValue(convertToEmpty(value));
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
      model.set(property, value);
    }

    //bind to control events
    if (event === 'validate') {
      control.on('validate', function(valid, value) {
        if (valid) {

          if (ignore) {
            return;
          } else {
            ignore = true;
          }

          mapToModel(value);

          ignore = false;
        }
      });
    } else {
      control.on(event, function() {

        if (ignore) {
          return;
        } else {
          ignore = true;
        }

        mapToModel(control.getValue());

        ignore = false;
      });
    }

    //bind to model events
    model.on('change:'+property, function(value) {

      if (ignore) {
        return;
      } else {
        ignore = true;
      }

      mapToControl(value);

      ignore = false;
    });

    //initialise control from the model
    mapToControl(model.get(property));

  };

};