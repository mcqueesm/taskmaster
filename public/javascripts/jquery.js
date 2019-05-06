
$(function(){
  $('.task-link').hover(function(){

    if($(this).data('completed')){
      let id = $(this).attr('id');
      $(':nth-child(1)', this).append("<a class='remove' href='/profile/delete/"+ id + "'>Remove<a>");
    }
    },
    function () {
      if($(this).data('completed')){
        $(':nth-child(1)', this).find("a").remove();
      }
    });

  $('.task-link').hover(function(){
    $(':nth-child(1)', this).addClass('animated pulse');
    },
    function(){
      $(':nth-child(1)', this).removeClass('animated pulse');
    });

});
