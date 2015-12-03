$(document).ready(function() {
  $('.save-project-info-tab').click(function(e) {
    e.preventDefault();
    var form = $('form#project-form')[0];
    var formData = new FormData(form);

    $('.images-upload').each(function() {
      formData.append($(this).attr('id'), $(this)[0].files[0]);
    });
    formData.append("redirect_to_link", this.href);
    // $('#floatingBarSaving').show();
    $.ajax({
        url: 'designer-portal/create',
        data: formData,
        processData: false,
        contentType: false,
        type: 'POST',
        dataType: 'script'
    }).done(function() {
      // $('#floatingBarSaving').hide();
    });
  });

  $(".images-upload").change(function (e) {
    e.preventDefault();
    var form = $('form#project-form')[0];
    var formData = new FormData(form);

    $('.images-upload').each(function() {
      formData.append($(this).attr('id'), $(this)[0].files[0]);
    });
    $(this).parents().eq(3).find('.float-bar-saving').show();
    $.ajax({
        url: 'designer-portal/create',
        data: formData,
        processData: false,
        contentType: false,
        type: 'POST',
        dataType: 'script'
    }).done(function() {
      $(this).parents().eq(3).find('.float-bar-saving').hide();
    });
  })
});

