$(document).ready(function() {
  $('.save-project-info-tab').click(function(e) {
    e.preventDefault();
    var form = $('form#project-form')[0];
    var formData = new FormData(form);
    // var formData = new FormData();

    // $('.images-upload').each(function() {
    //   formData.append($(this).attr('id'), $(this)[0].files[0]);
    // });
    formData.append("redirect_to_link", this.href);
    formData.append("save_image", 0);
    $.ajax({
        url: 'designer-portal/create',
        data: formData,
        processData: false,
        contentType: false,
        type: 'POST',
        dataType: 'script'
    }).done(function() {
    });
  });

  $(".images-upload").change(function (e) {
    e.preventDefault();
    var form = $('form#project-form')[0];
    var formData = new FormData(form);

    $('.images-upload').each(function() {
      formData.append($(this).attr('id'), $(this)[0].files[0]);
    });
    formData.append("save_image", 1);
    $(this).parents().eq(3).find('.float-bar-saving').show();
    var float_bar = $(this).parents().eq(3).find('.float-bar-saving');
    var load_icon = $(this).parents().eq(3).find('.load-icon-saving');
    $.ajax({
        url: 'designer-portal/create',
        data: formData,
        processData: false,
        contentType: false,
        type: 'POST',
        dataType: 'script'
    }).done(function() {
      float_bar.hide();
      load_icon.show();
    });
  })
});

