var StoreImageLocally, downloadURI, getBase64Image, printToFile;

StoreImageLocally = function(id, zis) {
  var cellId, dataImage, imgData;
  imgData = getBase64Image(zis);
  cellId = 'imgData' + id;
  localStorage.setItem(cellId, imgData);
  dataImage = localStorage.getItem(cellId);
  zis.src = 'data:image/png;base64, ' + dataImage;
};

getBase64Image = function(img) {
  var canvas, ctx, dataURL, i_height, i_width;
  canvas = document.createElement('canvas');
  i_width = img.offsetWidth;
  i_height = img.offsetHeight;
  canvas.width = img.width;
  canvas.height = img.height;
  ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, i_width, i_height);
  dataURL = canvas.toDataURL('image/png');
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
};

printToFile = function() {
  var c_height, c_width, div;
  div = $('.room-editor-container');
  c_width = div.width() + 100;
  c_height = div.height();
  html2canvas(div, {
    onrendered: function(canvas) {
      var myImage;
      myImage = canvas.toDataURL('image/png');
      downloadURI(myImage, 'FurniturePlan.png');
    },
    background: '#fff',
    width: c_width,
    height: c_height
  });
};

downloadURI = function(uri, name) {
  var link;
  link = document.createElement('a');
  link.className = 'temporaryLink';
  link.download = name;
  link.href = uri;
  if (uri) {
    link.click();
  }
};

window.onload = function() {
  var imgs;
  imgs = $('.room-editor-container').find('.item-image');
  imgs.each(function(index) {
    StoreImageLocally(index, $(this)[0]);
  });
  $('#save-as-image').on('click', printToFile);
};