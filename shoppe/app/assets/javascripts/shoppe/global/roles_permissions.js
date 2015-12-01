$(document).ready(function(){
  $(document).on('change', '#permission_subject_class', function(e) {
    var url = '/shoppe/get_controller_options?controller_name=' + $(this).val()
    $("#permission_action").find('option').remove()
    $.get(url, function(data) {
      // var row = "<option value=\"" + "" + "\">" + "" + "</option>";
	  // $(row).appendTo("select#permission_action");                        
	  $.each(data, function(i, j){
	      row = "<option value=\"" + j + "\">" + j + "</option>";   
	      $(row).appendTo("select#permission_action");                     
	  });  
    });
  });  
});