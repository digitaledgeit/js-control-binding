var assert      = require('assert');
var Emitter     = require('emitter');
var Control     = require('control');
var plugin      = require('control-binding');

var
	element,
	model,
	control
;

function createModel() {
	var model = new Emitter;

	model.attr = {};

	model.get = function(property) {
		return typeof this.attr[property] !== 'undefined' ? this.attr[property] : undefined;
	};

	model.set = function(property, value) {
		this.attr[property] = value;
		this.emit('change:'+property, value);
	};

	return model;
}

function setupFirstNameControl() {

	element = document.createElement('div');

	model = createModel()

	control = Control.create({
		el: element
	}).use(plugin({
		model:      model,
		property:   'firstName'
	}));

}

function setupDateControl() {

	element = document.createElement('div');

	model = createModel()

	control = Control.create({
		el: element
	}).use(plugin({
		model:      model,
		property:   'date',
		mapper:     {
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
		}
	}));

}

describe('control-binding', function() {

  it('should update the control on initialisation', function() {

    model = createModel();
    model.set('firstName', 'John');

    control = Control.create({
      el:           document.createElement('div')
    }).use(plugin({
      model:      model,
      property:   'firstName'
    }));

    assert.equal('John', control.getValue());

  });

	it('should update the control when the model value changes', function() {

		setupFirstNameControl();

		assert.equal('', control.getValue());
		model.set('firstName', 'John');
		assert.equal('John', control.getValue());

	});

	it('should update the model when the control value changes', function() {

		setupFirstNameControl();

		assert.equal(undefined, model.get('firstName'));
		control.setValue('John').validate();
		assert.equal('John', model.get('firstName'));

	});

	it('should map the value for the control', function() {

		setupDateControl();

		assert.equal('', control.getValue());
		model.set('date', new Date(2000, 0, 1));
		assert.equal('2000-01-01', control.getValue());

	});

	it('should map the value for the model', function() {

		setupDateControl();

		assert.equal(undefined, model.get('date'));
		control.setValue('2000-01-01').validate();
		assert((new Date(2000, 0, 1)).toISOString() === model.get('date').toISOString());

	});

});