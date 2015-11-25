$(document).ready(function() {

  $('#select-items-tab').click(function(e) {
    e.preventDefault();
    var form = $('form#project-form')[0];
    var formData = new FormData(form);

    $('.images-upload').each(function() {
      formData.append($(this).attr('id'), $(this)[0].files[0]);
    });

    $.ajax({
        url: 'designer-portal/create',
        data: formData,
        processData: false,
        contentType: false,
        type: 'POST',
        dataType: 'script'
    });
  });
});

