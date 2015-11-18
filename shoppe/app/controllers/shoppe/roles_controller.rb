module Shoppe
  class RolesController < Shoppe::ApplicationController
	  # load_and_authorize_resource
    before_filter { @active_nav = :access_management }
    before_filter { params[:id] && @role = Role.find(params[:id]) }
	
	def new
  	  @role = Role.new
  	end

  	def show
  	end

  	def edit
    end

    def index
      redirect_to :roles_permissions
    end

    def create
      @role = Role.new(safe_params)
      if @role.save
        redirect_to @role, :flash => {:notice =>  'Role has been created successfully' }
      else
        render :action => "new"
      end
    end

    def update
      if @role.update(safe_params)
        redirect_to @role, :flash => {:notice => 'Role has been updated successfully' }
      else
        render :action => "edit"
      end
    end

    def destroy
      @role.destroy
      redirect_to :roles_permission, :flash => {:notice => 'Role has been removed successfully'}
    end

    private

    def safe_params
      params[:role][:permission_ids] ||= []
      params[:role].permit(:name, :permission_ids => [])
    end

  end
end
