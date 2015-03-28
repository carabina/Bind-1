var AddConnection = React.createClass({displayName: "AddConnection",
  getInitialState: function() {
    return {
      gap: "0",
      isHorizontal: true
    };
  },

  addConnections: function(e) {
    e.preventDefault();

    var selected = this.props.selectedElements;
    var direction = $('.add-connection input[name=direction]:checked').val();
    var gap = $('.add-connection input#bind-gap').val();
    var container = $('.add-connection input#bind-container').val();

    selected = selected.toString();
    newSelected = selected.replace(/,/g,")-(");

    if (container == "") {
      gssString = "@"+direction+" ("+newSelected+") gap("+gap+");";
    } else {
      gssString = "@"+direction+" |("+newSelected+")| in("+container+") gap("+gap+");";
    }
    gssEditor.replaceRange(gssString+"\n", {line: Infinity});
  },

  cancelPopover: function() {
    var ev = new CustomEvent('showAddConnection'); 
    ev.initEvent('showAddConnection');
    window.dispatchEvent(ev);
  },

  render: function() {
    var cx = React.addons.classSet;
    var classes = cx({
      'add-connection': true,
      'is-active': this.props.visiblility,
    });

    var modalClasses = cx({
      'modal': true,
      'is-active': this.props.visiblility,
    });
    return (
      React.createElement("div", null, 
        React.createElement("div", {className: classes}, 
          React.createElement("form", {onSubmit: this.addConnections}, 
          React.createElement("div", {className: "add-constraint__element"}, 
            React.createElement("label", null, 
              "Direction"
            ), 
            React.createElement("label", null, React.createElement("input", {type: "radio", name: "direction", defaultChecked: this.state.isHorizontal, value: "h"}), "Horizontal"), 
            React.createElement("label", null, React.createElement("input", {type: "radio", name: "direction", defaultChecked: this.state.isHorizontal, value: "v"}), "Vertical")
          ), 

          React.createElement("div", {className: "add-constraint__element"}, 
            React.createElement("label", null, 
              "Gap"
            ), 
            React.createElement("input", {type: "text", defaultValue: this.state.gap, id: "bind-gap"})
          ), 

          React.createElement("div", {className: "add-constraint__element"}, 
            React.createElement("label", null, 
              "Outer gap"
            ), 
            React.createElement("input", {type: "text", id: "bind-outergap"})
          ), 

          React.createElement("div", {className: "add-constraint__element"}, 
            React.createElement("label", null, 
              "Contained in"
            ), 
            React.createElement("input", {type: "text", id: "bind-container"})
          ), 

          React.createElement("hr", null), 

          React.createElement("div", {className: "add-constraint__element"}, 
            React.createElement("button", {type: "submit"}, "Add connection")
          )
        )
        ), 

        React.createElement("div", {onClick: this.cancelPopover, className: modalClasses})
      )
    );
  }
});

