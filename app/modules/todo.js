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
			this.save( {done: !this.get("done")});
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
		tagName: "li",
    	//template: _.template( $('#item-template').html() ),
		template: "app/templates/item-template.html",

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
			var model = this.model.toJSON(),
					view  = this;		
					
			// Fetch the template, render it to the view element and call done.     
	 		todo.fetchTemplate(this.template, function(tmpl) {
				view.$el.html( tmpl(model) );		
     	});
			
			//this.$el.html(this.template(this.model.toJSON()));
			this.$el.toggleClass('done', this.model.get('done'));
			this.input = this.$('.edit');		

			return this;
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
		statsTemplate: "app/templates/stats-template.html",
		
		events: {
			"keypress #new-todo": "createOnEnter",
			"click #clear-completed": "clearCompleted",
			"click #toggle-all": "toggleAllComplete"
		},
		
		initialize: function() {
			this.input = this.$("#new-todo"),
			this.allCheckbox = this.$("#toggle-all")[0];

			Todos.bind('add', this.addOne, this);
			Todos.bind('reset', this.addAll, this);
			Todos.bind('all', this.render, this);
			
			this.footer = this.$("footer");
			this.main = this.$("#main");
			
			Todos.fetch();		
		},
		
		render: function() {
			var done = Todos.done().length;
			var remaining = Todos.remaining().length;

			if (Todos.length) {
			  this.main.show();
			  this.footer.show();
				var footer = this.footer;
			
				todo.fetchTemplate(this.statsTemplate, function(tmpl) {
					footer.html( tmpl( {done: done, remaining: remaining} ) );		
	     	});
			
			} else {
			  this.main.hide();
			  this.footer.hide();
			}
			
			this.allCheckbox.checked = !remaining;
 
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

  // Required, return the module for AMD compliance
  return Todo;

});
