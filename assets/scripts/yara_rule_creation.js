import { checker, callAPI, notificator } from './general.js';

checker()

$(document).ready(function () {
    $('#yaraRulePasteField').on('paste', function (event) {
        setTimeout(() => {
            const yaraRulesText = event.target.value.trim();
            const rules = yaraRulesText.match(/rule\s+\w+(_\w+)*\s*(?:\s*:\s*\w+)?\s*{[^{}]*(?:{[^{}]*}[^{}]*)*}/gs) || [];
            rules.forEach((rule, index) => {
                createYARARuleForm(rule, 'Description ' + index);
            });
        }, 100);
    })

    function createYARARuleForm(ruleText = null, ruleDescription = null) {
        const divRow = document.createElement("div")
        divRow.classList.add('form-row')

        const divCol8 = document.createElement("div")
        divCol8.classList.add('col-md-8')

        const divYARARuleField = document.createElement("div")
        divYARARuleField.classList.add('position-relative', 'form-group')

        const labelYARARuleField = document.createElement("label")
        labelYARARuleField.htmlFor = `yaraRule`
        labelYARARuleField.innerText = 'YARA Rule'

        const textareaYARARuleField = document.createElement('textarea')
        textareaYARARuleField.name = `yaraRule`
        textareaYARARuleField.id = `yaraRule`
        textareaYARARuleField.placeholder = 'YARA Rule'
        textareaYARARuleField.classList.add('form-control')
        if (ruleText != null) {
            textareaYARARuleField.value = ruleText
        }

        divYARARuleField.appendChild(labelYARARuleField)
        divYARARuleField.appendChild(textareaYARARuleField)

        divCol8.appendChild(divYARARuleField)
        // ------------------------------------------------------------------------------
        const divCol3 = document.createElement("div")
        divCol3.classList.add('col-md-3')

        const divYARADescriptionField = document.createElement("div")
        divYARADescriptionField.classList.add('position-relative', 'form-group')

        const labelYARADescriptionField = document.createElement("label")
        labelYARADescriptionField.htmlFor = `yaraDescription`
        labelYARADescriptionField.innerText = 'YARA Description'

        const textareaYARADescriptionField = document.createElement('textarea')
        textareaYARADescriptionField.name = `yaraDescription`
        textareaYARADescriptionField.id = `yaraDescription`
        textareaYARADescriptionField.placeholder = 'Required'
        textareaYARADescriptionField.classList.add('form-control')
        if (ruleDescription != null) {
            textareaYARADescriptionField.value = ruleDescription
        }

        divYARADescriptionField.appendChild(labelYARADescriptionField)
        divYARADescriptionField.appendChild(textareaYARADescriptionField)

        divCol3.appendChild(divYARADescriptionField)
        // ------------------------------------------------------------------------------
        const divCol1 = document.createElement("div")
        divCol1.classList.add('col-md-1')

        const divRemoveField = document.createElement("div")
        divRemoveField.classList.add('position-relative', 'form-group')

        const labelRemoveField = document.createElement("label")
        labelRemoveField.htmlFor = `ruleRemoveField`
        labelRemoveField.innerText = 'Remove'

        const buttonRemoveField = document.createElement('button')
        buttonRemoveField.onclick = function () {
            divRow.remove()
        }
        buttonRemoveField.classList.add('mb-2', 'mr-2', 'btn', 'btn-block', 'btn-danger')

        const iIconField = document.createElement('i')
        iIconField.classList.add('fa', 'fa-times')

        buttonRemoveField.appendChild(iIconField)

        divRemoveField.appendChild(labelRemoveField)
        divRemoveField.appendChild(buttonRemoveField)

        divCol1.appendChild(divRemoveField)

        divRow.appendChild(divCol8)
        divRow.appendChild(divCol3)
        divRow.appendChild(divCol1)

        document.getElementById('yaraRuleAndYaraDescription').appendChild(divRow)
    }

    $('#addFieldButton').on('click', function () {
        createYARARuleForm()
    })

    $('#yaraRuleCreationButton').on('click', function (event) {
        event.preventDefault()
        const form = document.getElementById('yaraRuleCreationForm');
        const formData = new FormData(form);
        const jsonObject = {};

        formData.forEach((value, key) => {
            if (jsonObject[key]) {
                if (!Array.isArray(jsonObject[key])) {
                    jsonObject[key] = [jsonObject[key]];
                }
                jsonObject[key].push(value);
            } else {
                jsonObject[key] = value;
            }
        });
        callAPI(
            'POST',
            '/api/yaras/create',
            function () {
                $('#yaraRuleCreationButton').empty().append(`<div class="loader"></div>`).attr('disabled', true)
            },
            function () {
                notificator('Success', 'Create your Rule Library successfully', 'success')
                setTimeout(function () {
                    location.href = 'intergration_management.html'
                }, 1000)
            },
            function (event) {
                $('#yaraRuleCreationButton').empty().text('Create').removeAttr('disabled')                
                let responseError = null;
                if (event.responseText) {
                    responseError = JSON.parse(event.responseText)
                    notificator('Error', responseError.reason, 'error')
                }
                else {
                    notificator('Error', 'Maybe no Internet now', 'error')
                }
            },
            JSON.stringify(jsonObject)
        )
    })
})