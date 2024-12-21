import { checker, notificator, callAPI } from "./general.js";

checker()

let formData = null

function updateJsonPreview() {
    formData = {
        wordlist_name: $('#wordlistName').val(),
        content: $('#content').val().length > 0 ? $('#content').val().split('\n') : []
    }
    const jsonString = JSON.stringify(formData, null, 4)

    $('#jsonPreview').text(jsonString)
}

$('#wordlistCreationForm input, #wordlistCreationForm textarea').on('input', updateJsonPreview)

$(document).ready(function () {
    updateJsonPreview()
    $('#wordlistCreationButton').on('click', function (event) {
        event.preventDefault()
        let isWordlistNameErrorField = false;
        let isContentErrorField = false;
        if (String($('#wordlistName').val()).length == 0) {
            isWordlistNameErrorField = true
        }
        if (String($('#content').val()).length == 0) {
            isContentErrorField = true
        }
        if (isWordlistNameErrorField == true || isContentErrorField == true) {
            if (isWordlistNameErrorField == true) {
                $('#wordlistNameErrorField').empty().append(`<p class="error-text">Wordlist Name is required</p>`)
            }
            if (isContentErrorField == true) {
                $('#contentErrorField').empty().append(`<p class="error-text">Content is required</p>`)
            }
            notificator('Error', 'Form validation fail!', 'error');
            return
        }
        callAPI(
            'POST',
            '/api/wordlists/create',
            function () {
                $('#wordlistCreationButton').empty().append(`
                    <div class="loader"></div>
                `).attr('disabled', true)
            },
            function () {
                notificator('Success', 'Create wordlist successfully', 'success')
                setTimeout(function () {
                    location.href = 'wordlist_management.html'
                }, 1000)
            },
            function (error) {                
                $('#wordlistCreationButton').empty().text('Create').removeAttr('disabled')
                const responseError = JSON.parse(error.responseText)
                notificator('Error', responseError.reason, 'error')
            },
            JSON.stringify(formData)
        )
    })
})