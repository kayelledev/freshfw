module Shoppe
  class RolesPermissionsController < Shoppe::ApplicationController
	  # load_and_authorize_resource
    before_filter { @active_nav = :access_management }
	
  	def index
      @roles = Role.all
  	  @permissions = Permission.all
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
