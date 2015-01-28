var assert      = require('assert');
var Emitter     = require('emitter');
var Control     = require('control');
var plugin      = require('control-model-binding');

var model, control;

/**
 * Create a mock model
 * @param   {Object} [attr]   The model attributes
 * @returns {Model}
 */
function createMockModel(attr) {
	var model = new Emitter();

	model.attr = attr || {};

	model.get = function(property) {
		return typeof this.attr[property] !== 'undefined' ? this.attr[property] : undefined;
	};

	model.set = function(property, value) {
		this.attr[property] = value;
		this.emit('change:'+property, value);
	};

	return model;
}

/**
 * Create a mock control
 * @param   {Object} [opt]    The control options
 * @returns {Control}
 */
function createMockControl(opt) {
	opt = opt || {};

	var control = new Emitter();

	control.value = opt.value;

	control.use = function(plugin) {
		plugin(this);
		return this;
	};

	control.getValue = function() {
		return this.value;
	};

	control.setValue = function(value) {
		this.value = value;
		return this;
	};

	control.validate = function() {
		this.emit('validate', true, this.value);
		return this;
	};

	return control;
}

/**
 * Create a control for a first name field
 * @param   {Object} [attr]   The model attributes
 * @param   {Object} [ctl]    The control options
 * @param   {Object} [opt]    The plugin options
 */
function createFirstNameControl(attr, ctl, opt) {
	opt = opt || {};

	model = createMockModel(attr);

	opt.model     = model;
	opt.property  = 'firstName';
	control = createMockControl(ctl).use(plugin(opt));

}

/**
 * Create a control for a start date field
 * @param   {Object} [attr]   The model attributes
 * @param   {Object} [ctl]    The control options
 * @param   {Object} [opt]    The plugin options
 */
function createStartDateControl(attr, ctl, opt) {
	opt = opt || {};

	model = createMockModel(attr);

	opt.model     = model;
	opt.property  = 'startDate';
	opt.mapper    = {
		toControl: function(date) {
			return date ?
			date.getFullYear()+'-'+
			(String('00'+(date.getMonth()+1)).substr(-2))+'-'+
			(String('00'+date.getDate())).substr(-2) :
				''
				;
		},
		toModel: function(date) {
			if (date) {
				var date = new Date(date);
				return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
			} else {
				return null;
			}
		}
	};
	control = createMockControl(ctl).use(plugin(opt));

}

describe('control-binding', function() {

  it('should set the control value on initialisation', function() {
    createFirstNameControl({firstName: 'John'});
    assert.equal('John', control.getValue());
  });

	it('should not set the control value on initialisation', function() {
		createFirstNameControl({firstName: 'John'}, {}, {init: false});
		assert.notEqual('John', control.getValue());
	});

	it('should not set the control value if the control has a value on initialisation', function() {
		createFirstNameControl({firstName: 'John'}, {value: 'Andrew'});
		assert.notEqual('John', control.getValue());
	});

	it('should set the control value if the control has a value on initialisation', function() {
		createFirstNameControl({firstName: 'John'}, {value: 'Andrew'}, {initIfHasValue: true});
		assert.equal('John', control.getValue());
	});

	it('should set the control value when the model value changes', function() {

		createFirstNameControl();

		assert.equal('', control.getValue());
		model.set('firstName', 'John');
		assert.equal('John', control.getValue());

	});

	it('should set the model property when the control value changes', function() {

		createFirstNameControl();

		assert.equal(undefined, model.get('firstName'));
		control.setValue('John').validate();
		assert.equal('John', model.get('firstName'));

	});

	it('should map the value for the control', function() {

		createStartDateControl();

		assert.equal('', control.getValue());
		model.set('startDate', new Date(2000, 0, 1));
		assert.equal('2000-01-01', control.getValue());

	});

	it('should map the value for the model', function() {

		createStartDateControl();

		assert.equal(undefined, model.get('startDate'));
		control.setValue('2000-01-01').validate();
		assert((new Date(2000, 0, 1)).toISOString() === model.get('startDate').toISOString());

	});

});