module Shoppe
  class RolesPermissionsController < Shoppe::ApplicationController
    before_filter { @active_nav = :roles_permissions }
	  load_and_authorize_resource :class => 'Shoppe::RolesPermissionsController'
	
  	def index
      @roles = Role.order('name')
  	  @permissions = Permission.order('controller_class')
    end

    def new
    end

    def create
    end

    def edit
    end

    def update
    end

  end
end
