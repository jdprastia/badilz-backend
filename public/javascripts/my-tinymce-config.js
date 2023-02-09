tinymce.init({
    selector: 'textarea.tinymce-c1',
    plugins: 'lists link image table code help wordcount',
    toolbar: 'undo redo | styles | bold italic | ' +
    'bullist numlist outdent indent | link image | print preview media fullscreen | ' +
    'forecolor backcolor emoticons | help',
    setup: function (editor) {
        editor.on('change', function () {
            tinymce.triggerSave();
    chkSubmit();
        });
    }
});

tinymce.init({
  selector: 'textarea.tinymce-c2',
  plugins: 'lists link image table code help wordcount',
  toolbar: 'undo redo | styles | bold italic | ' +
    'bullist numlist outdent indent | link image | print preview media fullscreen | ' +
    'forecolor backcolor emoticons | help',
  setup: function (editor) {
      editor.on('change', function () {
          tinymce.triggerSave();
  chkSubmit();
      });
  }
});