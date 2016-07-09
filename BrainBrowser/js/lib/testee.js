  $(document).ready(function(){
var mark;
  $(function() {
    $( "#radioer" ).buttonset();
  });
  
  $(function() {
	    // 页面加载，赋值
	    mark = $("[name='radio'][checked]").val();
  });
  
  $("[name='radio']").click(function() {
      // 这里需要更新
      mark = $(this).val();
      $( "#zhukai" ).html(mark);
  });
  


    $("button").click(function(){
      $("p").css("background-color","red");
    //  mark = $(this).val();
      $( "#zhukai" ).html(mark);
    });
  });
