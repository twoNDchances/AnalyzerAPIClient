import { checker, callAPI, notificator, convertFormToJSON, getCookie } from './general.js';

checker()

$(document).ready(function () {
    $('#resetElasticsearchButton').on('click', function () {
        const form = document.getElementById('authenticationForm')
        const formData = new FormData(form)
        const formJSON = convertFormToJSON(formData)
        callAPI(
            'POST',
            '/reset-elasticsearch',
            function () {
                $('#resetElasticsearchButton').empty().append(`
                    <div class="loader"></div>
                `).attr('disabled', true)
            },
            function () {
                $('#resetElasticsearchButton').empty().text('Reset').removeAttr('disabled')
                notificator('Success', 'Reset Elasticsearch successfully', 'success')
                $('#resetElasticsearchModalCloseButton').click()
            },
            function (event) {
                $('#resetElasticsearchButton').empty().text('Reset').removeAttr('disabled')
                const responseError = JSON.parse(event.responseText)
                notificator('Error', responseError.reason, 'error')
            },
            formJSON
        )
    })

    $('#resourceCreationButton').on('click', function (event) {
        event.preventDefault()
        const form = document.getElementById('resourceCreationForm')
        const formData = new FormData(form)
        const formJSON = convertFormToJSON(formData)
        callAPI(
            'POST',
            '/api/resources/create',
            function () {
                $('#resourceCreationButton').empty().append(`
                    <div class="loader"></div>
                `).attr('disabled', true)
            },
            function (event) {
                $('#resourceCreationButton').empty().text('Load Resource').removeAttr('disabled')
                notificator('Success', 'Create all your Resources successfully', 'success')
                $('#jsonResults').empty().text(JSON.stringify(JSON.parse(event.responseText).data, null, 4))
            },
            function (data) {
                $('#resourceCreationButton').empty().text('Load Resource').removeAttr('disabled')
                const responseError = JSON.parse(data.responseText)
                notificator('Error', responseError.reason, 'error')
            },
            formJSON
        )
    })
})