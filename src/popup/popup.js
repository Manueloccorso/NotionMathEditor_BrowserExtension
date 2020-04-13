console.log("NM.Popup: Running");

//MESSAGES
  //Request the math codes from the content
  var NOTION_MATH_RETRIEVE_MATH_CODES = "find_maths";
  //Request to store the codes in background
  var NOTION_MATH_STORE_CODES = "store_codes";
  //Signal Updated CODES
  var NOTION_MATH_CODES_UPDATED = "codes_updated";


// ANCHOR LINKS
  var custom_codes_div_anchor = "#custom_codes_div_anchor";
  var page_codes_div_anchor = "#page_codes_div_anchor";

// --------------------- VARS ----------------------------------------
var custom_codes = [];
var page_codes = [];

// --------------------- UTILITIES -----------------------------

//----- translate a code id used in the textarea
//                   to the one used for the preview
function preview_id_from_code_id(id){
  return "label_" + id.toString();
}

//----- send a request for the codes in the content
function send_request_for_codes(){
  console.log("NM.popup: Button Clicked;");
  let msg = {
    type : NOTION_MATH_RETRIEVE_MATH_CODES
  };
  chrome.runtime.sendMessage(msg);
}


//------------------------- LOGIC DEFINITION -------------------------------------

function add_custom_katex_code() {
  let new_id = '_' + Math.random().toString(36).substr(2, 9);
  custom_codes.push(
        {
          id : new_id,
          code : "\\frac{New Code}{Click to change code}"

        }
    );
  refresh_codes_visualization();
}

function sync_katex_code(id, code){
  let label_area = document.getElementById(
                            preview_id_from_code_id(id)
                            );
  katex.render(code,
              label_area,
              { throwOnError: false}
            );
}

function add_listeners_to_text_area(text_area){
  text_area.addEventListener(
            'keyup',
            (event) => {
              clean_code = auto_de_formatting(text_area.value);
              sync_katex_code(text_area.id,
                clean_code
                );
            }
        );
  text_area.addEventListener(
            'change',
            (event) => {
              console.log("NM.popup: COPY TO CLIPBOARD");
              text_area.select();
              document.execCommand('copy');
              window.getSelection().removeAllRanges()
            }
  );
  text_area.addEventListener(
    'keydown',
    (event) => {
      console.log("TAB INTERCEPTED");
      tabs_in_textarea(text_area, event);
    }
  );
}


chrome.runtime.onMessage.addListener(popup_receiver);
function popup_receiver(request, sender, sendResponse){
  console.log("NM.popup: Message received");
  if(request.type === NOTION_MATH_CODES_UPDATED){
    console.log("Message Received with Katex Codes");
    page_codes = request.codes;
    refresh_codes_visualization();
    console.log("NM.popup: Updating popup with new codes");
  }
}

// ------- Load Buttons Listener :
window.addEventListener(
  'load',
  function load(event){
      //---- Trigger Retrive codes from page
      var updateBtn = document.getElementById('btn_retrieve_codes');
      updateBtn.addEventListener(
                'click',
                function() {
                  send_request_for_codes(); }
                );

      // ---- Add the KCode textarea and Preview (empty)
      var addBtn = document.getElementById('btn_add_code');
      addBtn.addEventListener(
                'click',
                function() {
                    add_custom_katex_code();
                    window.location = (""+window.location).replace(/#[A-Za-z0-9_]*$/,'')+custom_codes_div_anchor;
                  }
                );
  }
);

// --------------------- Interface INIT ------------------------------

send_request_for_codes();