var req0 = new XMLHttpRequest();
req0.responseType = "arraybuffer";
req0.open("GET", "ftp.bin", true);
req0.send();
req0.onreadystatechange = function () {
  if (req0.readyState == 4) {
    var tmp0 = new Uint8Array(req0.response.byteLength);
    tmp0.set(new Uint8Array(req0.response), 0);
    var payload = new Uint32Array(tmp0);
    for (var i = 0; i < payload.length; i++)
      var getlength = "0x" + req0.response.byteLength.toString(16);
    window.mira_blob_2_len = getlength;
    window.mira_blob_2 = malloc(window.mira_blob_2_len);
    write_mem(window.mira_blob_2, payload);
  }
};
