module Shoppe
  class RolesPermissionsController < Shoppe::ApplicationController
    before_filter { @active_nav = :roles_permissions }
	  load_and_authorize_resource :class => 'Shoppe::RolesPermissionsController'
	
  	def index
      @roles = Role.order('name')
  	  @permissions = Permission.sorted
    end
  end
end
