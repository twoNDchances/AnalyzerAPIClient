import { callAPI, notificator, checker } from './general.js';

checker()

$(document).ready(function () {
    callAPI(
        'GET',
        '/api/rules/rule-inheritance',
        function () {
            $('#ruleLibraryField').empty().append(`
                <div class="small-item-center">
                    <div class="loader"></div>
                </div>
            `)
        },
        function (event) {
            const responseData = JSON.parse(event.responseText)
            $('#ruleLibraryField').empty()
            for (let index = 0; index < responseData.data.length; index++) {
                const element = responseData.data[index];
                $('#ruleLibraryField').append(`
                    <div class="custom-checkbox custom-control">
                        <input type="checkbox" id="${element}" name="ruleLibrary" class="custom-control-input" value="${element}">
                        <label class="custom-control-label" for="${element}">${element}</label>
                    </div>
                `)
            }
        },
        function () {
            notificator('Error', 'Can\'t fetch Rule Library', 'error')
        }
    )

    $('#addFieldButton').on('click', function () {
        const divRow = document.createElement("div")
        divRow.classList.add('form-row')

        const divCol8 = document.createElement("div")
        divCol8.classList.add('col-md-8')

        const divExecutionField = document.createElement("div")
        divExecutionField.classList.add('position-relative', 'form-group')

        const labelExecutionField = document.createElement("label")
        labelExecutionField.htmlFor = `ruleExecution`
        labelExecutionField.innerText = 'Rule Execution'

        const textareaExecutionField = document.createElement('textarea')
        textareaExecutionField.name = `ruleExecution`
        textareaExecutionField.id = `ruleExecution`
        textareaExecutionField.placeholder = 'Rule Regex'
        textareaExecutionField.classList.add('form-control')

        divExecutionField.appendChild(labelExecutionField)
        divExecutionField.appendChild(textareaExecutionField)

        divCol8.appendChild(divExecutionField)
        // ------------------------------------------------------------------------------
        const divCol3 = document.createElement("div")
        divCol3.classList.add('col-md-3')

        const divDescriptionField = document.createElement("div")
        divDescriptionField.classList.add('position-relative', 'form-group')

        const labelDescriptionField = document.createElement("label")
        labelDescriptionField.htmlFor = `ruleDescription`
        labelDescriptionField.innerText = 'Rule Description'

        const textareaDescriptionField = document.createElement('textarea')
        textareaDescriptionField.name = `ruleDescription`
        textareaDescriptionField.id = `ruleDescription`
        textareaDescriptionField.placeholder = 'Required'
        textareaDescriptionField.classList.add('form-control')

        divDescriptionField.appendChild(labelDescriptionField)
        divDescriptionField.appendChild(textareaDescriptionField)

        divCol3.appendChild(divDescriptionField)
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

        document.getElementById('ruleExecutionAndRuleDescription').appendChild(divRow)
    })

    $('#ruleInheritanceCreationButton').on('click', function (event) {
        event.preventDefault()
        const form = document.getElementById('ruleInheritanceForm');
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
            '/api/rules/rule-inheritance',
            function () {
                $('#ruleInheritanceCreationButton').empty().append(`<div class="loader"></div>`).attr('disabled', true)
            },
            function () {
                notificator('Success', 'Create your Rule Library successfully', 'success')
                setTimeout(function () {
                    location.href = 'rule_library.html'
                }, 1000)
            },
            function (event) {
                const responseError = JSON.parse(event.responseText)
                notificator('Error', responseError.reason, 'error')
                $('#ruleInheritanceCreationButton').empty().text('Create').removeAttr('disabled')
            },
            JSON.stringify(jsonObject)
        )
    })
})