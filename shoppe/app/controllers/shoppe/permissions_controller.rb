module Shoppe
  class PermissionsController < Shoppe::ApplicationController
	  load_and_authorize_resource
    before_filter { @active_nav = :access_management }
    before_filter { params[:id] && @permission = Permission.find(params[:id]) }
    include AccessManagementProccessor
    
    def new
      @permission = Permission.new
      @controllers = controllers_list
      @actions = [] 
      
    end

    def show
      @controllers = controllers_list
      @actions = [] 
    end

    def edit
      @controllers = controllers_list
      @actions = actions_list(@permission.controller_class)
    end

    def index
      redirect_to :roles_permissions
    end

    def create
      @permission = Permission.new(safe_params)
      if @permission.save
        redirect_to @permission, :flash => {:notice => 'Permission has been created successfully' }
      else
        render :action => "new"
        new
      end
    end

    def update
      if @permission.update(safe_params)
        redirect_to @permission, :flash => {:notice => 'Permission has been updated successfully' }
      else
        edit
        render :action => "edit"
      end
    end

    def destroy
      @permission.destroy
      redirect_to :roles_permissions, :flash => {:notice => 'Permission has been removed successfully'}
    end

    def get_controller_options
      options = []
      val = params[:controller_name]
      options = actions_list(val)
      render :json => options.to_json
    end

    private

    def safe_params
      params[:permission][:role_ids] ||= []
      params[:permission].permit(:name, :subject_class, :action, :role_ids => [] )
    end
  end
end
