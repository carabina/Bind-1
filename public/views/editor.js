var selectedEls = [];
var selectedClass = 'bind-element--is-selected';

var Editor = React.createClass({
  componentDidMount: function() {
    document.querySelector('#bindCanvas').contentWindow.document.onclick = function(event){this.handleEditorClick(event)}.bind(this);
    window.addEventListener('willImportFile', this.handleImport);
    window.addEventListener('willSaveFile', this.handleSave);
    window.addEventListener('toggleSidebar', this.toggleSidebar);
    window.addEventListener('toggleProperties', this.toggleProperties);
    window.addEventListener('willPlaceImage', this.willPlaceImage);
    window.addEventListener('showAddElement', this.showAddElement);
    window.addEventListener('showAddConstraint', this.showAddConstraint);
    window.addEventListener('showAddMultipleConstraint', this.showAddMultipleConstraint);
    window.addEventListener('showAddConnection', this.showAddConnection);
  },

  componentWillUnmount: function() {
    window.removeEventListener('willImportFile', this.handleImport);
    window.removeEventListener('willSaveFile', this.handleSave);
    window.removeEventListener('toggleSidebar', this.toggleSidebar);
    window.removeEventListener('toggleProperties', this.toggleProperties);
    window.removeEventListener('willPlaceImage', this.willPlaceImage);
    window.removeEventListener('showAddElement', this.showAddElement);
    window.removeEventListener('showAddConstraint', this.showAddConstraint);
    window.removeEventListener('showAddMultipleConstraint', this.showAddMultipleConstraint);
    window.removeEventListener('showAddConnection', this.showAddConnection);
  },

  componentDidUpdate: function(prevProps, prevState) {
    setTimeout(function(){
      document.querySelector('#bindCanvas').contentWindow.document.onclick = function(event){this.handleEditorClick(event)}.bind(this);
    }.bind(this), 500)
  },

  toggleSidebar: function() {
    document.querySelector('.sidebar').classList.toggle('is-hidden');
    setTimeout(htmlEditor.refresh(), 0);
    setTimeout(cssEditor.refresh(), 0);
    setTimeout(gssEditor.refresh(), 0);
  },

  showAddElement: function() {
    this.setState({
      addElementVisiblility: !this.state.addElementVisiblility
    });
  },

  showAddConstraint: function() {
    this.setState({
      addConstraintVisiblility: !this.state.addConstraintVisiblility
    });
  },

  showAddMultipleConstraint: function() {
    this.setState({
      addMultipleConstraintVisiblility: !this.state.addMultipleConstraintVisiblility
    });
  },

  showAddConnection: function() {
    this.setState({
      addConnectionVisibility: !this.state.addConnectionVisibility
    });
  },

  toggleProperties: function() {
    document.querySelector('.properties-parent').classList.toggle('is-hidden');
  },

  handleImport: function() {
    MacGap.Dialog.openDialog({files: true, callback: function(file){
      console.log(file);
      var content = MacGap.File.read(file[0], 'json');
      htmlEditor.setValue(atob(content.bind.html));
      cssEditor.setValue(atob(content.bind.css));
      gssEditor.setValue(atob(content.bind.gss));
    }});
  },

  handleSave: function() {
    var exportSource = '{"bind": { "css":"'+btoa(this.state.cssToRender)+'","gss":"'+btoa(this.state.gssToRender)+'","html":"'+btoa(this.state.htmlToRender)+'"}}';

    if (this.state.documentHasBeenSaved) {
      MacGap.File.write(this.state.documentHasBeenSaved, exportSource, 'string');
      this.setState({
        documentHasBeenSaved: result.filePath
      });
    } else {
      MacGap.Dialog.saveDialog({title: 'Save document', prompt: 'Save', filename: 'Untitled.bind', allowedTypes: ['bind'], callback: function(result) {
        MacGap.File.write(result.filePath, exportSource, 'string');
        this.setState({
          documentHasBeenSaved: result.filePath
        });
      }})
    }
  },

  willPlaceImage: function() {
    var imgId = "img-" + this.makeId();
    MacGap.Dialog.openDialog({files: true, callback: function(file){
      console.log(file);
      htmlEditor.replaceRange("<img id=" + imgId + " src='file://"+encodeURI(file[0])+"'/>\n", {line: Infinity});
    }});
  },

  getInitialState: function() {
    return {
      selectedElement: null,
      selectedElWidth: null,
      selectedElHeight: null,
      selectedElX: null,
      selectedElY: null,
      htmlToRender: '',
      gssToRender: '',
      cssToRender: '',
      canvasState: '',
      documentHasBeenSaved: null,
      addElementVisiblility: false,
      addConstraintVisiblility: false,
      addMultipleConstraintVisiblility: false,
      addConnectionVisibility: false,
      multipleSelectedElements: false,
      endCruft: '</html>',
      headCruft: '<html><head><link rel="stylesheet" type="text/css" href="css/reset.css"/><link rel="stylesheet" type="text/css" href="css/bind-element.css"/></script><script src="dist/gss.min.js"></script><script type="text/javascript">window.engine = new GSS(document);</script><style type="text/css">.gss-not-ready body { opacity: 0; } .gss-ready body { opacity: 1; }</style></head>',
    };
  },

  renderGss: function(editor) {
    this.setState({
      gssToRender: editor.gss,
      canvasState: this.state.headCruft + this.state.htmlToRender + '<style type="text/gss">' + editor.gss + '</style>' + '<style type="text/css">' + this.state.cssToRender + '</style>'
    });
    this.exportSource();
  },

  renderHtml: function(editor) {
    this.setState({
      htmlToRender: editor.html,
      canvasState: this.state.headCruft + editor.html + '<style type="text/gss">' + this.state.gssToRender + '</style>' + '<style type="text/css">' + this.state.cssToRender + '</style>'
    });
    this.exportSource();
  },

  renderCss: function(editor) {
    this.setState({
      cssToRender: editor.css,
      canvasState: this.state.headCruft + this.state.htmlToRender + '<style type="text/gss">' + this.state.gssToRender + '</style>' + '<style type="text/css">' + editor.css + '</style>'
    });
    this.exportSource();
  },

  exportSource: function() {
    var exportSource = '{"bind": { "css":"'+btoa(this.state.cssToRender)+'","gss":"'+btoa(this.state.gssToRender)+'","html":"'+btoa(this.state.htmlToRender)+'"}}';
    return exportSource;
  },

  handleEditorClick: function(event) {
    if (!event.shiftKey) {
      //Shift key not held
      selectedEls = [];

      var divs = document.querySelector('#bindCanvas').contentWindow.document.body.querySelectorAll('*');

      [].forEach.call(divs, function(div) {
        div.classList.remove(selectedClass);
      });

      if (event.target.id != '') {
        // An element with an ID is selected
        event.target.classList.add(selectedClass);
        selectedEls.push("#" + event.target.id)

        this.setState({
          selectedElement: event.target.id,
          selectedElWidth: event.target.offsetWidth,
          selectedElHeight: event.target.offsetHeight,
          selectedElX: event.target.offsetLeft,
          selectedElY: event.target.offsetTop,
          multipleSelectedElements: false
        });
      } else {
        // Set to none
        this.setState({
          selectedElement: null,
          multipleSelectedElements: false,
          selectedElWidth: null,
          selectedElHeight: null,
          selectedElX: null,
          selectedElY: null,
        });
      }
    } else {
      //Shift key held
      if (event.target.id != '') {
        if (event.target.classList.contains(selectedClass)) {
          // If already selected remove from array
          var i = selectedEls.indexOf(event.target.id);
          selectedEls.splice(i, 1);
          console.log(i);

          event.target.classList.remove(selectedClass);
        } else {
          selectedEls.push("#" + event.target.id)
          event.target.classList.add(selectedClass);
        };

        console.log(selectedEls);

        this.setState({
          multipleSelectedElements: selectedEls
        });
      }
    };
  },

  makeId: function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  },

  render: function() {
    return (
      <div className="EXTENDER">
        <AddElement handleExit={this.showAddElement} visiblility={this.state.addElementVisiblility}/>
        <AddConstraint visiblility={this.state.addConstraintVisiblility} selectedElement={this.state.selectedElement}/>
        <AddMultipleConstraint visiblility={this.state.addMultipleConstraintVisiblility} selectedElements={this.state.multipleSelectedElements}/>
        <AddConnection visiblility={this.state.addConnectionVisibility} selectedElements={this.state.multipleSelectedElements}/>
        <div className="COLS">
          <Sidebar onCssChanged={this.renderCss} onGssChanged={this.renderGss} onHtmlChanged={this.renderHtml}/>
          <div id="canvas" className="COL-FLEX canvas">
            <iframe id="bindCanvas" srcDoc={this.state.canvasState}/>
          </div>
          <PropertiesPanel
            selectedElement={this.state.selectedElement}
            multipleSelectedElements={this.state.multipleSelectedElements}
            left={this.state.selectedElX}
            top={this.state.selectedElY}
            height={this.state.selectedElHeight}
            width={this.state.selectedElWidth}/>
        </div>
      </div>
    );
  }
});

