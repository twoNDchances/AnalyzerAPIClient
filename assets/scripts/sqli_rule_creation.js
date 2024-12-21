import { notificator, callAPI, fetchData, checker } from "./general.js"

checker()

function updateJsonPreview() {
    const formData = {
        rule_name: $('#ruleName').val(),
        is_enabled: $("input[type='radio'][name='isEnabled']:checked").val() == undefined ? "" : $("input[type='radio'][name='isEnabled']:checked").val() == "true" ? "true" : "false",
        target_field: $('#targetField').val(),
        ip_root_cause_field: $('#ipRootCauseField').val(),
        regex_matcher: $('#regexMatcher').val(),
        rule_library: $('#ruleLibrary').val(),
        wordlist: $('#wordlist').val(),
        action: $('#action').val(),
    }

    const jsonString = JSON.stringify(formData, null, 4)

    $('#jsonPreview').text(jsonString)
}

$('#sqlInjectionRuleCreationForm input, #sqlInjectionRuleCreationForm select, #sqlInjectionRuleCreationForm textarea').on('input change', updateJsonPreview)

$(document).ready(function () {
    updateJsonPreview()
    fetchData(
        '/api/rules/rule-library?ruleType=true',
        'GET',
        null,
        function () {
            $('#ruleLibraryField').empty().append(`
                <div class="loader"></div>
            `)
        },
        function (data) {
            $('#ruleLibraryField').empty().append(`
                <select name="ruleLibrary" id="ruleLibrary" class="form-control">
                    <option value="not_used">Not Used</option>
                </select>
            `)
            for (let index = 0; index < data.data.length; index++) {
                const element = data.data[index];
                $('#ruleLibrary').append(`<option value="${element}">${element}</option>`)
                updateJsonPreview()
                $('#ruleLibrary').on('change', function () {
                    updateJsonPreview()
                })
            }
        },
        function () {
            notificator('Error', 'Can\'t fetch Rule Library!', 'error')
            $('#ruleLibraryField').empty().append(`
                <select name="ruleLibrary" id="ruleLibrary" class="form-control">
                    <option value="not_used">Not Used</option>
                </select>
            `)
        }
    )

    fetchData(
        '/api/wordlists/list-names',
        'GET',
        null,
        function () {
            $('#wordlistField').empty().append(`
                <div class="loader"></div>
            `)
        },
        function (data) {
            $('#wordlistField').empty().append(`
                <select name="wordlist" id="wordlist" class="form-control">
                    <option value="not_used">Not Used</option>
                </select>
            `)
            for (let index = 0; index < data.data.length; index++) {
                const element = data.data[index];
                $('#wordlist').append(`<option value="${element}">${element}</option>`)
                updateJsonPreview()
                $('#wordlist').on('change', function () {
                    updateJsonPreview()
                })
            }
        },
        function () {
            notificator('Error', 'Can\'t fetch Wordlist!', 'error')
            $('#wordlistField').empty().append(`
                <select name="wordlist" id="wordlist" class="form-control">
                    <option value="not_used">Not Used</option>
                </select>
            `)
        }
    )

    fetchData(
        '/api/actions/list?actionName=true',
        'GET',
        null,
        function () {
            $('#actionField').empty().append(`
                <div class="loader"></div>
            `)
        },
        function (data) {
            $('#actionField').empty().append(`
                <select name="action" id="action" class="form-control">
                    <option value="not_used">Not Used</option>
                </select>
            `)
            for (let index = 0; index < data.data.length; index++) {
                const element = data.data[index];
                $('#action').append(`<option value="${element}">${element}</option>`)
                updateJsonPreview()
                $('#action').on('change', function () {
                    updateJsonPreview()
                })
            }
        },
        function (status) {
            if (status != 404) {
                notificator('Error', 'Can\'t fetch Action!', 'error');
            }
            $('#actionField').empty().append(`
                <select name="action" id="action" class="form-control">
                    <option value="not_used">Not Used</option>
                </select>
            `)
        }
    )

    $('#sqlInjectionRuleCreationButton').on('click', function (event) {
        event.preventDefault()
        $('#ruleNameErrorField, #ipRootCauseFieldErrorField, #regexMatcherErrorField, #ruleLibraryErrorField').empty()
        let errorCounter = 0
        let ruleNameError = false
        let ipRootCauseFieldError = false
        let regexMatcherAndRuleLibraryError = false
        if (String($('#ruleName').val()).length == 0) {
            errorCounter++
            ruleNameError = true
        }
        if (String($('#ipRootCauseField').val()).length == 0) {
            errorCounter++
            ipRootCauseFieldError = true
        }
        if (String($('#regexMatcher').val()).length == 0 && $('#ruleLibrary').val() == 'not_used') {
            errorCounter++
            regexMatcherAndRuleLibraryError = true
        }

        if (errorCounter >= 1) {
            notificator('Error', 'Form validation fail!', 'error')
            if (ruleNameError == true) {
                $('#ruleNameErrorField').empty().append(`
                    <p class="error-text">Rule Name cannot be left blank</p>
                `)
            }
            if (ipRootCauseFieldError == true) {
                $('#ipRootCauseFieldErrorField').empty().append(`
                    <p class="error-text">IP Root Cause Field cannot be left blank</p>
                `)
            }
            if (regexMatcherAndRuleLibraryError == true) {
                $('#regexMatcherErrorField').empty().append(`
                    <p class="error-text">Regex Matcher cannot be left blank if Rule Library is not used</p>
                `)
                $('#ruleLibraryErrorField').empty().append(`
                    <p class="error-text">Rule Library must be used if Regex Matcher is left blank</p>
                `)
            }
            return
        }

        if ($("input[type='radio'][name='isEnabled']:checked").val() == undefined) {            
            $("input[type='radio'][name='isEnabled'][value='true']").prop('checked', true)
        }
        const form = document.getElementById('sqlInjectionRuleCreationForm')
        const formData = new FormData(form)
        const jsonData = {}

        formData.forEach((value, key) => {
            if (key === 'subscribe') {
                jsonData[key] = true
            } else {
                jsonData[key] = value
            }
        })

        const jsonString = JSON.stringify(jsonData)
        console.log(jsonString)
        callAPI(
            'POST',
            '/api/sqlis/create',
            function () {
                $('#sqlInjectionRuleCreationButton').empty().append(`
                    <div class="loader"></div>
                `).attr('disabled', true)
            },
            function () {
                notificator('Success', 'Create SQL Injection rule successfully', 'success')
                setTimeout(function () {
                    location.href = 'rule_management.html'
                }, 1000)
            },
            function (data) {
                if (data.status >= 400) {
                    notificator('Fail', JSON.parse(data.responseText).reason, 'warning')
                    $('#sqlInjectionRuleCreationButton').empty().text('Create').removeAttr('disabled')
                    return
                }
                notificator('Error', 'Create SQL Injection rule fail', 'error')
                $('#sqlInjectionRuleCreationButton').empty().text('Create').removeAttr('disabled')
            },
            jsonString
        )
    })
})