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

  // Todo extendings
  Todo.Model = Backbone.Model.extend({
		defaults: function() {
			return {
				title: "empty todo...",
				order: Todos.nextOrder(),
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
  Todo.Views.TodoView = Backbone.View.extend({
		tagname: "li",
    template: _.template( $('#item-template').html() ),
		//template: "app/templates/item-template.html",

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

			/*
      // Fetch the template, render it to the View element and call done.     
 			todo.fetchTemplate(this.template, function(tmpl) {
        view.el.innerHTML = tmpl();

        // If a done function is passed, call it with the element
        if (_.isFunction(done)) {
          done(view.el);
        }
      });*/

			
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

	Todo.Views.AppView = Backbone.View.extend({
		el: $('#todoapp'),
		//statsTemplate: "app/templates/stats-template.html",
		statsTemplate: _.template( $('#stats-template').html() ),
		
		events: {
			"keypress #new-todo": "createOnEnter",
			"click #clear-completed": "clearCompleted",
			"click #toggle-all": "toggleAllComplete"
		},
		
		
		
		initialize: function() {
			this.input = this.$("#new-todo"),
			this.allCheckBox = this.$("#toggle-all")[0];
			
			Todos.bind('add', this.addOne, this);
			Todos.bind('reset', this.addAll, this);
			Todos.bind('all', this.render, this);
			
			this.footer = this.$("footer");
			this.main = $("main");
			
			Todos.fetch();		
		},
		
		render: function() {
			var done = Todos.done().length;
			var remaining = Todos.remaining().length;

			if (Todos.length) {
			  this.main.show();
			  this.footer.show();
			  this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
			} else {
			  this.main.hide();
			  this.footer.hide();
			}
			
		},
		
		addOne: function(todo) {
	    var view = new Todo.Views.TodoView({model: todo});
			this.$("#todo-list").append( view.render().el );
	  },

		addAll: function() {
			Todos.each(this.addOne);
		},
		
		createOnEnter: function(e) {
			if (e.keyCode != 13) return;
			if (!this.input.val()) return;
			Todos.create({title: this.input.val()});
			this.input.val('');
		},
		
		clearCompleted: function() {
			_.each(Todos.done(), function(todo) {
				todo.clear();
			});
			return false;
		},
		
		toggleAllComplete: function() {
			var done = this.allCheckbox.checked;
			Todos.each(function(todo) {
				todo.save({'done': done});
			});
		}
		
	});

	var app = Todo.Views.AppView;

  // Required, return the module for AMD compliance
  return Todo;

});
