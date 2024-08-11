const form = document.querySelector("form");
const imageSubmission = document.querySelector("#image-submit");
const darkModeToggle = document.querySelector("#dark-mode-toggle");
const lum_string =
  " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@".split(
    "",
  );
const lum_levels = [
  0, 0.0751, 0.0829, 0.0848, 0.1227, 0.1403, 0.1559, 0.185, 0.2183, 0.2417,
  0.2571, 0.2852, 0.2902, 0.2919, 0.3099, 0.3192, 0.3232, 0.3294, 0.3384,
  0.3609, 0.3619, 0.3667, 0.3737, 0.3747, 0.3838, 0.3921, 0.396, 0.3984, 0.3993,
  0.4075, 0.4091, 0.4101, 0.42, 0.423, 0.4247, 0.4274, 0.4293, 0.4328, 0.4382,
  0.4385, 0.442, 0.4473, 0.4477, 0.4503, 0.4562, 0.458, 0.461, 0.4638, 0.4667,
  0.4686, 0.4693, 0.4703, 0.4833, 0.4881, 0.4944, 0.4953, 0.4992, 0.5509,
  0.5567, 0.5569, 0.5591, 0.5602, 0.5602, 0.565, 0.5776, 0.5777, 0.5818, 0.587,
  0.5972, 0.5999, 0.6043, 0.6049, 0.6093, 0.6099, 0.6465, 0.6561, 0.6595,
  0.6631, 0.6714, 0.6759, 0.6809, 0.6816, 0.6925, 0.7039, 0.7086, 0.7235,
  0.7302, 0.7332, 0.7602, 0.7834, 0.8037, 1,
];

// Set up
function arrToObj(keys, vals) {
  let map = {};
  keys.forEach(function (key, index) {
    map[key] = vals[index];
  });
  return map;
}

function lumSearch(target, vals) {
  let closest_val = 0;
  let closest_diff = 2;

  for (let i = 0; i < vals.length; i++) {
    const val = vals[i];
    const diff = Math.abs(val - target);

    if (diff < closest_diff) {
      closest_diff = diff;
      closest_val = val;
    }
  }

  return closest_val;
}

function processImage(image, asciiLoc, width, height, theme) {
  let dst = new cv.Mat();
  const src = cv.imread(image);
  const newSize = new cv.Size(width, height);
  const luminosity_mapping =
    theme == "dark" ? luminosity_mapping_dark : luminosity_mapping_light;

  // small + gray scale
  cv.resize(src, dst, newSize, 0, 0, cv.INTER_AREA);
  cv.cvtColor(dst, dst, cv.COLOR_RGBA2GRAY, 0);

  // luminosity
  let lumChars = [];
  for (let row = 0; row < dst.rows; row++) {
    let row_chars = [];
    for (let col = 0; col < dst.cols; col++) {
      const lum = lumSearch(dst.ucharAt(row, col) / 255, lum_levels);
      const lumChar = luminosity_mapping[lum];
      row_chars.push(lumChar);
    }
    lumChars.push(row_chars);
  }

  let output = "";
  for (let row = 0; row < lumChars.length; row++) {
    const output_row = lumChars[row].join("") + "\n";
    output = output + output_row;
  }

  asciiLoc.textContent = output;
}

const luminosity_mapping_dark = arrToObj(lum_levels, lum_string);
const luminosity_mapping_light = arrToObj(lum_levels.toReversed(), lum_string);

// Event handlers
form.onsubmit = (e) => {
  e.preventDefault();
  const imageFile = imageSubmission.files[0];
  const width = Number(document.querySelector("#width-submit").value);
  const height = Number(document.querySelector("#height-submit").value);
  const imageURL = URL.createObjectURL(imageFile);
  const image = document.createElement("img");
  const asciiArt = document.querySelector("#ascii-art");
  const theme = document.querySelector("#theme").value;

  image.src = imageURL;
  image.onload = () => {
    processImage(image, asciiArt, width, height, theme);
  };
};

imageSubmission.onchange = (e) => {
  const imageFile = imageSubmission.files[0];
  const imageURL = URL.createObjectURL(imageFile);
  const image = document.createElement("img");
  const imagePreview = document.querySelector("#image-preview");

  image.width = document.querySelector("#sidebar").offsetWidth;
  image.src = imageURL;
  image.onload = () => {
    if (imagePreview.hasChildNodes()) {
      imagePreview.replaceChild(image, imagePreview.firstChild);
    } else {
      imagePreview.appendChild(image);
    }
  };
};

darkModeToggle.onclick = (e) => {
  const r = document.querySelector(":root");
  const rs = getComputedStyle(r);
  const h = document.querySelector("html");
  const theme = document.querySelector("#theme");

  if (h.style.backgroundColor == rs.getPropertyValue("--latte-background")) {
    h.style.backgroundColor = rs.getPropertyValue("--mocha-background");
    h.style.color = rs.getPropertyValue("--mocha-text");
    theme.value = "dark";
  } else {
    h.style.backgroundColor = rs.getPropertyValue("--latte-background");
    h.style.color = rs.getPropertyValue("--latte-text");
    theme.value = "light";
  }
};
