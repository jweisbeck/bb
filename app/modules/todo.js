define([
  "todo",

  // Libs
  "use!backbone",
	"use!localstorage"
  // Modules

  // Plugins
],

function(todo, Backbone, Storage ) {

  // Create a new module
  var Todo = todo.module();
console.log(Todo);
  // Todo extendings
  Todo.Model = Backbone.Model.extend({
		defaults: function() {
			return {
				title: "empty todo...",
				order: Todos.NextOrder(),
				done: false
			};
		},
		
		initialize: function() {
			if (!this.get("title")) {
				this.set({"title": this.defaults.title})
			};
		},
		
		toggle: function() {
			this.save( {done: !this.get("done")})
		},
		
		clear: function() {
			this.destroy();
		}
	});
  
	Todo.Collection = Backbone.Collection.extend({
		model: Todo.Model,
		
		localStorage: new Store("todos-backbone"),
		
		done: function() {
			return this.filter(function(todo) { 
				return todo.get('done'); 
			});
		},

		remaining: function() {
		      return this.without.apply(this, this.done());
		},
		
		nextOrder: function() {
		      if (!this.length) return 1;
		      return this.last().get('order') + 1;
		},
		
		comparator: function(todo) {
			return todo.get('order');
		}
	});
	
	var Todos = new Todo.Collection;
	
  Todo.Router = Backbone.Router.extend({ /* ... */ });

  // This will fetch the tutorial template and render it.
  Todo.Views.Todo = Backbone.View.extend({
		tagname: "li",
		//template: "app/templates/todo.html",
    template: "app/templates/todo-app.html",

		events: {
		      "click .toggle"   : "toggleDone",
		      "dblclick .view"  : "edit",
		      "click a.destroy" : "clear",
		      "keypress .edit"  : "updateOnEnter",
		      "blur .edit"      : "close"
		    },

		initialize: function() {
			this.model.bind('change', this.render, this);
			this.model.bind('destroy', this.render, this);
		},

    render: function(done) {
      var view = this;

			this.$el.html(this.template(this.model.toJSON()));
			this.$el.toggleClass('done', this.model.get('done'));
			this.input = this.$('.edit');
			return this;

      // Fetch the template, render it to the View element and call done.
     /*
 			todo.fetchTemplate(this.template, function(tmpl) {
        view.el.innerHTML = tmpl();

        // If a done function is passed, call it with the element
        if (_.isFunction(done)) {
          done(view.el);
        }
      });
			*/
    },

		toggleDone: function() {
			this.model.toggle();
		},
		
		edit: function() {
			this.$el.addClass('editing');
			this.input.focus();
		},
		
		close: function() {
			var value = this.input.val();
			if (!value) {
				this.clear();
			};
			this.model.save({title: value});
			this.$el.removeClass('editing');
		},
		
		updateOnEnter: function(e) {
			if (e.keyCode == 13){
				this.close();
			}
		},
	
		clear: function() {
			this.model.clear();
		}

  });

  // Required, return the module for AMD compliance
  return Todo;

});
