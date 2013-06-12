$("document").ready(function() {
    //////////////////////////////////////////////
    // Plivo web SDK event handler registration //
    //////////////////////////////////////////////

    Plivo.onWebrtcNotSupported = function() {
      console.log("WebRTC not supported");
      alert("Your browser does not support WebRTC. Please use latest version of chrome to use this application.");
    }

    Plivo.onReady = function() {
      console.log("ready");
    };

    Plivo.onLogin = function() {
      console.log("login successful");
    };

    Plivo.onLoginFailed = function() {
      console.log("login failed");
      alert("login failed. Please reload the page and try again.")
    };

    Plivo.onCallAnswered = function() {
      console.log("call answered");
      $(".test-btn").html("End!");
    }
    Plivo.onCallTerminated = function() {
      console.log("call terminated");
      $(".test-btn").html("Test!");
    };

    Plivo.onMediaPermission = function(result) {
      console.log("media permission result: " + result);
      if (!result) {
          alert("if you don't allow media permission, you will not be able to use this application!");
      }
    };

    Plivo.onIncomingCall = function(accountName, extraHeaders) {
      console.log("incoming call...");
      // Invoke modal to indicate incoming call
      $('#call-modal').modal({
        backdrop: "static",  // makes sure modal stay when user presses elsewhere in the screen.
        keyboard: false  // makes sure that modal stays when the user presses esc, etc keys.
      });
    };

    Plivo.onIncomingCallCanceled = function() {
      console.log("incoming call cancelled")
      $('#call-modal').modal('hide');
    };

    ////////////////////////////////
    // Call Modal event handlers  //
    ////////////////////////////////
    $(".call-reject-btn").click(function(e) {
      Plivo.conn.reject();
      $('#call-modal').modal('hide');
    });

    $(".call-answer-btn").click(function(e) {
      console.log("answer button!");
      Plivo.conn.answer();
      $('#call-modal').modal('hide');
    });

    /////////////////////////////////////////////
    // Application event handlers registration //
    /////////////////////////////////////////////
    $(".clear-btn").click(function(e) {
        console.log("clear the editor")
        editor.setValue("");  // clear the editor contents
    });

    $(".test-btn").click(function(e) {
        switch($(this).html()) {
          case "Test!":
            console.log("testing the xml...");
            var plivoXML = editor.getValue();
            $.ajax({
              url: "/testxml",
              type: "POST",
              data: {
                "xml": plivoXML,
                "uname": uname
              },
              success: function(data) {
                console.log(data);
                console.log("call initiated successfully!");
              },
              error: function() {
                // something went wrong
                console.log("error while initiating the call.");
              }
            });
            break;

          case "End!":
            console.log("ending the call...");
            Plivo.conn.hangup();
            break;

          default:
            console.log("something went wrong!");
            break;
        }
    });

    $(".nav-item").click(function(e) {
      $(".nav-item").removeClass("active");
      $(this).addClass("active");
      editor.setValue($(this).children("a").attr("xml-data"));
    });

    /////////////////////////////
    // Initializa Plivo Object //
    /////////////////////////////
    Plivo.init();

    ////////////////////////////////
    // logging the user in        //
    ////////////////////////////////
    console.log("logging in...")
    uname = "";  // Plivo endpoint username
    passwd = "";  // Plivo endpoint password
    Plivo.conn.login(uname, passwd);

    ////////////////////////////////
    // ACE editor settings        //
    ////////////////////////////////
    var editor = ace.edit("editor");
    editor.getSession().setMode("ace/mode/xml");
    // Setting initial value
    editor.setValue($(".nav-item.active").children("a").attr("xml-data"));
    editor.setValue(editor.getValue());
});
