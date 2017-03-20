function startModel() {
  window.alert("potatoe OK");
}

$("#new_input").submit(function(event){
  event.preventDefault();
  alert($('#nitrate').val());
  deselect($('#new_input'))
});

function deselect(e) {
  $('.pop').slideFadeToggle(function() {
    $('#nitrate').val(" ")
    e.removeClass('selected');
  });
}

$(function() {
  $('.inputDialog').on('click', function() {
    if($(this).hasClass('selected')) {
      deselect($(this));
    } else {
      $(this).addClass('selected');
      $('.pop').slideFadeToggle();
    }
    return false;
  });

  $('.close').on('click', function() {
    deselect($('.inputDialog'));
    return false;
  });
});

$.fn.slideFadeToggle = function(easing, callback) {
  return this.animate({ opacity: 'toggle', height: 'toggle' }, 'fast', easing, callback);
};
