function validator(options) {
	var formElement = document.querySelector(options.form)
	var selectorsRule = {}
	var isChecked = true
	
	function variate(inputElement, rules) {
		var parentElement = getPrentElement(inputElement,options.formGroup)
		var spanElement = parentElement.querySelector(options.formMessage)
		var errorMessage;


		
		for(var i = 0; i < rules.length; i++) {
			switch(inputElement.type) {
				case 'radio':
				case 'checkbox':
					errorMessage = rules[i](
						formElement.querySelector('input[name="'+inputElement.name+'"]:checked ')
					)
					break;

				default:
					errorMessage = rules[i](inputElement.value)
			}
			if(errorMessage) break;
		}
		
		if(spanElement) {
			if(errorMessage) {
				spanElement.innerHTML = errorMessage
				parentElement.classList.add('invalid')
			} else {
				spanElement.innerHTML = ''
				parentElement.classList.remove('invalid')
			}
			return !errorMessage
		}

	}
	
	if(formElement) {
		function getPrentElement(element,selector) {
			while(element.parentElement) {
				if(element.parentElement.matches(selector)) {
					return element.parentElement
				}
				element = element.parentElement
			}
		}

		options.rules.forEach(function(rule) {
			var inputElement = formElement.querySelector(rule.selector)
			var parentElement = getPrentElement(inputElement,options.formGroup)
			var spanElement = parentElement.querySelector(options.formMessage)
			
			if(Array.isArray(selectorsRule[rule.selector])) {
				selectorsRule[rule.selector].push(rule.test)
			} else {
				selectorsRule[rule.selector] = [rule.test]
			}

			let inputAll = formElement.querySelectorAll('input[name]')

			
			inputElement.onblur = function() {
				variate(inputElement,selectorsRule[rule.selector])
			}
			
			inputElement.oninput = function() {
				spanElement.innerHTML = ''
				parentElement.classList.remove('invalid')
			}
		})

		formElement.onsubmit = function(e) {
			e.preventDefault()
			var isFormValid = true
			options.rules.forEach(function(rule) {
				var inputElement = formElement.querySelector(rule.selector)
				var isChecked = variate(inputElement,selectorsRule[rule.selector])
				if(!isChecked) {
					isFormValid = false
				}
			})
			
			if(isFormValid) {
				if(typeof options.isData === 'function') {
					var inputElements = formElement.querySelectorAll('[name]')

					var data = Array.from(inputElements).reduce(function(values, input) {
						switch(input.type) {
							case 'radio':
							case 'checkbox':
								values[input.name] = formElement.querySelector('input["name=' + input.name + '"]  ').value
							break;
							default:
								values[input.name] = input.value
						}
						return values
					},{})

					options.isData(data)
				} else {
					formElement.submit()
				}
			}
		}
		
	}
}


isRequired = function(selector, message) {
	return {
		selector: selector,
		test: function(value) {
			if(value === null) {
				return value ? undefined : message || 'vui lòng nhập trường này'
			} else {
				return value.trim() ? undefined : message || 'vui lòng nhập trường này'
			}
			
		}
	}
}

isEmail = function(selector,message) {
	return {
		selector: selector,
		test: function(value) {
			var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
			return regex.test(value) ? undefined : message ||  'trường này phải là  email'
		}
	}
}

minLength = function(selector,min,message) {
	return {
		selector: selector,
		test: function(value) { 
			return value.length >= min ? undefined : message || ` nhập tối thiểu ${min} ký tự`
		}
	}
}

isConfirmed = function(selector, callback,message) {
	return {
		selector: selector,
		test: function(value) {
			return value === callback() ? undefined : message || 'giá trị nhập vào không chính xác'
		}
	}
}