// executes when HTML-Document is loaded and DOM is ready
$(document).ready(function () {
  // General Settings
  jQuery.support.cors = true;
  var urlForAPI = "http://en.wikipedia.org/w/api.php";
  var unfinishedArticleCount;
  var newContent;

  // Input setting
  $("#numberOfArticle").ForceNumericOnly();
  $("#dropdownUserTalk").on('click', 'li a', function(){
      console.log("-------->>"+$("#btn_userTalk").text());
      $("#btn_userTalk").empty();
      $("#btn_userTalk").append($(this).text()+"<span class=\"caret\"></span>");
   });

  // Action to get random article
  $("#btn_Go").click(function () {
    console.log("hit star");

    // Get number of article
    if ($("#numberOfArticle").val()) {
      numberOfArticle = $("#numberOfArticle").val();
      unfinishedArticleCount = numberOfArticle;
    } else {
      numberOfArticle = 1;
    }

    // Clear past result
    $(".resultSection").empty();

    // Loop n time as the input required
    for (var i = 0; i < numberOfArticle; i++) {
      newContent = ("<div class=\"allArticles\">");
      getArticle();
    }

    // Get single article
    function getArticle() {
      console.log("getArticle");

      // Customize GET parameter
      var parameter = { "action":"query",
                        "format": "json",
                        "generator":"random",
                        "prop": "extracts|categories",
                        // "exchars": "500",
                        "continue": ""
                    };
      if ($("#btn_userTalk").text().indexOf("Exclude User Talks")>=0) {
        parameter["grnnamespace"] = "0";
      }

      // Ajax call
      $.ajax({
        url: urlForAPI,
        data: parameter,
        cache: false,
        headers: { 'Access-Control-Allow-Origin': '*' },
        crossDomain: true,
        dataType: 'jsonp',
        success: function(data) {
            console.log("get succeeded");
            console.log(data);
            // Add title, content, and page id
            var title, content, pageid;
            $.each(data.query.pages, function(index, page) {
                 title = page.title;
                 content = page.extract;
                 pageid = page.pageid;
            });
            console.log("new title: "+title);
            // Get content between the first and last <p>
            var FirstPStart = content.indexOf("<p>");
            var FirstPEnd = content.indexOf("</p>");
            content = content.substring(FirstPStart, FirstPEnd+4);

            // Get link
            getLink(title, content, pageid);
        },
        error: function(jqXHR, textStatus, ex) {
            alert(textStatus + "," + ex + "," + jqXHR.responseText);
        }
      });
    }

    // Get Link
    function getLink(title, content, pageid) {
      $.ajax({
        url: urlForAPI,
        data: { "action":"query",
                "format": "json",
                "prop": "info",
                "inprop": "url",
                "pageids": pageid,
                "continue": ""
            },
        cache: false,
        headers: { 'Access-Control-Allow-Origin': '*' },
        crossDomain: true,
        dataType: 'jsonp',
        success: function(data) {
            console.log("get the link: " + data);
            var articleURL;
            $.each(data.query.pages, function(index, page) {
                 articleURL = page.fullurl;
            });
            console.log(articleURL);

            // Append new content
            newContent += ("<div class=\"singleArticle\"><div class=\"row\"><div class=\"col-sm-12 articleTitle\">"+title+"</div></div><div class=\"row\"><div class=\"col-sm-12 articleBrief\">"+content+"</div></div><div class=\"row\"><div class=\"col-sm-12 link\"><a href=\""+articleURL+"\" target=\"_blank\">Read More</a></div></div></div>");
            if (--unfinishedArticleCount===0) {
              newContent += ("</div>");
              $(".resultSection").append(newContent);
              $('html, body').animate({
                scrollTop: $(".containerResult").offset().top
              }, 500);
            }

        },
        error: function(jqXHR, textStatus, ex) {
            alert(textStatus + "," + ex + "," + jqXHR.responseText);
        }
      });


      
    }
  });

  // Filter articles
  $("#btn_Filter").click(function () {
    var keyword = $("#keywordOfArticle").val();
    console.log("hit filter with word: " + keyword);
    var strForContains = ".singleArticle:contains("+keyword+")";
    var strForNotContains = ".singleArticle:not(:contains("+keyword+"))";
    $(strForContains).slideDown(400);
    $(strForNotContains).slideUp(400);
  });
});
  
// Function for forcing numeric input
jQuery.fn.ForceNumericOnly =
function()
{
    return this.each(function()
    {
        $(this).keydown(function(e)
        {
            var key = e.charCode || e.keyCode || 0;
            // allow backspace, tab, delete, enter, arrows, numbers and keypad numbers ONLY
            // home, end, period, and numpad decimal
            return (
                key == 8 ||
                key == 9 ||
                key == 13 ||
                key == 46 ||
                key == 110 ||
                // key == 190 ||
                (key >= 35 && key <= 40) ||
                (key >= 48 && key <= 57) ||
                (key >= 96 && key <= 105));
        });
    });
};

