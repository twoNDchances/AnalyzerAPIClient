import { callAPI, notificator, checker, fetchData } from './general.js';

checker()

function updateJsonPreview() {
    const formData = {
        rule_name: $('#ruleName').val(),
        is_enabled: $("input[type='radio'][name='isEnabled']:checked").val() == undefined ? "" : $("input[type='radio'][name='isEnabled']:checked").val() == "true" ? "true" : "false",
        target_field: $('#targetField').val(),
        ip_root_cause_field: $('#ipRootCauseField').val(),
        regex_matcher: $('#regexMatcher').val(),
        rule_library: $('#ruleLibrary').val(),
        yara_rule_intergration: document.getElementById("yaraRuleIntergration").checked ? $('#yaraRuleIntergration').val() : 'not_used',
        action: $('#action').val()
    }    
    const jsonString = JSON.stringify(formData, null, 4)

    $('#jsonPreview').text(jsonString)
}

$('#fileUploadRuleCreationForm input, #fileUploadRuleCreationForm select, #fileUploadRuleCreationForm textarea').on('input change', updateJsonPreview);

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
        function (status, errorMessage) {            
            notificator('Error', 'Can\'t fetch Rule Library!', 'error')
            $('#ruleLibraryField').empty().append(`
                <select name="ruleLibrary" id="ruleLibrary" class="form-control">
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

    $('#fileUploadRuleCreationButton').on('click', function (event) {
        event.preventDefault();
        $('#ruleNameErrorField, #targetFieldErrorField, #ipRootCauseFieldErrorField, #regexMatcherErrorField, #ruleLibraryErrorField').empty();
        let errorCounter = 0;
        let ruleNameError = false;
        let targetFieldError = false;
        let ipRootCauseFieldError = false;
        let regexMatcherAndRuleLibraryError = false;
        if (String($('#ruleName').val()).length == 0) {
            errorCounter++;
            ruleNameError = true;
        }
        if (String($('#targetField').val()).length == 0) {
            errorCounter++;
            targetFieldError = true
        }
        if (String($('#ipRootCauseField').val()).length == 0) {
            errorCounter++;
            ipRootCauseFieldError = true;
        }
        if (String($('#regexMatcher').val()).length == 0 && $('#ruleLibrary').val() == 'not_used') {
            errorCounter++;
            regexMatcherAndRuleLibraryError = true;
        }

        if (errorCounter >= 1) {
            notificator('Error', 'Form validation fail!', 'error');
            if (ruleNameError) {
                $('#ruleNameErrorField').empty().append(`
                    <p class="error-text">Rule Name cannot be left blank</p>
                `);
            }
            if (targetFieldError) {
                $('#targetFieldErrorField').empty().append(`
                    <p class="error-text">Target Field must be specific and not accept list syntax</p>
                `);
            }
            if (ipRootCauseFieldError) {
                $('#ipRootCauseFieldErrorField').empty().append(`
                    <p class="error-text">IP Root Cause Field cannot be left blank</p>
                `);
            }
            if (regexMatcherAndRuleLibraryError) {
                $('#regexMatcherErrorField').empty().append(`
                    <p class="error-text">Regex Matcher cannot be left blank if Rule Library is not used</p>
                `);
                $('#ruleLibraryErrorField').empty().append(`
                    <p class="error-text">Rule Library must be used if Regex Matcher is left blank</p>
                `);
            }
            return;
        }

        if ($("input[type='radio'][name='isEnabled']:checked").val() == undefined) {
            $("input[type='radio'][name='isEnabled'][value='true']").prop('checked', true);
        }

        const form = document.getElementById('fileUploadRuleCreationForm');
        const formData = new FormData(form);
        const jsonData = {};

        formData.forEach((value, key) => {
            jsonData[key] = value;
        });
        const jsonString = JSON.stringify(jsonData);
        console.log(jsonString);
        
        callAPI(
            'POST',
            '/api/fus/create',
            function () {
                $('#fileUploadRuleCreationButton').empty().append(`
                    <div class="loader"></div>
                `).attr('disabled', true);
            },
            function () {
                notificator('Success', 'Create File Upload Rule successfully', 'success');
                setTimeout(function () {
                    location.href = 'rule_management.html';
                }, 1000);
            },
            function (data) {
                if (data.status >= 400) {
                    notificator('Fail', JSON.parse(data.responseText).reason, 'warning');
                    $('#fileUploadRuleCreationButton').empty().text('Create').removeAttr('disabled');
                    return;
                }
                notificator('Error', 'Create File Upload Rule failed', 'success');
                $('#fileUploadRuleCreationButton').empty().text('Create').removeAttr('disabled');
                console.log(data.responseText);
            },
            jsonString
        );
    })
})