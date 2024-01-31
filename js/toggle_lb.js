const section_div = document.getElementById("section");
const brs = section_div.getElementsByName("br");
const hidden_class_name = "hide_me";

function br_on_word_border(br) {
  return false;
}

function toggle_hide_status(hide_them) {
  if (hide_them) {
    for (br of brs) {
      br.classList.add(hidden_class_name);
    }
  } else {
    for (br of brs) {
      br.classList.remove(hidden_class_name);
    }
  }
}
